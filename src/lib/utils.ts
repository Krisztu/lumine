import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import QRCode from 'qrcode'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function detectMusicPlatform(url: string): 'spotify' | 'youtube' | 'apple' | null {
  if (url.includes('spotify.com')) return 'spotify';
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('music.youtube.com')) return 'youtube';
  if (url.includes('music.apple.com')) return 'apple';
  return null;
}

export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data);
  } catch (error) {
    throw new Error('QR kód generálása sikertelen');
  }
}

export function formatTime(time: string): string {
  return new Date(time).toLocaleTimeString('hu-HU', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('hu-HU');
}

export function isCurrentlyInSchool(schedule: any[]): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const today = now.toLocaleDateString('en-CA');

  return schedule.some(lesson => {
    const lessonDate = new Date(lesson.Datum).toLocaleDateString('en-CA');
    if (lessonDate !== today) return false;

    const startTime = new Date(lesson.KezdetIdopont);
    const endTime = new Date(lesson.VegIdopont);
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    return currentTime >= startMinutes && currentTime <= endMinutes;
  });
}