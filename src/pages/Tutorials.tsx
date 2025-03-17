import { useNavigate } from 'react-router-dom';
import icon from '../assets/icon.svg';

function Tutorials() {
  const navigate = useNavigate();
  
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
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Tutorials & Guides 📚</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Experiment 1 Tutorial */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lighting an LED</h2>
            <p className="text-gray-700 mb-4">
              Learn how to connect a battery to an LED to create a simple circuit.
            </p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Connect the battery's positive terminal (red) to the LED's anode (longer leg)</li>
              <li>Connect the LED's cathode (shorter leg) to the battery's negative terminal (black)</li>
              <li>Watch the LED light up!</li>
            </ol>
            <button
              onClick={() => navigate('/experiment/1')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold 
                hover:bg-blue-400 active:bg-blue-600 transition-colors"
            >
              Try Experiment
            </button>
          </div>
          
          {/* Experiment 2 Tutorial */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Series Connection</h2>
            <p className="text-gray-700 mb-4">
              Learn how to connect multiple LEDs in series to create a chain of lights.
            </p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Connect the battery's positive terminal to the first LED's anode</li>
              <li>Connect the first LED's cathode to the second LED's anode</li>
              <li>Connect the second LED's cathode to the battery's negative terminal</li>
            </ol>
            <button
              onClick={() => navigate('/experiment/2')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold 
                hover:bg-blue-400 active:bg-blue-600 transition-colors"
            >
              Try Experiment
            </button>
          </div>
          
          {/* More tutorials can be added here */}
        </div>
        
        <div className="mt-12 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">General Tips</h2>
          <ul className="list-disc list-inside space-y-3">
            <li>Always match terminal colors: red to red, black to black</li>
            <li>In simulation mode, you can interact with switches and buttons</li>
            <li>Use the Reset button to start over if your circuit isn't working</li>
            <li>Experiment with different connections to see what happens!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Tutorials; 