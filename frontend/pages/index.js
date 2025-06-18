// File: pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import { PhoneCall, BarChart2, FileText, Shield, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Sales Call Analyzer | Elevate Your Sales Performance</title>
        <meta name="description" content="Upload, transcribe, and analyze your sales calls with advanced AI analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Modern gradient header with glass effect */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white py-6 px-4 md:px-8 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
              <PhoneCall className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold">Sales Call Analyzer</h1>
          </div>
          <nav className="flex space-x-4">
            <Link href="/login">
              <span className="px-4 py-2 hover:bg-white hover:text-indigo-600 hover:bg-opacity-10 rounded-lg transition-all duration-200 font-medium">Login</span>
            </Link>
            <Link href="/signup">
              <span className="px-5 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:shadow-lg transition-all duration-200">Sign Up</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        {/* Hero section with modern gradient */}
        <section className="bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-20 px-4 md:px-8 flex-grow flex flex-col items-center justify-center relative overflow-hidden">
          {/* Abstract background elements */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute -right-56 -top-40 w-96 h-96 rounded-full bg-indigo-500 filter blur-3xl"></div>
            <div className="absolute -left-20 top-1/3 w-72 h-72 rounded-full bg-purple-500 filter blur-3xl"></div>
            <div className="absolute right-1/4 bottom-0 w-80 h-80 rounded-full bg-blue-500 filter blur-3xl"></div>
          </div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
              Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Sales Performance</span>
            </h2>
            <p className="mt-6 text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto font-light">
              Upload, transcribe, and analyze your sales calls with powerful AI. Get insights on pitch, confidence, tonality, and more.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">
              <Link href="/signup">
                <span className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all duration-300 text-lg flex items-center justify-center group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features section with card design */}
        <section className="py-24 px-4 md:px-8 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
              Powerful Features
            </h3>
            <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16">
              Everything you need to transform your sales conversations into actionable insights
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl inline-block mb-6">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">AI Transcription</h4>
                <p className="text-gray-600">Get accurate transcriptions of all your sales calls in minutes</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl inline-block mb-6">
                  <BarChart2 className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">Deep Analytics</h4>
                <p className="text-gray-600">Analyze pitch, confidence, tonality, energy and more</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl inline-block mb-6">
                  <PhoneCall className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">Call Management</h4>
                <p className="text-gray-600">Upload and organize all your sales calls in one place</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-500 p-3 rounded-xl inline-block mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">Secure Platform</h4>
                <p className="text-gray-600">Enterprise-grade security for all your sensitive call data</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern gradient footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-10 p-2 rounded-lg mr-3">
                <PhoneCall className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-xl font-semibold">Sales Call Analyzer</span>
            </div>
            <p className="mt-3 text-gray-300 max-w-md">Elevate your sales performance with AI-powered insights and actionable recommendations</p>
            

          </div>
                      <div className="mt-6 flex space-x-4">
              <a href="#" className="bg-white bg-opacity-10 hover:bg-opacity-20 p-2 rounded-full transition-all duration-200">
                <svg className="h-5 w-5" fill="indigo" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="bg-white bg-opacity-10 hover:bg-opacity-20 p-2 rounded-full transition-all duration-200">
                <svg className="h-5 w-5" fill="indigo" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="bg-white bg-opacity-10 hover:bg-opacity-20 p-2 rounded-full transition-all duration-200">
                <svg className="h-5 w-5" fill="indigo" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center md:text-left text-gray-400">
          &copy; {new Date().getFullYear()} Sales Call Analyzer. All rights reserved.
        </div>
      </footer>
    </div>
  );
}