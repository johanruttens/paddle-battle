import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/gameStore';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHaptics() {
  const vibrationEnabled = useGameStore((s) => s.vibrationEnabled);

  const trigger = useCallback(async (type: HapticType = 'light') => {
    if (!vibrationEnabled) return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      // Haptics not available on this device
    }
  }, [vibrationEnabled]);

  const selectionFeedback = useCallback(async () => {
    if (!vibrationEnabled) return;
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      // Ignore
    }
  }, [vibrationEnabled]);

  return { trigger, selectionFeedback };
}

// Global haptics for use in callbacks
let globalHapticsTrigger: ((type: HapticType) => void) | null = null;

export function setGlobalHaptics(trigger: (type: HapticType) => void) {
  globalHapticsTrigger = trigger;
}

export function triggerGlobalHaptics(type: HapticType) {
  if (globalHapticsTrigger) {
    globalHapticsTrigger(type);
  }
}
