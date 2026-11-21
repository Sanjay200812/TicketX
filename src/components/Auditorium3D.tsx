'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Seat, SeatLayout } from '@/lib/types';
import { inr } from '@/lib/format';

/* ------------------------------------------------------------------ */
/*  Seat plan → 3D positions                                           */
/* ------------------------------------------------------------------ */

type Placed = { seat: Seat; x: number; y: number; z: number; wide: boolean; tierLabel: string; price: number };
type Step = { z: number; y: number; depth: number; width: number; rail: boolean };

const SEAT_W = 0.56;
const RECLINER_W = 0.9;
const AISLE = 0.95;
const ROW_D = 1.0;
const RECLINER_D = 1.7;
const RISE = 0.24;
const CLASS_GAP = 0.6;
const SIDE_AISLE = 1.3;

function place(layout: SeatLayout) {
  const tierById = Object.fromEntries(layout.tiers.map((t) => [t.id, t]));
  const frontFirst = [...layout.rows].reverse(); // the plan lists the back row first
  const placed: Placed[] = [];
  const steps: Step[] = [];
  let z = 0;
  let y = 0;
  let maxW = 0;
  frontFirst.forEach((row, ri) => {
    const tier = tierById[row.tierId];
    const wide = !!tier?.recliner;
    const depth = wide ? RECLINER_D : ROW_D;
    const newClass = ri > 0 && frontFirst[ri - 1].tierId !== row.tierId;
    if (ri > 0) {
      z += (depth + steps[steps.length - 1].depth) / 2 + (newClass ? CLASS_GAP : 0);
      y += RISE * (wide ? 1.5 : 1) + (newClass ? RISE * 0.6 : 0);
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
      placed.push({ seat: c, x: x + unit / 2, y, z, wide, tierLabel: tier?.label ?? '', price: tier?.price ?? 0 });
      x += unit;
    });
    steps.push({ z, y, depth: depth + (newClass ? CLASS_GAP : 0), width, rail: newClass });
  });
  return { placed, steps, depth: z, height: y, width: maxW + SIDE_AISLE * 2 };
}

/* ------------------------------------------------------------------ */
/*  Colours                                                           */
/* ------------------------------------------------------------------ */

const SOLD = new THREE.Color('#34343a');
const SELECTED = new THREE.Color('#57b56f');
const HOVER_LIFT = 0.35;

/* ------------------------------------------------------------------ */
/*  Seats (instanced)                                                  */
/* ------------------------------------------------------------------ */

