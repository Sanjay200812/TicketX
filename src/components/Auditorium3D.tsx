'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Seat, SeatLayout } from '@/lib/types';
import { inr } from '@/lib/format';

/* ------------------------------------------------------------------ */
/*  Layout → 3D positions                                              */
/* ------------------------------------------------------------------ */

type Placed = { seat: Seat; x: number; y: number; z: number; wide: boolean; tierLabel: string; price: number };

const SEAT_W = 0.56;
const RECLINER_W = 0.86;
const AISLE = 0.95;
const ROW_D = 1.05;
const RECLINER_D = 1.6;
const RISE = 0.26;

function place(layout: SeatLayout) {
  const tierById = Object.fromEntries(layout.tiers.map((t) => [t.id, t]));
  const frontFirst = [...layout.rows].reverse(); // layout lists the back row first
  const placed: Placed[] = [];
  const risers: { z: number; y: number; depth: number; width: number }[] = [];
  let z = 0;
  let y = 0;
  let maxW = 0;
  frontFirst.forEach((row, ri) => {
    const wide = row.tierId === 'recliner' || row.tierId === 'luxe';
    const step = wide ? RECLINER_D : ROW_D;
    if (ri > 0) {
      z += step;
      y += RISE * (wide ? 1.4 : 1);
    }
    const unit = wide ? RECLINER_W : SEAT_W;
    const width = row.cells.reduce((w, c) => w + (c ? unit : AISLE), 0);
    maxW = Math.max(maxW, width);
    let x = -width / 2;
    row.cells.forEach((c) => {
      if (!c) {
        x += AISLE;
        return;
      }
      const t = tierById[c.tierId];
      placed.push({ seat: c, x: x + unit / 2, y, z, wide, tierLabel: t?.label ?? '', price: t?.price ?? 0 });
      x += unit;
    });
    risers.push({ z, y, depth: step, width });
  });
  return { placed, risers, depth: z, height: y, width: maxW };
}

/* ------------------------------------------------------------------ */
/*  Colours                                                           */
/* ------------------------------------------------------------------ */

const TIER_COLOR: Record<string, string> = {
  recliner: '#6b4630', // tan leather
  luxe: '#5a3b2a',
  prime: '#3b2a52', // aubergine velvet
  classic: '#22324a', // navy velvet
  balcony: '#3b2a52',
  first: '#22324a',
  second: '#2a3a2e',
};
const SOLD = new THREE.Color('#34343a');
const SELECTED = new THREE.Color('#ff5a3c');
const HOVER_LIFT = 0.35;

/* ------------------------------------------------------------------ */
/*  Seats (instanced)                                                  */
/* ------------------------------------------------------------------ */

