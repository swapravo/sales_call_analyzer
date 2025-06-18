// File: pages/dashboard.js
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { PhoneCall, BarChart2, FileText, Shield, ArrowRight } from 'lucide-react';
import Header from './components/header';
import Footer from './components/footer';


export default function Dashboard() {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const goTo = (path) => router.push(path);
  
  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-indigo-50">
            <Head>
        <title>Sales Call Analyzer | Dashboard</title>
        <meta name="description" content="Upload, transcribe, and analyze your sales calls with advanced AI analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Header */}
      <Header/>

      {/* Main Content */}
      <main className="flex flex-col items-center px-4 py-12">
        <div className="max-w-3xl w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
            Welcome to Your Dashboard
          </h1>
          
          <div className="bg-white shadow-md rounded-lg p-8 mb-10 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Settings Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow transition duration-300">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Account Settings</h3>
                <p className="text-gray-600 mb-4">Manage your profile, subscription, and preferences</p>
                <button 
                  onClick={() => goTo('/settings')} 
                  className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium px-4 py-2 rounded-md hover:shadow-md transition duration-200 w-full"
                >
                  Go to Settings
                </button>
              </div>
              
              {/* Upload Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow transition duration-300">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Files</h3>
                <p className="text-gray-600 mb-4">Upload audio files for automatic transcription</p>
                <button 
                  onClick={() => goTo('/upload')} 
                  className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium px-4 py-2 rounded-md hover:shadow-md transition duration-200 w-full"
                >
                  Upload Files
                </button>
              </div>
              
              {/* Transcriptions Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow transition duration-300 md:col-span-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Transcriptions</h3>
                <p className="text-gray-600 mb-4">Access, edit and manage all your previous transcriptions</p>
                <button 
                  onClick={() => goTo('/transcriptions')} 
                  className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium px-4 py-2 rounded-md hover:shadow-md transition duration-200 w-full"
                >
                  View Transcriptions
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
    <Footer/>
    </div>
  );
}