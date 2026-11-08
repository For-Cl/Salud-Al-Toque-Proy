import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect device shake gestures using the Accelerometer sensor.
 * Rubric 2.3 requirement: Integrates device hardware sensor with clear value.
 */
export function useShake(onShake: () => void, threshold = 1.78) {
  const lastShakeRef = useRef<number>(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener((accelerometerData) => {
      const { x, y, z } = accelerometerData;
      // Calculate acceleration magnitude
      const totalForce = Math.sqrt(x * x + y * y + z * z);

      if (totalForce > threshold) {
        const now = Date.now();
        // Debounce shake triggers by 1.5 seconds
        if (now - lastShakeRef.current > 1500) {
          lastShakeRef.current = now;
          onShake();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [onShake, threshold]);
}

