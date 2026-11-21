/** Display names for the codes cinemas use in their listings */

const UPPER = new Set(['2D', '3D', '4DX', 'IMAX', 'MS', 'PXL', 'ICE', 'EPIQ', 'MX4D', 'P[XL]', 'LED', 'ONYX', 'DTS', 'RGB', 'SCREENX', 'XL', 'VIP', 'IMAX-3D']);

/** "4DX-3D" → "4DX 3D", "MS INFINITY VISION 3D" → "MS Infinity Vision 3D" */
export function formatName(raw: string): string {
  const s = (raw || '2D').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  return s
    .split(' ')
    .map((w) => (UPPER.has(w.toUpperCase()) || /^\d/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
}

/** "PLATINUM(RECLINERS)" → "Platinum (Recliners)", "3D EXECUTIVEP" → "3D Executive P" */
export function className(label: string): string {
  const s = label
    .replace(/\(/g, ' (')
    .replace(/\s+/g, ' ')
    .replace(/EXECUTIVEP\b/i, 'EXECUTIVE P')
    .replace(/\bCL\b/i, 'CLASS')
    .trim();
  return s
    .split(' ')
    .map((w) => {
      const lead = w.startsWith('(') ? '(' : '';
      const core = lead ? w.slice(1) : w;
      if (/^\d+D$/i.test(core) || /^(VIP|4DX|IMAX)$/i.test(core)) return lead + core.toUpperCase();
      return lead + core.charAt(0).toUpperCase() + core.slice(1).toLowerCase();
    })
    .join(' ');
}

/** Wide seats: recliners, loungers, sofas, beds and other premium classes */
export function isReclinerClass(label: string): boolean {
  return /reclin|lounge|sofa|bed|couch|insignia|director|luxe|lux\b|cuddle|duo|gold class|platinum/i.test(label);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
}
