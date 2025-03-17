import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import icon from '../assets/icon.svg';

function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'feedback',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after submission
      setFormData({
        name: '',
        email: '',
        subject: 'feedback',
        message: ''
      });
      
      // Reset submission status after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
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
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us 📬</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
            
            {isSubmitted ? (
              <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 text-center">
                <p className="text-green-700 font-semibold">Thank you for your message!</p>
                <p className="text-green-600">We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="feedback">Feedback</option>
                    <option value="bug">Report a Bug</option>
                    <option value="feature">Feature Request</option>
                    <option value="question">General Question</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-1">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors
                    ${isSubmitting 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-400 active:bg-blue-600'}`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
          
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-200 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Email</h3>
                    <p className="text-blue-600">support@atribot.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-200 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Phone</h3>
                    <p className="text-blue-600">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-800">How do I reset my progress?</h3>
                  <p className="text-gray-600 text-sm">Visit the Settings page and click on "Reset Progress".</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800">Can I use AtriBOT offline?</h3>
                  <p className="text-gray-600 text-sm">Currently, AtriBOT requires an internet connection to function properly.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800">Is AtriBOT free to use?</h3>
                  <p className="text-gray-600 text-sm">Yes! AtriBOT is completely free for educational purposes.</p>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/tutorials')}
                className="mt-4 w-full py-2 bg-yellow-500 text-white rounded-lg font-semibold 
                  hover:bg-yellow-400 active:bg-yellow-600 transition-colors"
              >
                View All FAQs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact; 