import React, { createContext, useContext, useState, useEffect } from 'react';

interface SoundContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playSound: (soundType: 'success' | 'error' | 'click' | 'connection') => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      const { soundEnabled } = JSON.parse(savedSettings);
      return soundEnabled ?? true;
    }
    return true;
  });

  // Update localStorage when soundEnabled changes
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    localStorage.setItem('gameSettings', JSON.stringify({
      ...settings,
      soundEnabled
    }));
  }, [soundEnabled]);

  const [sounds] = useState({
    success: new Audio('/sounds/success.mp3'),
    error: new Audio('/sounds/error.mp3'),
    click: new Audio('/sounds/click.mp3'),
    connection: new Audio('/sounds/connection.mp3')
  });

  const playSound = (soundType: 'success' | 'error' | 'click' | 'connection') => {
    // Only play sound if soundEnabled is true
    if (!soundEnabled) return;

    if (sounds[soundType]) {
      // Reset the audio to start
      sounds[soundType].currentTime = 0;
      // Play the sound
      const playPromise = sounds[soundType].play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Audio play failed:", error);
        });
      }
    }
  };

  return (
    <SoundContext.Provider value={{ 
      soundEnabled, 
      setSoundEnabled,
      playSound
    }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
} 