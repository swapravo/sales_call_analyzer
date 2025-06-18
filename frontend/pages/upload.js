// File: pages/upload.js
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PhoneCall, BarChart2, FileText, Shield, ArrowRight } from 'lucide-react';
import Header from './components/header';
import Footer from './components/footer';


export default function Upload() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files);
    setFiles(fileList);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const fileList = Array.from(e.dataTransfer.files);
    setFiles(fileList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) {
      setSuccess(false);
      setMessage('Please select files or a folder to upload.');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file, file.webkitRelativePath || file.name);
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Upload failed');

      setSuccess(true);
      setMessage(result.message);
      setFiles([]);
    } catch (err) {
      setSuccess(false);
      setMessage(err.message);
    }
  };
    const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
            <Head>
        <title>Sales Call Analyzer | Upload</title>
        <meta name="description" content="Upload, transcribe, and analyze your sales calls with advanced AI analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />    
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Upload Audio Files</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your audio files or folders for processing
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="p-8">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div 
                className={`mb-8 border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition duration-300 ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <p className="text-gray-700 font-medium mb-1">Drag and drop files here</p>
                <p className="text-gray-600 text-sm">or select files manually</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="font-semibold block mb-2 text-gray-700">Select Individual Files:</label>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    className="block w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-indigo-600 file:to-purple-600 file:text-white hover:file:opacity-90 transition duration-200"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-2 text-gray-700">Or Select a Folder:</label>
                  <input 
                    type="file" 
                    multiple 
                    webkitdirectory="true" 
                    directory="true" 
                    onChange={handleFileChange} 
                    className="block w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-indigo-600 file:to-purple-600 file:text-white hover:file:opacity-90 transition duration-200"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full py-3 px-4 rounded-lg text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition duration-200 shadow-md"
                >
                  Upload Files
                </button>
              </div>
            </form>

            {files.length > 0 && (
              <div className="mt-8 bg-gray-50 border border-gray-200 p-5 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Files Selected ({files.length})</h3>
                <div className="max-h-60 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="text-sm border-b border-gray-200 py-2 flex items-center">
                      <svg className="w-4 h-4 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                      <span className="text-gray-700 truncate">{file.webkitRelativePath || file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message && (
              <div className={`mt-6 p-4 rounded-lg ${
                success 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {success ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                  )}
                  {message}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}