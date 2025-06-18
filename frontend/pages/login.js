import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(form).toString(),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.access_token);
      setIsSuccess(true);
      setMessage('Login successful!');
      // Short delay before redirect for better UX
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);  
    } else {
      setIsSuccess(false);
      setMessage(data.detail);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Welcome back</h2>
          <p className="text-xl text-gray-600">Log in to access your account</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8 text-black">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                id="username"
                name="username" 
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
                placeholder="Enter your password" 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 transition duration-200"
              />
              <div className="flex justify-end mt-1">
                <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800 transition duration-200">
                  Forgot password?
                </a>
              </div>
            </div>
            
            <div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-lg rounded-md py-3 px-4 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition duration-200 hover:scale-[1.02]"
              >
                Log In
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
              Don't have an account?{' '}
              <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-800 transition duration-200">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}