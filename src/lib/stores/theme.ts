import { writable } from 'svelte/store';

// Check if browser prefers dark mode
const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Create theme store with browser preference as initial value
export const isDarkMode = writable(prefersDark);

// Function to toggle theme
export function toggleTheme() {
    isDarkMode.update(dark => !dark);
}
