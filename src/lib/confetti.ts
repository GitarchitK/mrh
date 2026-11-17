import confetti from 'canvas-confetti';

/**
 * Fires celebration confetti with brand colors (Navy #18264B, Orange #F15B45, Gold #FBBF24, Emerald #10B981)
 */
export function triggerSuccessConfetti() {
  try {
    // Left burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 60,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#F15B45', '#18264B', '#FF8A75', '#10B981', '#F59E0B'],
    });

    // Right burst
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 60,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#F15B45', '#18264B', '#FF8A75', '#10B981', '#F59E0B'],
    });
  } catch (err) {
    console.warn('Confetti error:', err);
  }
}

// Alias for convenience
export const triggerConfetti = triggerSuccessConfetti;
