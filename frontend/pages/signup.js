import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', word_limit: 10000 });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setIsSuccess(res.ok);
    setMessage(res.ok ? 'Signup successful!' : data.detail);
    router.push('/login'); // Redirect to login page after signup
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Create your account</h2>
          <p className="text-xl text-gray-600">Join us and get started today</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6 text-black">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                id="name"
                name="name" 
                type="text"
                required
                placeholder="Enter your name" 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 transition duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                id="email"
                name="email" 
                type="email"
                required
                placeholder="Enter your email" 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 transition duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                id="password"
                name="password" 
                type="password"
                required
                placeholder="Create a password" 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 transition duration-200"
              />
            </div>

            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">Word Limit</label>
              <input 
                id="signup-word-limit"
                name="number" 
                type="number"
                value="10000"
                required
                placeholder="Create a password" 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 transition duration-200"
              />
            </div>
            
            <div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-lg rounded-md py-3 px-4 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition duration-200 hover:scale-[1.02]"
              >
                Sign Up
              </button>
            </div>
          </form>
          
          {message && (
            <div className={`mt-6 p-4 rounded-md text-center ${isSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message}
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-800 transition duration-200">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}