'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { PhoneCall, BarChart2, FileText, Shield, ArrowRight } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const backToDashboard = () => {
    router.push('/dashboard');
  };

    return(
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white py-6 px-4 md:px-8 backdrop-blur-sm">
        <div className=" mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
              <PhoneCall className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold">Sales Call Analyzer</h1>
          </div>
          <nav className="flex space-x-4">
            <button 
            onClick={backToDashboard}
            className="bg-white bg-opacity-10 text-indigo-600 hover:text-blue-500 hover:font-semibold font-semibold hover:bg-opacity-20 px-4 py-2 rounded-md transition duration-200 cursor-pointer"
          >
            Back to Dashboard
          </button>
            <button 
            onClick={logout}
            className="bg-white bg-opacity-10 text-indigo-600 hover:text-blue-500 hover:font-semibold font-semibold hover:bg-opacity-20 px-4 py-2 rounded-md transition duration-200 cursor-pointer"
          >
            Logout
          </button>

          </nav>
        </div>
      </div>
    )
}
