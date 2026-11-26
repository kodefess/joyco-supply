import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const idNumber = new Intl.NumberFormat("id-ID");

/** 120000 → "Rp 120.000" */
export const rupiah = (value: number) => `Rp ${idNumber.format(value)}`;

/** 1000 → "1.000" */
export const num = (value: number) => idNumber.format(value);

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
