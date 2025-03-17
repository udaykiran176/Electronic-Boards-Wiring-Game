import {  useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import Experiment1 from './experiments/Experiment1'
import Experiment2 from './experiments/Experiment2'
import Experiment3 from './experiments/Experiment3'
import Experiment4 from './experiments/Experiment4'
import Experiment5 from './experiments/Experiment5'
import Experiment6 from './experiments/Experiment6'
import Experiment7 from './experiments/Experiment7'
import Experiment8 from './experiments/Experiment8'
import Experiment9 from './experiments/Experiment9'
import { FullscreenProvider, useFullscreen } from './FullscreenContext'
import icon from './assets/icon.svg'
// Import new pages
import Home from './pages/Home.tsx'
import Tutorials from './pages/Tutorials.tsx'
import Settings from './pages/Settings.tsx'
import About from './pages/About.tsx'
import Contact from './pages/Contact.tsx'
import Custom404 from './pages/Custom404.tsx'
import ExperimentWrapper from './components/ExperimentWrapper'
import { MusicProvider } from './MusicContext'
import { SoundProvider } from './SoundContext'


// Main screen component
function MainScreen() {
  const { setIsFullscreen } = useFullscreen()
  const navigate = useNavigate()

  // Check if device is mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  // Sync fullscreen state with document state
  useEffect(() => {
    const syncFullscreenState = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null
      setIsFullscreen(isCurrentlyFullscreen)
      if (isCurrentlyFullscreen) {
        localStorage.setItem('isFullscreen', 'true')
      }
    }

    document.addEventListener('fullscreenchange', syncFullscreenState)
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState)
  }, [setIsFullscreen])

  const enterFullscreenMode = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      }
      
      // Force landscape orientation
      if (isMobile && 'orientation' in screen && screen.orientation && 'lock' in screen.orientation) {
        try {
          await (screen.orientation as any).lock('landscape')
        } catch (err) {
          console.error('Orientation lock failed:', err)
        }
      }
      
      setIsFullscreen(true)
      localStorage.setItem('isFullscreen', 'true')
    } catch (err) {
      console.error('Error entering fullscreen:', err)
    }
  }

  // Auto-enter fullscreen mode when component loads
  useEffect(() => {
    // Short delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      enterFullscreenMode();
      // Trigger celebration when entering game list
      try {
        triggerCelebration();
      } catch (err) {
        console.error('Error triggering celebration:', err);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps


  const experiments = [
    { id: 1, title: 'Lighting  an LED', path: '/experiment/1', isAvailable: true },
    { id: 2, title: 'Series connection', path: '/experiment/2', isAvailable: true },
    { id: 3, title: 'Parallel connection', path: '/experiment/3', isAvailable: true },
    { id: 4, title: 'Push on/off switch', path: '/experiment/4', isAvailable: true },
    { id: 5, title: 'Tactile switch', path: '/experiment/5', isAvailable: true },
    { id: 6, title: 'Two-way switch', path: '/experiment/6', isAvailable: true },
    { id: 7, title: 'Limit switch ', path: '/experiment/7', isAvailable: true },
    { id: 8, title: 'brightness control', path: '/experiment/8', isAvailable: true },
    { id: 9, title: 'staircase', path: '/experiment/9', isAvailable: true },
  ]

  const triggerCelebration = () => {
    // Fire confetti from both sides with playful colors
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      spread: 360,
      ticks: 100,
      gravity: 0.3,  // Slower falling confetti
      decay: 0.95,   // Stay longer in the air
      startVelocity: 25,
      colors: ['#FF69B4', '#4169E1', '#FFD700', '#98FB98', '#FF6347'], // Bright, kid-friendly colors
      shapes: ['star', 'circle'],  // Fun shapes
    }

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    })

    fire(0.2, {
      spread: 60,
    })

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    })
  }

  const handleExperimentClick = (path: string, isAvailable: boolean) => {
    if (isAvailable) {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-6 w-full max-w-7xl px-4">
     

        <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory">
          {experiments.map((exp) => (
            <div 
              key={exp.id}
              onClick={() => handleExperimentClick(exp.path, exp.isAvailable)}
              className={`flex-none w-64 snap-center ${
                exp.isAvailable 
                  ? 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-200' 
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
              } rounded-xl p-6 transform hover:scale-105 transition-all duration-300 cursor-pointer`}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{exp.title}</h3>
              <p className={`mb-4 ${
                exp.isAvailable 
                  ? 'text-gray-700' 
                  : 'text-gray-500'
              }`}>
                {exp.isAvailable 
                  ? "Click to start this amazing experiment!"
                  : "Get ready for something amazing..."}
              </p>
              <div 
                className={`${
                  exp.isAvailable 
                    ? 'bg-blue-500 hover:bg-blue-400 text-white' 
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
                } py-2 px-4 rounded-lg font-semibold transition-colors duration-300`}
              >
                {exp.isAvailable ? 'Play Now! 🎮' : 'Coming Soon! ⏳'}
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation Menu */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate('/tutorials')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold 
              hover:bg-green-400 active:bg-green-600 transition-colors"
          >
            Tutorials 📚
          </button>
          
          <button
            onClick={() => navigate('/settings')}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold 
              hover:bg-purple-400 active:bg-purple-600 transition-colors"
          >
            Settings ⚙️
          </button>
          
          <button
            onClick={() => navigate('/about')}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold 
              hover:bg-yellow-400 active:bg-yellow-600 transition-colors"
          >
            About Us 🤖
          </button>
          
          <button
            onClick={() => navigate('/contact')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold 
              hover:bg-red-400 active:bg-red-600 transition-colors"
          >
            Contact 📬
          </button>
        </div>
      </div>
    </div>
  )
}

// App component with routing
function App() {
  return (
    <Router basename="/">
      <FullscreenProvider>
        <MusicProvider>
          <SoundProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game" element={<ExperimentWrapper><MainScreen /></ExperimentWrapper>} />
              {/* Remove ExperimentWrapper from experiment routes */}
              <Route path="/experiment/1" element={<Experiment1 />} />
              <Route path="/experiment/2" element={<Experiment2 />} />
              <Route path="/experiment/3" element={<Experiment3 />} />
              <Route path="/experiment/4" element={<Experiment4 />} />
              <Route path="/experiment/5" element={<Experiment5 />} />
              <Route path="/experiment/6" element={<Experiment6 />} />
              <Route path="/experiment/7" element={<Experiment7 />} />
              <Route path="/experiment/8" element={<Experiment8 />} />
              <Route path="/experiment/9" element={<Experiment9 />} />
              {/* New routes */}
              <Route path="/tutorials" element={<Tutorials />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/404" element={<Custom404 />} />
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SoundProvider>
        </MusicProvider>
      </FullscreenProvider>
    </Router>
  )
}

// NotFound component for 404 pages
function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src={icon} alt="icon" className="w-16 h-16" />
          <p className="text-3xl font-bold text-gray-900">AtriBOT</p>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Oops! Page Not Found 🔍
        </h1>
        
        <p className="text-xl text-gray-600 mb-4">
          Oops, looks like the page is lost.
        </p>
        <p className="text-lg text-gray-500 mb-8">
          This is not a fault, just an accident that was not intentional.
        </p>
        
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold 
            hover:bg-blue-400 active:bg-blue-600 transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go Back Home 🏠
        </button>
      </div>
    </div>
  );
}

export default App
