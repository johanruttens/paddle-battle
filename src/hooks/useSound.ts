import { useCallback, useEffect, useRef } from 'react';
import { Audio, AVPlaybackSource } from 'expo-av';
import { SOUND_URIS, SoundName } from '../utils/soundGenerator';
import { useGameStore } from '../store/gameStore';

// Cache for loaded sounds
const soundCache: Map<SoundName, Audio.Sound> = new Map();

export function useSound() {
  const sfxVolume = useGameStore((s) => s.sfxVolume);
  const isInitialized = useRef(false);
  const soundUrisRef = useRef<Record<SoundName, string>>({} as Record<SoundName, string>);

  // Initialize audio and preload sounds
  useEffect(() => {
    const init = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        // Generate all sound URIs once
        soundUrisRef.current = {
          paddleHit: SOUND_URIS.paddleHit(),
          wallBounce: SOUND_URIS.wallBounce(),
          playerScore: SOUND_URIS.playerScore(),
          aiScore: SOUND_URIS.aiScore(),
          gameStart: SOUND_URIS.gameStart(),
          gameWin: SOUND_URIS.gameWin(),
          gameLose: SOUND_URIS.gameLose(),
          menuSelect: SOUND_URIS.menuSelect(),
          levelUp: SOUND_URIS.levelUp(),
        };

        // Preload commonly used sounds
        await preloadSound('paddleHit');
        await preloadSound('wallBounce');
      } catch (error) {
        console.warn('Failed to initialize audio:', error);
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      soundCache.forEach((sound) => {
        sound.unloadAsync().catch(() => {});
      });
      soundCache.clear();
    };
  }, []);

  const preloadSound = async (name: SoundName) => {
    if (soundCache.has(name)) return;

    try {
      const uri = soundUrisRef.current[name];
      if (!uri) return;

      const { sound } = await Audio.Sound.createAsync(
        { uri } as AVPlaybackSource,
        { shouldPlay: false }
      );
      soundCache.set(name, sound);
    } catch (error) {
      console.warn(`Failed to preload sound ${name}:`, error);
    }
  };

  const playSound = useCallback(async (name: SoundName) => {
    if (sfxVolume <= 0) return;

    try {
      // Try to use cached sound
      let sound = soundCache.get(name);

      if (sound) {
        // Reset and replay cached sound
        await sound.setPositionAsync(0);
        await sound.setVolumeAsync(sfxVolume);
        await sound.playAsync();
      } else {
        // Load and play new sound
        const uri = soundUrisRef.current[name];
        if (!uri) {
          // Generate sound URI if not yet generated
          const uriGenerator = SOUND_URIS[name];
          if (uriGenerator) {
            soundUrisRef.current[name] = uriGenerator();
          }
        }

        const finalUri = soundUrisRef.current[name];
        if (!finalUri) return;

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: finalUri } as AVPlaybackSource,
          { shouldPlay: true, volume: sfxVolume }
        );

        // Cache for future use
        soundCache.set(name, newSound);
      }
    } catch (error) {
      // Silently fail - sounds are non-critical
    }
  }, [sfxVolume]);

  return { playSound };
}

// Global sound player for use in callbacks
let globalSoundPlayer: ((name: SoundName) => void) | null = null;

export function setGlobalSoundPlayer(player: (name: SoundName) => void) {
  globalSoundPlayer = player;
}

export function playGlobalSound(name: SoundName) {
  if (globalSoundPlayer) {
    globalSoundPlayer(name);
  }
}
