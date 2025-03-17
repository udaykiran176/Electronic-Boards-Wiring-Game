import { useNavigate } from 'react-router-dom';
import icon from '../assets/icon.svg';

function About() {
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
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About AtriBOT 🤖</h1>
        
        <div className="space-y-10">
          {/* Our Mission */}
          <section className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              AtriBOT was created with a simple but powerful mission: to make learning electronics fun, 
              interactive, and accessible to everyone. We believe that understanding how circuits work 
              should be an engaging journey of discovery rather than a daunting technical challenge.
            </p>
            <p className="text-gray-700">
              Through our interactive experiments, we aim to spark curiosity, build confidence, and 
              inspire the next generation of innovators, makers, and problem-solvers.
            </p>
          </section>
          
          {/* Who We Are */}
          <section className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
            <p className="text-gray-700 mb-4">
              We're a passionate team of educators, engineers, and designers who believe in the power 
              of hands-on learning. Our diverse backgrounds in electrical engineering, computer science, 
              and education have come together to create this unique learning platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-3xl">👨‍🔬</span>
                </div>
                <h3 className="font-bold">Dr. Alex Chen</h3>
                <p className="text-sm text-gray-600">Electrical Engineer</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-green-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-3xl">👩‍💻</span>
                </div>
                <h3 className="font-bold">Maya Rodriguez</h3>
                <p className="text-sm text-gray-600">Software Developer</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-purple-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-3xl">👨‍🏫</span>
                </div>
                <h3 className="font-bold">Prof. James Wilson</h3>
                <p className="text-sm text-gray-600">Education Specialist</p>
              </div>
            </div>
          </section>
          
          {/* Our Approach */}
          <section className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Approach</h2>
            <p className="text-gray-700 mb-4">
              We believe in learning by doing. Our interactive experiments allow you to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Build virtual circuits without the risk of damaging components</li>
              <li>Visualize electricity flow and component behavior in real-time</li>
              <li>Learn at your own pace with guided tutorials</li>
              <li>Experiment freely and discover how changes affect circuit behavior</li>
              <li>Develop intuition about electronics through play and exploration</li>
            </ul>
          </section>
          
          {/* Get Involved */}
          <section className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Involved</h2>
            <p className="text-gray-700 mb-4">
              We're always looking to improve and expand our platform. Here's how you can help:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Share feedback about your experience</li>
              <li>Suggest new experiments or features</li>
              <li>Report any issues you encounter</li>
              <li>Spread the word to friends, teachers, and schools</li>
            </ul>
            <button
              onClick={() => navigate('/contact')}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold 
                hover:bg-yellow-400 active:bg-yellow-600 transition-colors"
            >
              Contact Us
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default About; 