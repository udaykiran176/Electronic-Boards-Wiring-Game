import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface MusicContextType {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  toggleMusic: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      const { musicEnabled } = JSON.parse(savedSettings);
      return musicEnabled ?? true;
    }
    return true;
  });

  const [volume, setVolume] = useState(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      const { volume } = JSON.parse(savedSettings);
      return volume ?? 0.3; // Default to 30% volume if not set
    }
    return 0.3;
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper function to check if we should play music on current page
  const shouldPlayMusic = (pathname: string) => {
    return pathname === '/game' || pathname.includes('/experiment/');
  };

  // Update localStorage when settings change
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    localStorage.setItem('gameSettings', JSON.stringify({
      ...settings,
      musicEnabled,
      volume
    }));
  }, [musicEnabled, volume]);

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio('/background-music.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        audio.pause();
      } else if (musicEnabled && shouldPlayMusic(location.pathname)) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Music play failed:', error);
          });
        }
      }
    };

    // Handle music based on page and settings
    if (musicEnabled && shouldPlayMusic(location.pathname)) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Music play failed:', error);
        });
      }
    } else {
      audio.pause();
    }

    // Update volume when it changes
    audio.volume = volume;

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Don't pause on cleanup - let the next effect handle it
    };
  }, [musicEnabled, volume, location.pathname]);

  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
  };

  return (
    <MusicContext.Provider value={{ 
      musicEnabled, 
      setMusicEnabled,
      toggleMusic,
      volume,
      setVolume
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
} 