import { useNavigate } from 'react-router-dom';
import icon from '../assets/icon.svg';

function Custom404() {
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
        
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold 
              hover:bg-blue-400 active:bg-blue-600 transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go Back Home 🏠
          </button>
          
          <button
            onClick={() => navigate('/tutorials')}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold 
              hover:bg-green-400 active:bg-green-600 transition-colors
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            View Tutorials 📚
          </button>
        </div>
      </div>
    </div>
  );
}

export default Custom404; 