import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../MusicContext';
import icon from '../assets/icon.svg';

export default function Settings() {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { musicEnabled, setMusicEnabled } = useMusic();
  
  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSoundEnabled(settings.soundEnabled ?? true);
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('gameSettings', JSON.stringify({
      soundEnabled,
      musicEnabled
    }));
  }, [soundEnabled, musicEnabled]);

  const handleResetGame = () => {
    // Clear all game progress from localStorage
    localStorage.removeItem('gameProgress');
    localStorage.removeItem('connections');
    localStorage.removeItem('experimentState');
    
    // Show confirmation message
    alert('Game progress has been reset successfully! 🔄');
    
    // Navigate back to home
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      {/* Header */}
      <div className="w-full max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={icon} alt="AtriBOT" className="w-12 h-12" />
            <p className="text-2xl font-bold text-gray-900">AtriBOT</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold 
              hover:bg-blue-400 active:bg-blue-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings ⚙️</h1>
        
        <div className="space-y-8">
          {/* Sound Settings */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Sound</h2>
            <div className="flex items-center justify-between">
              <label htmlFor="sound-toggle" className="text-lg text-gray-700">
                Enable Sound Effects
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                <input
                  id="sound-toggle"
                  type="checkbox"
                  className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
                  checked={soundEnabled}
                  onChange={() => setSoundEnabled(!soundEnabled)}
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${soundEnabled ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label htmlFor="music-toggle" className="text-lg text-gray-700">
                Enable Background Music
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                <input
                  id="music-toggle"
                  type="checkbox"
                  className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
                  checked={musicEnabled}
                  onChange={() => setMusicEnabled(!musicEnabled)}
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${musicEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${musicEnabled ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </div>
          </div>
                    {/* Other Settings */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Other Settings</h2>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all game progress? This cannot be undone!')) {
                    handleResetGame();
                  }
                }}
                className="w-full py-4 bg-red-500 text-white rounded-lg font-semibold 
                  hover:bg-red-400 active:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Reset Game Progress
              </button>
              <p className="text-sm text-gray-500 text-center">
                This will reset all your progress and start the game fresh
              </p>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={() => {
                // Show success message
                alert('Settings saved successfully!');
              }}
              className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold 
                hover:bg-green-400 active:bg-green-600 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 