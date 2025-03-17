import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import icon from '../assets/icon.svg';

function Home() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Function to handle game navigation with fullscreen
  const navigateToGame = async () => {
    try {
      // Try to enter fullscreen mode
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      
      // Try to lock orientation on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile && 'orientation' in screen && screen.orientation && 'lock' in screen.orientation) {
        try {
          await (screen.orientation as any).lock('landscape');
        } catch (err) {
          console.error('Orientation lock failed:', err);
        }
      }
      
      // Navigate to game page
      navigate('/game');
    } catch (err) {
      console.error('Error entering fullscreen:', err);
      // Navigate anyway if fullscreen fails
      navigate('/game');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-10 w-10" src={icon} alt="AtriBOT" />
                <span className="ml-2 text-2xl font-bold text-gray-900">AtriBOT</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="hidden md:ml-6 md:flex md:space-x-6">
                <button onClick={() => navigate('/tutorials')} className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium">
                  Tutorials
                </button>
                <button onClick={() => navigate('/about')} className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium">
                  About Us
                </button>
                <button onClick={() => navigate('/contact')} className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium">
                  Contact
                </button>
                <button onClick={() => navigate('/settings')} className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium">
                  Settings
                </button>
              </div>
              <button 
                onClick={navigateToGame} 
                className="ml-6 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Play Game
              </button>
              
              {/* Mobile menu button */}
              <div className="md:hidden ml-4">
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-500 hover:bg-blue-50 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
              <button
                onClick={() => {
                  navigate('/tutorials');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-500 hover:bg-blue-50"
              >
                Tutorials
              </button>
              <button
                onClick={() => {
                  navigate('/about');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-500 hover:bg-blue-50"
              >
                About Us
              </button>
              <button
                onClick={() => {
                  navigate('/contact');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-500 hover:bg-blue-50"
              >
                Contact
              </button>
              <button
                onClick={() => {
                  navigate('/settings');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-500 hover:bg-blue-50"
              >
                Settings
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              <span className="block text-blue-600">Learn Electronics</span>
              <span className="block">Through Play! ⚡</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join AtriBOT on an exciting adventure to discover how circuits work! 
              Build, experiment, and have fun while learning real electronics skills.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={navigateToGame}
                className="px-8 py-4 bg-blue-500 text-white rounded-xl font-bold text-lg
                  hover:bg-blue-400 active:bg-blue-600 transition-colors transform hover:scale-105
                  shadow-lg flex items-center"
              >
                <span className="mr-2">Play Games Now!</span>
                <span className="text-2xl">🚀</span>
              </button>
              <button
                onClick={() => navigate('/tutorials')}
                className="px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg
                  hover:bg-green-400 active:bg-green-600 transition-colors transform hover:scale-105
                  shadow-lg flex items-center"
              >
                <span className="mr-2">See Tutorials</span>
                <span className="text-2xl">📚</span>
              </button>
            </div>
          </div>
          <div className="mt-10 lg:mt-0 lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="bg-blue-100 p-6 text-center">
                <div className="inline-block bg-yellow-400 text-yellow-800 px-4 py-1 rounded-full text-sm font-bold mb-4">
                  Featured Game
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Circuit Adventures</h2>
                <p className="text-gray-600 mb-4">Connect LEDs, switches, and more!</p>
              </div>
              <div className="p-6 bg-gradient-to-b from-blue-50 to-white">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-100 rounded-lg p-4 text-center">
                    <span className="text-3xl">💡</span>
                    <p className="font-medium text-gray-800">Light up LEDs</p>
                  </div>
                  <div className="bg-purple-100 rounded-lg p-4 text-center">
                    <span className="text-3xl">🔄</span>
                    <p className="font-medium text-gray-800">Toggle switches</p>
                  </div>
                  <div className="bg-yellow-100 rounded-lg p-4 text-center">
                    <span className="text-3xl">🔋</span>
                    <p className="font-medium text-gray-800">Power circuits</p>
                  </div>
                  <div className="bg-red-100 rounded-lg p-4 text-center">
                    <span className="text-3xl">🎮</span>
                    <p className="font-medium text-gray-800">Learn by doing</p>
                  </div>
                </div>
                <button
                  onClick={navigateToGame}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg font-bold 
                    hover:bg-blue-400 active:bg-blue-600 transition-colors
                    flex items-center justify-center"
                >
                  <span className="mr-2">See All Games!</span>
                  <span className="text-xl">🎮</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 