function Seats({
  placed,
  selected,
  onPick,
  onHover,
}: {
  placed: Placed[];
  selected: Set<string>;
  onPick: (s: Seat) => void;
  onHover: (p: Placed | null) => void;
}) {
  const cushions = useRef<THREE.InstancedMesh>(null);
  const backs = useRef<THREE.InstancedMesh>(null);
  const [hover, setHover] = useState<number | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  const geo = useMemo(
    () => ({
      cushion: new RoundedBoxGeometry(1, 0.16, 0.5, 2, 0.05),
      back: new RoundedBoxGeometry(1, 0.62, 0.12, 2, 0.05),
      arm: new RoundedBoxGeometry(0.06, 0.08, 0.5, 1, 0.02),
    }),
    [],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  // Matrices: placed once per layout
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    placed.forEach((pl, i) => {
      const w = (pl.wide ? RECLINER_W : SEAT_W) * 0.86;
      s.set(w, pl.wide ? 1.25 : 1, pl.wide ? 1.35 : 1);
      p.set(pl.x, pl.y + (pl.wide ? 0.34 : 0.38), pl.z);
      cushions.current!.setMatrixAt(i, m.compose(p, q, s));
      s.set(w, pl.wide ? 1.05 : 1, 1);
      p.set(pl.x, pl.y + (pl.wide ? 0.66 : 0.72), pl.z + (pl.wide ? 0.36 : 0.26));
      backs.current!.setMatrixAt(i, m.compose(p, q, s));
    });
    cushions.current!.instanceMatrix.needsUpdate = true;
    backs.current!.instanceMatrix.needsUpdate = true;
    cushions.current!.computeBoundingSphere();
    backs.current!.computeBoundingSphere();
    invalidate();
  }, [placed, invalidate]);

  // Colours: on selection / hover change
  useLayoutEffect(() => {
    const c = new THREE.Color();
    placed.forEach((pl, i) => {
      const sold = pl.seat.status !== 'available';
      if (selected.has(pl.seat.id)) c.copy(SELECTED);
      else if (sold) c.copy(SOLD);
      else {
        c.set(TIER_COLOR[pl.seat.tierId] ?? '#22324a');
        if (hover === i) c.lerp(new THREE.Color('#ffffff'), HOVER_LIFT);
      }
      cushions.current!.setColorAt(i, c);
      backs.current!.setColorAt(i, c);
    });
    cushions.current!.instanceColor!.needsUpdate = true;
    backs.current!.instanceColor!.needsUpdate = true;
    invalidate();
  }, [placed, selected, hover, invalidate]);

  const move = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const i = e.instanceId ?? null;
    if (i === hover) return;
    const ok = i !== null && placed[i].seat.status === 'available';
    setHover(ok ? i : null);
    onHover(ok ? placed[i!] : null);
    document.body.style.cursor = ok ? 'pointer' : 'default';
  };
  const out = () => {
    setHover(null);
    onHover(null);
    document.body.style.cursor = 'default';
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6) return; // was a drag, not a tap
    const i = e.instanceId;
    if (i === undefined) return;
    const pl = placed[i];
    if (pl.seat.status === 'available') onPick(pl.seat);
  };
  useEffect(() => () => void (document.body.style.cursor = 'default'), []);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0.02 }), []);
  useEffect(() => () => mat.dispose(), [mat]);

  return (
    <group>
      <instancedMesh ref={cushions} args={[geo.cushion, mat, placed.length]} onPointerMove={move} onPointerOut={out} onClick={click} castShadow={false} />
      <instancedMesh ref={backs} args={[geo.back, mat, placed.length]} onPointerMove={move} onPointerOut={out} onClick={click} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Room                                                               */
/* ------------------------------------------------------------------ */

function screenTexture(title: string, backdropUrl?: string, onReady?: () => void) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 440;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 1024, 440);
  g.addColorStop(0, '#1d2a3a');
  g.addColorStop(1, '#3a1f1a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 440);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '600 64px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 512, 240, 900);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (backdropUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1024, 440);
      tex.needsUpdate = true;
      onReady?.();
    };
    img.src = backdropUrl;
  }
  return tex;
}

