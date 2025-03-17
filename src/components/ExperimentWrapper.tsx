import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFullscreen } from '../FullscreenContext';
import confetti from 'canvas-confetti';

interface ExperimentWrapperProps {
  children: ReactNode;
}

const ExperimentWrapper = ({ children }: ExperimentWrapperProps) => {
  const navigate = useNavigate();
  const { setIsFullscreen } = useFullscreen();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const triggerCelebration = () => {
    try {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        spread: 360,
        ticks: 100,
        gravity: 0.3,
        decay: 0.95,
        startVelocity: 25,
        colors: ['#FF69B4', '#4169E1', '#FFD700', '#98FB98', '#FF6347'],
        shapes: ['star', 'circle'],
      };

      function fire(particleRatio: number, opts: any) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } catch (err) {
      console.error('Error triggering celebration:', err);
    }
  };

  const handleBackToHome = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        
        if (isMobile && 'orientation' in screen && screen.orientation && 'unlock' in screen.orientation) {
          await (screen.orientation as any).unlock();
        }
        
        setIsFullscreen(false);
        localStorage.setItem('isFullscreen', 'false');
      }
      
      triggerCelebration();
      navigate('/');
    } catch (err) {
      console.error('Error exiting fullscreen:', err);
      navigate('/');
    }
  };

  return (
    <div className="experiment-container">
      {children}
      <button
        onClick={handleBackToHome}
        className="fixed top-4 right-4 px-3 py-1.5 bg-red-500 text-white rounded-lg 
          font-semibold hover:bg-red-400 active:bg-red-600 transition-colors
          flex items-center gap-1 shadow-lg z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        Back to Home
      </button>
    </div>
  );
};

export default ExperimentWrapper; 