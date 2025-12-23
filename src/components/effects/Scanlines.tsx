import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GAME_HEIGHT } from '../../physics/constants';

const SCANLINE_HEIGHT = 3;
const SCANLINE_COUNT = Math.floor(GAME_HEIGHT / SCANLINE_HEIGHT);

export function Scanlines() {
  const lines = [];

  for (let i = 0; i < SCANLINE_COUNT; i += 2) {
    lines.push(
      <View
        key={i}
        style={[
          styles.scanline,
          { top: i * SCANLINE_HEIGHT },
        ]}
      />
    );
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {lines}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
});