function Room({ width, depth, height, title, backdropUrl, screenScale }: { width: number; depth: number; height: number; title: string; backdropUrl?: string; screenScale: number }) {
  const invalidate = useThree((s) => s.invalidate);
  const tex = useMemo(() => screenTexture(title, backdropUrl, invalidate), [title, backdropUrl, invalidate]);
  useEffect(() => () => tex.dispose(), [tex]);

  const roomW = width + 4;
  const screenW = Math.min(roomW - 1.2, width * 0.95) * screenScale;
  const screenH = screenW / 2.35;
  const front = -4.2;
  const back = depth + 2.5;
  const ceiling = height + 5.2;

  return (
    <group>
      {/* Screen */}
      <mesh position={[0, 1.4 + screenH / 2, front]}>
        <planeGeometry args={[screenW, screenH]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.4 + screenH / 2, front - 0.02]}>
        <planeGeometry args={[screenW + 0.4, screenH + 0.4]} />
        <meshBasicMaterial color="#050505" />
      </mesh>
      {/* Light spill from the screen */}
      <pointLight position={[0, 1.4 + screenH / 2, front + 1.5]} intensity={40} distance={depth + 16} decay={1.5} color="#cfd8ff" />

      {/* Floor and risers */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, (front + back) / 2]}>
        <planeGeometry args={[roomW, back - front]} />
        <meshStandardMaterial color="#1a1212" roughness={1} />
      </mesh>
      <Risers depth={depth} width={roomW} height={height} back={back} />

      {/* Walls and ceiling */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * roomW) / 2, ceiling / 2 - 0.5, (front + back) / 2]} rotation={[0, (-side * Math.PI) / 2, 0]}>
          <planeGeometry args={[back - front, ceiling + 1]} />
          <meshStandardMaterial color="#141014" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, ceiling / 2 - 0.5, back]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[roomW, ceiling + 1]} />
        <meshStandardMaterial color="#0f0c0e" roughness={1} />
      </mesh>
      <mesh position={[0, ceiling, (front + back) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomW, back - front]} />
        <meshStandardMaterial color="#0b090b" roughness={1} />
      </mesh>

      {/* Wall sconces */}
      {Array.from({ length: Math.max(3, Math.round((back - front) / 4)) }).map((_, k, arr) => {
        const z = front + 2 + (k * (back - front - 3)) / (arr.length - 1 || 1);
        return [-1, 1].map((side) => (
          <mesh key={`${k}-${side}`} position={[side * (roomW / 2 - 0.02), 2.6 + (z / depth) * height * 0.6, z]} rotation={[0, (-side * Math.PI) / 2, 0]}>
            <planeGeometry args={[0.9, 0.18]} />
            <meshBasicMaterial color="#ffb36b" toneMapped={false} transparent opacity={0.85} />
          </mesh>
        ));
      })}
    </group>
  );
}

