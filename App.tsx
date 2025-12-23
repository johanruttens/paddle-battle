import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useGameStore } from './src/store/gameStore';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { LevelSelectScreen } from './src/screens/LevelSelectScreen';
import { GameScreen } from './src/screens/GameScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

function AppContent() {
  const currentScreen = useGameStore((s) => s.currentScreen);

  switch (currentScreen) {
    case 'menu':
      return <MainMenuScreen />;
    case 'levelSelect':
      return <LevelSelectScreen />;
    case 'game':
      return <GameScreen />;
    case 'stats':
      return <StatsScreen />;
    case 'settings':
      return <SettingsScreen />;
    default:
      return <MainMenuScreen />;
  }
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar hidden />
      <AppContent />
    </GestureHandlerRootView>
  );
}