function Seats({
  placed,
  colors,
  selected,
  onPick,
  onHover,
}: {
  placed: Placed[];
  colors: Record<string, string>;
  selected: Set<string>;
  onPick: (s: Seat) => void;
  onHover: (p: Placed | null) => void;
}) {
  const cushions = useRef<THREE.InstancedMesh>(null);
  const backs = useRef<THREE.InstancedMesh>(null);
  const arms = useRef<THREE.InstancedMesh>(null);
  const rests = useRef<THREE.InstancedMesh>(null);
  const [hover, setHover] = useState<number | null>(null);
  const invalidate = useThree((s) => s.invalidate);
  const wideCount = useMemo(() => placed.filter((p) => p.wide).length, [placed]);

  const geo = useMemo(
    () => ({
      cushion: new RoundedBoxGeometry(1, 0.17, 0.52, 2, 0.06),
      back: new RoundedBoxGeometry(1, 0.66, 0.13, 2, 0.06),
      arm: new RoundedBoxGeometry(0.07, 0.34, 0.5, 1, 0.03),
      rest: new RoundedBoxGeometry(1, 0.1, 0.42, 2, 0.04),
    }),
    [],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  // Matrices: placed once per plan
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.14);
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    let r = 0;
    placed.forEach((pl, i) => {
      const unit = pl.wide ? RECLINER_W : SEAT_W;
      const w = unit * 0.84;
      s.set(w, pl.wide ? 1.3 : 1, pl.wide ? 1.35 : 1);
      p.set(pl.x, pl.y + (pl.wide ? 0.36 : 0.4), pl.z);
      cushions.current!.setMatrixAt(i, m.compose(p, q, s));
      s.set(w, pl.wide ? 1.05 : 1, 1);
      p.set(pl.x, pl.y + (pl.wide ? 0.72 : 0.76), pl.z + (pl.wide ? 0.38 : 0.27));
      backs.current!.setMatrixAt(i, m.compose(p, tilt, s));
      // one armrest on the left of each seat, one more closing the right end of each block
      s.set(pl.wide ? 1.6 : 1, 1, pl.wide ? 1.3 : 1);
      p.set(pl.x - unit / 2, pl.y + 0.5, pl.z + 0.04);
      arms.current!.setMatrixAt(i * 2, m.compose(p, q, s));
      const next = placed[i + 1];
      const endOfBlock = !next || next.z !== pl.z || Math.abs(next.x - pl.x - unit) > 0.01;
      p.set(pl.x + unit / 2, pl.y + 0.5, pl.z + 0.04);
      s.set(endOfBlock ? (pl.wide ? 1.6 : 1) : 0.0001, 1, 1);
      arms.current!.setMatrixAt(i * 2 + 1, m.compose(p, q, s));
      if (pl.wide && rests.current) {
        s.set(w * 0.9, 1, 1);
        p.set(pl.x, pl.y + 0.26, pl.z - 0.52);
        rests.current.setMatrixAt(r++, m.compose(p, q, s));
      }
    });
    [cushions, backs, arms].forEach((ref) => {
      ref.current!.instanceMatrix.needsUpdate = true;
      ref.current!.computeBoundingSphere();
    });
    if (rests.current) {
      rests.current.instanceMatrix.needsUpdate = true;
      rests.current.computeBoundingSphere();
    }
    invalidate();
  }, [placed, invalidate]);

  // Colours: on selection / hover change
  useLayoutEffect(() => {
    const c = new THREE.Color();
    const white = new THREE.Color('#ffffff');
    let r = 0;
    placed.forEach((pl, i) => {
      const sold = pl.seat.status !== 'available';
      if (selected.has(pl.seat.id)) c.copy(SELECTED);
      else if (sold) c.copy(SOLD);
      else {
        c.set(colors[pl.seat.tierId] ?? '#22324a');
        if (hover === i) c.lerp(white, HOVER_LIFT);
      }
      cushions.current!.setColorAt(i, c);
      backs.current!.setColorAt(i, c);
      if (pl.wide && rests.current) rests.current.setColorAt(r++, c);
    });
    cushions.current!.instanceColor!.needsUpdate = true;
    backs.current!.instanceColor!.needsUpdate = true;
    if (rests.current?.instanceColor) rests.current.instanceColor.needsUpdate = true;
    invalidate();
  }, [placed, colors, selected, hover, invalidate]);

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

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.78, metalness: 0.02 }), []);
  const armMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1b1a1f', roughness: 0.5, metalness: 0.2 }), []);
  useEffect(
    () => () => {
      mat.dispose();
      armMat.dispose();
    },
    [mat, armMat],
  );

  return (
    <group>
      <instancedMesh ref={cushions} args={[geo.cushion, mat, placed.length]} onPointerMove={move} onPointerOut={out} onClick={click} />
      <instancedMesh ref={backs} args={[geo.back, mat, placed.length]} onPointerMove={move} onPointerOut={out} onClick={click} />
      <instancedMesh ref={arms} args={[geo.arm, armMat, placed.length * 2]} raycast={() => null} />
      {wideCount > 0 && <instancedMesh ref={rests} args={[geo.rest, mat, wideCount]} raycast={() => null} />}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Room                                                               */
/* ------------------------------------------------------------------ */

function screenTexture(title: string, backdropUrl?: string, onReady?: () => void) {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 544;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  g.addColorStop(0, '#1d2a3a');
  g.addColorStop(1, '#3a1f1a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '600 72px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 + 24, canvas.width - 120);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (backdropUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // cover-fit the backdrop into the 2.35:1 screen
      const r = Math.max(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * r;
      const h = img.height * r;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      tex.needsUpdate = true;
      onReady?.();
    };
    img.src = backdropUrl;
  }
  return tex;
}

/** A gently curved screen, like a real auditorium's */
function curvedPlane(w: number, h: number, sag: number) {
  const g = new THREE.PlaneGeometry(w, h, 48, 1);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / (w / 2);
    pos.setZ(i, sag * x * x);
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

function Room({ width, depth, height, steps, title, backdropUrl }: { width: number; depth: number; height: number; steps: Step[]; title: string; backdropUrl?: string }) {
  const invalidate = useThree((s) => s.invalidate);
  const tex = useMemo(() => screenTexture(title, backdropUrl, invalidate), [title, backdropUrl, invalidate]);
  useEffect(() => () => tex.dispose(), [tex]);

  const roomW = width + 1.6;
  const screenW = Math.min(roomW - 1.6, Math.max(8, width * 0.92));
  const screenH = screenW / 2.35;
  const front = -4.6;
  const back = depth + 3;
  const ceiling = Math.max(height + 4.8, 1.6 + screenH + 1.6);
  const screenY = 1.5 + screenH / 2;
  const screenGeo = useMemo(() => curvedPlane(screenW, screenH, 0.45), [screenW, screenH]);
  const frameGeo = useMemo(() => curvedPlane(screenW + 0.5, screenH + 0.5, 0.45), [screenW, screenH]);
  useEffect(
    () => () => {
      screenGeo.dispose();
      frameGeo.dispose();
    },
    [screenGeo, frameGeo],
  );

  // Acoustic panels along both side walls
  const panelCount = Math.max(4, Math.round((back - front) / 2.2));
  const panels = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    const p = new THREE.Vector3();
    let k = 0;
    for (let i = 0; i < panelCount; i++) {
      const z = front + 1.4 + (i * (back - front - 2.4)) / (panelCount - 1);
      for (const side of [-1, 1]) {
        p.set(side * (roomW / 2 - 0.06), ceiling * 0.52, z);
        panels.current!.setMatrixAt(k++, m.compose(p, q, s));
      }
    }
    panels.current!.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [panelCount, front, back, roomW, ceiling, invalidate]);

  return (
    <group>
      {/* Screen, masking and stage */}
      <mesh geometry={frameGeo} position={[0, screenY, front - 0.03]}>
        <meshBasicMaterial color="#040404" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={screenGeo} position={[0, screenY, front]}>
        <meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.35, front + 0.9]}>
        <boxGeometry args={[roomW, 0.7, 1.6]} />
        <meshStandardMaterial color="#120d10" roughness={0.9} />
      </mesh>
      {/* Light spill from the screen */}
      <pointLight position={[0, screenY, front + 2]} intensity={45} distance={depth + 18} decay={1.4} color="#cfd8ff" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, (front + back) / 2]}>
        <planeGeometry args={[roomW, back - front]} />
        <meshStandardMaterial color="#1a1214" roughness={1} />
      </mesh>
      <StadiumSteps steps={steps} roomW={roomW} back={back} />

      {/* Walls and ceiling */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * roomW) / 2, ceiling / 2 - 0.5, (front + back) / 2]} rotation={[0, (-side * Math.PI) / 2, 0]}>
          <planeGeometry args={[back - front, ceiling + 1]} />
          <meshStandardMaterial color="#151116" roughness={0.95} />
        </mesh>
      ))}
      <instancedMesh ref={panels} args={[undefined, undefined, panelCount * 2]}>
        <boxGeometry args={[0.1, ceiling * 0.62, 1.7]} />
        <meshStandardMaterial color="#2a1a22" roughness={1} />
      </instancedMesh>
      <mesh position={[0, ceiling / 2 - 0.5, back]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[roomW, ceiling + 1]} />
        <meshStandardMaterial color="#100c0f" roughness={1} />
      </mesh>
      <mesh position={[0, ceiling, (front + back) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomW, back - front]} />
        <meshStandardMaterial color="#0b090b" roughness={1} />
      </mesh>

      {/* Projection window and a faint beam toward the screen */}
      <mesh position={[0, ceiling - 1.1, back - 0.02]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.1, 0.5]} />
        <meshBasicMaterial color="#e8eeff" toneMapped={false} />
      </mesh>
      <ProjectorBeam from={[0, ceiling - 1.1, back - 0.1]} to={[0, screenY, front]} spread={screenW * 0.46} />

      {/* Wall sconces */}
      {Array.from({ length: Math.max(3, Math.round((back - front) / 4)) }).map((_, k, arr) => {
        const z = front + 2 + (k * (back - front - 3)) / (arr.length - 1 || 1);
        return [-1, 1].map((side) => (
          <mesh key={`${k}-${side}`} position={[side * (roomW / 2 - 0.12), 2.4 + Math.max(0, z / Math.max(depth, 1)) * height * 0.7, z]} rotation={[0, (-side * Math.PI) / 2, 0]}>
            <planeGeometry args={[0.7, 0.16]} />
            <meshBasicMaterial color="#ffb36b" toneMapped={false} transparent opacity={0.9} />
          </mesh>
        ));
      })}

      {/* Exit signs by the front doors */}
      {[-1, 1].map((side) => (
        <mesh key={`exit-${side}`} position={[side * (roomW / 2 - 0.13), 2.6, front + 1.2]} rotation={[0, (-side * Math.PI) / 2, 0]}>
          <planeGeometry args={[0.6, 0.22]} />
          <meshBasicMaterial color="#2fdc6b" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** One carpeted step per row, with amber step lights at the aisle ends and rails between classes */
function StadiumSteps({ steps, roomW, back }: { steps: Step[]; roomW: number; back: number }) {
  const blocks = useRef<THREE.InstancedMesh>(null);
  const lights = useRef<THREE.InstancedMesh>(null);
  const invalidate = useThree((s) => s.invalidate);
  const rails = steps.filter((s) => s.rail);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    steps.forEach((st, i) => {
      const nextZ = i + 1 < steps.length ? steps[i + 1].z - steps[i + 1].depth / 2 : back;
      const start = st.z - st.depth / 2;
      const len = Math.max(0.2, nextZ - start);
      const h = Math.max(0.02, st.y);
      s.set(roomW, h, len);
      p.set(0, h / 2, start + len / 2);
      blocks.current!.setMatrixAt(i, m.compose(p, q, s));
      // step lights on both side aisles
      s.set(1, 1, 1);
      for (const side of [-1, 1]) {
        p.set(side * (roomW / 2 - 0.55), h + 0.012, start + 0.08);
        lights.current!.setMatrixAt(i * 2 + (side > 0 ? 1 : 0), m.compose(p, q, s));
      }
    });
    blocks.current!.instanceMatrix.needsUpdate = true;
    lights.current!.instanceMatrix.needsUpdate = true;
    blocks.current!.computeBoundingSphere();
    invalidate();
  }, [steps, roomW, back, invalidate]);

  return (
    <group>
      <instancedMesh ref={blocks} args={[undefined, undefined, steps.length]} raycast={() => null}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#221619" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={lights} args={[undefined, undefined, steps.length * 2]} raycast={() => null}>
        <boxGeometry args={[0.5, 0.02, 0.05]} />
        <meshBasicMaterial color="#ffae4a" toneMapped={false} />
      </instancedMesh>
      {rails.map((r) => (
        <mesh key={r.z} position={[0, r.y + 0.55, r.z - r.depth / 2 + 0.12]} raycast={() => null}>
          <boxGeometry args={[r.width + 0.4, 0.05, 0.05]} />
          <meshStandardMaterial color="#8a8f99" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function ProjectorBeam({ from, to, spread }: { from: [number, number, number]; to: [number, number, number]; spread: number }) {
  const { geometry, position, quaternion } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const len = a.distanceTo(b);
    const g = new THREE.ConeGeometry(spread, len, 32, 1, true);
    g.translate(0, -len / 2, 0);
    const dir = b.clone().sub(a).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    return { geometry: g, position: a, quaternion: q };
  }, [from, to, spread]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} position={position} quaternion={quaternion} raycast={() => null}>
      <meshBasicMaterial color="#b8c8ff" transparent opacity={0.035} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
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
    const fit = (room.width / 2 + 0.8) / Math.tan(hfov / 2);
    // Portrait phones would have to pull far back to fit the width; crop the side aisles instead
    const dist = Math.max(room.depth + 8, fit * (aspect < 1 ? 0.72 : 0.95));
    return [0, room.height + dist * 0.45, room.depth * 0.45 + dist * 0.8, 0, 0.8, room.depth * 0.3];
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
      c.maxDistance = 90;
    }
  }, [view, overview, seatView, invalidate]);
  return (
    <CameraControls
      ref={ref}
      makeDefault
      smoothTime={0.55}
      minPolarAngle={Math.PI * 0.2}
      maxPolarAngle={Math.PI * 0.49}
      minAzimuthAngle={-Math.PI * 0.38}
      maxAzimuthAngle={Math.PI * 0.38}
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
  /** colour per seat class id */
  tierColor: Record<string, string>;
  selected: string[];
  onPick: (seat: Seat) => void;
  title: string;
  backdropUrl?: string;
  view: 'overview' | 'seat';
  /** seat to view the screen from */
  focusSeat?: string | null;
};

export default function Auditorium3D({ layout, tierColor, selected, onPick, title, backdropUrl, view, focusSeat }: Auditorium3DProps) {
  const { placed, steps, depth, height, width } = useMemo(() => place(layout), [layout]);
  const sel = useMemo(() => new Set(selected), [selected]);
  const [hovered, setHovered] = useState<Placed | null>(null);
  const [ready, setReady] = useState(false);

  // The canvas measures its container with a ResizeObserver, which can miss the first layout when it
  // mounts during a transition. A synthetic resize makes it measure again.
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
    const eye = p.y + (p.wide ? 1.0 : 1.18);
    const screenH = Math.max(8, (width - SIDE_AISLE * 2) * 0.92) / 2.35;
    // look at the screen centre
    return [p.x, eye, p.z - 0.05, p.x * 0.12, 1.5 + screenH / 2, -4.6];
  }, [placed, focusSeat, sel, width]);

  return (
    <div className="relative h-full w-full" style={{ background: '#0b0a0b' }}>
      <Canvas
        frameloop="demand"
        resize={{ scroll: false, debounce: 0 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 42, near: 0.1, far: 400, position: [0, height + 12, depth + 22] }}
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 400ms ease' }}
        aria-label={`3D view of the auditorium for ${title}`}
      >
        <color attach="background" args={['#0b0a0b']} />
        <fog attach="fog" args={['#0b0a0b', depth * 1.6 + 60, depth * 3 + 220]} />
        <ambientLight intensity={0.75} />
        <hemisphereLight args={['#d6dcff', '#3a2418', 0.85]} />
        <directionalLight position={[3, 16, depth + 8]} intensity={1.05} />
        <directionalLight position={[-6, 8, -2]} intensity={0.35} color="#ffd2a8" />

        <Room width={width} depth={depth} height={height} steps={steps} title={title} backdropUrl={backdropUrl} />
        <Seats placed={placed} colors={tierColor} selected={sel} onPick={onPick} onHover={setHovered} />

        {hovered && view === 'overview' && (
          <Html position={[hovered.x, hovered.y + 1.3, hovered.z]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
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