function Risers({ depth, width, height, back }: { depth: number; width: number; height: number; back: number }) {
  // A single stepped block under the seating, so rows sit on carpeted steps
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.6, 0);
    s.lineTo(back, 0);
    s.lineTo(back, height + 0.2);
    s.lineTo(depth + 0.6, height + 0.2);
    s.lineTo(-0.6, 0.02);
    return s;
  }, [depth, height, back]);
  return (
    <mesh rotation={[0, -Math.PI / 2, 0]} position={[-width / 2, 0, 0]}>
      <extrudeGeometry args={[shape, { depth: width, bevelEnabled: false }]} />
      <meshStandardMaterial color="#1f1517" roughness={1} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Camera                                                             */
/* ------------------------------------------------------------------ */

function Rig({ view, room, seatView }: { view: 'overview' | 'seat'; room: { width: number; depth: number; height: number }; seatView: number[] | null }) {
  const ref = useRef<CameraControls>(null);
  const first = useRef(true);
  const size = useThree((s) => s.size);
  // The canvas can measure 0×0 on its first frame; never frame the camera from that
  const aspect = size.width > 0 && size.height > 0 ? size.width / size.height : 0;
  const invalidate = useThree((s) => s.invalidate);
  // Pull back far enough that the whole width of the seating fits, whatever the screen shape
  const overview = useMemo(() => {
    if (!aspect) return null;
    const vfov = (42 * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const fit = (room.width / 2 + 1.2) / Math.tan(hfov / 2);
    const dist = Math.max(room.depth + 8, fit * 0.92);
    return [0, room.height + dist * 0.42, room.depth * 0.45 + dist * 0.82, 0, 0.6, room.depth * 0.32];
  }, [aspect, room]);
  useEffect(() => {
    const c = ref.current;
    if (!c || !overview) return;
    const target = view === 'seat' && seatView ? seatView : overview;
    // Render on demand: ask for frames until the camera settles (the first placement has no transition)
    c.setLookAt(target[0], target[1], target[2], target[3], target[4], target[5], !first.current).then(() => invalidate());
    first.current = false;
    invalidate();
    if (view === 'seat') {
      c.minDistance = c.maxDistance = c.distance;
    } else {
      c.minDistance = 4;
      c.maxDistance = 70;
    }
  }, [view, overview, seatView, invalidate]);
  return (
    <CameraControls
      ref={ref}
      makeDefault
      smoothTime={0.55}
      minPolarAngle={Math.PI * 0.22}
      maxPolarAngle={Math.PI * 0.49}
      minAzimuthAngle={-Math.PI * 0.35}
      maxAzimuthAngle={Math.PI * 0.35}
      dollyToCursor
      truckSpeed={0}
    />
  );
}

/** Renders frames for about a second after mount and whenever deps change, so camera moves and
 *  late layout changes always reach the screen while the canvas otherwise renders on demand. */
function Kick({ deps }: { deps: unknown[] }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let n = 0;
    let raf = 0;
    const tick = () => {
      invalidate();
      if (++n < 70) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return null;
}

/** Mounts once the WebGL root exists; reveals the canvas after its first rendered frame. */
function Ready({ onReady }: { onReady: () => void }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
    const raf = requestAnimationFrame(() => requestAnimationFrame(onReady));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/* ------------------------------------------------------------------ */
/*  Public component                                                   */
/* ------------------------------------------------------------------ */

export type Auditorium3DProps = {
  layout: SeatLayout;
  selected: string[];
  onPick: (seat: Seat) => void;
  title: string;
  backdropUrl?: string;
  large?: boolean;
  view: 'overview' | 'seat';
  /** seat to view the screen from */
  focusSeat?: string | null;
};

export default function Auditorium3D({ layout, selected, onPick, title, backdropUrl, large, view, focusSeat }: Auditorium3DProps) {
  const { placed, depth, height, width } = useMemo(() => place(layout), [layout]);
  const sel = useMemo(() => new Set(selected), [selected]);
  const [hovered, setHovered] = useState<Placed | null>(null);
  const [ready, setReady] = useState(false);

  // The canvas measures its container with a ResizeObserver, which can miss the first layout when it
  // mounts during a route transition. A synthetic resize makes it measure again.
  useEffect(() => {
    const t1 = setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    const t2 = setTimeout(() => window.dispatchEvent(new Event('resize')), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const room = useMemo(() => ({ width, depth, height }), [width, depth, height]);
  const seatView = useMemo(() => {
    const p = placed.find((x) => x.seat.id === focusSeat) ?? placed.find((x) => sel.has(x.seat.id));
    if (!p) return null;
    const eye = p.y + (p.wide ? 1.05 : 1.2);
    // look at the screen centre
    return [p.x, eye, p.z - 0.05, p.x * 0.15, 3.4, -4.2];
  }, [placed, focusSeat, sel]);

  return (
    <div className="relative h-full w-full" style={{ background: '#0b0a0b' }}>
      <Canvas
        frameloop="demand"
        resize={{ scroll: false, debounce: 0 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 42, near: 0.1, far: 300, position: [0, height + 12, depth + 22] }}
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 400ms ease' }}
        aria-label={`3D view of the auditorium for ${title}`}
      >
        <color attach="background" args={['#0b0a0b']} />
        <fog attach="fog" args={['#0b0a0b', depth + 30, depth + 95]} />
        <ambientLight intensity={0.7} />
        <hemisphereLight args={['#d6dcff', '#3a2418', 0.9]} />
        <directionalLight position={[3, 14, depth + 8]} intensity={1.1} />
        <directionalLight position={[-6, 8, -2]} intensity={0.35} color="#ffd2a8" />

        <Room width={width} depth={depth} height={height} title={title} backdropUrl={backdropUrl} screenScale={large ? 1.08 : 0.9} />
        <Seats placed={placed} selected={sel} onPick={onPick} onHover={setHovered} />

        {hovered && view === 'overview' && (
          <Html position={[hovered.x, hovered.y + 1.25, hovered.z]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <div className="whitespace-nowrap rounded-md border border-line-strong bg-panel-3/95 px-2.5 py-1.5 text-[11.5px] text-cream shadow-xl">
              <span className="font-semibold">{hovered.seat.id}</span> · {hovered.tierLabel} · {inr(hovered.price)}
            </div>
          </Html>
        )}

        <Rig view={view} room={room} seatView={seatView} />
        <Kick deps={[view, room, seatView]} />
        <Ready onReady={() => setReady(true)} />
      </Canvas>
    </div>
  );
}
