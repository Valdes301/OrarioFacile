import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeToMinutes(time: string): number {
  if (!time || !time.includes(':')) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function calculateDuration(startTime: string, endTime: string): number {
    return timeToMinutes(endTime) - timeToMinutes(startTime);
}

export function formatDuration(totalMinutes: number): string {
    if (totalMinutes < 60) {
        return `${totalMinutes}m`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (minutes === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
}

export function hexToRgba(hex: string, opacity: number): string {
  if (hex.startsWith('rgba')) {
    return hex.replace(/[\d.]+\)$/, `${opacity})`);
  }

  let c: any;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){
          c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+opacity+')';
  }
  // Fallback for invalid hex
  return `rgba(0,0,0,${opacity})`;
}

export function rgbaToHex(rgba: string): { hex: string, alpha: number } {
  if (rgba.startsWith('#')) {
    return { hex: rgba, alpha: 1 };
  }
  
  const parts = rgba.substring(rgba.indexOf("(") + 1, rgba.lastIndexOf(")")).split(/,\s*/);
  
  if (parts.length < 3) {
      // Fallback for invalid or hex color
      return { hex: '#000000', alpha: 1 };
  }

  const r = parseInt(parts[0], 10);
  const g = parseInt(parts[1], 10);
  const b = parseInt(parts[2], 10);
  const alpha = parts.length === 4 ? parseFloat(parts[3]) : 1;

  const toHex = (c: number) => ("0" + c.toString(16)).slice(-2);
  
  return {
    hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
    alpha: alpha
  };
}

export function getRgbaOpacity(rgba: string): number {
    if (rgba.startsWith('#')) return 1;

    const parts = rgba.substring(rgba.indexOf("(") + 1, rgba.lastIndexOf(")")).split(/,\s*/);
    if (parts.length === 4) {
        return parseFloat(parts[3]);
    }
    return 1;
}
