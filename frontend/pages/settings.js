// File: pages/settings.js
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PhoneCall, BarChart2, FileText, Shield, ArrowRight, X } from 'lucide-react';
import Script from 'next/script';
import Header from './components/header';
import Footer from './components/footer';

export default function Settings() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [minutes, setminutes] = useState(10000);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [success, setSuccess] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('INR_900_1000');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
          setEmail(data.email);
          setName(data.name || '');
          setminutes(data.minutes);
        })
        .catch(() => setProfile(null));
    }
  }, [token, router]);

  const updateProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, name, minutes: parseInt(minutes) }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Profile update failed');

      setSuccess(true);
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 5000);

      if (email !== profile.email) {
        setProfileMessage('Email changed. Please log in again.');
        setTimeout(() => logout(), 2000);
      }
    } catch (err) {
      setSuccess(false);
      setProfileMessage(err.message);
      setTimeout(() => setProfileMessage(''), 5000);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setSuccess(false);
      setPasswordMessage('New passwords do not match');
      setTimeout(() => setPasswordMessage(''), 5000);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/settings/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Password change failed');

      setSuccess(true);
      setPasswordMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(''), 5000);
    } catch (err) {
      setSuccess(false);
      setPasswordMessage(err.message);
      setTimeout(() => setPasswordMessage(''), 5000);
    }
  };

  const initiatePayment = async () => {
    let [currency, amountRaw, minutes] = selectedPlan.split('_');
    const amount = parseInt(currency === 'USD' ? amountRaw * 100 : amountRaw * 100); // cents/paise
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/create-payment-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, currency }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to create order');
      
      // Initialize Razorpay
      const options = {
        key: 'rzp_live_IyaF7ZcsTcKpgL', // Replace with env var in production
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: 'Call Support',
        description: `${minutes} minute package`,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }),
            });
            
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.detail || 'Verification failed');
            
            setSuccess(true);
            setPaymentMessage(verifyData.message || 'Payment successful!');
            setShowPricingModal(false);
            
            // Refresh profile to get updated minutes
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/settings`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .then((data) => {
                setProfile(data);
                setminutes(data.minutes);
              });
              
            setTimeout(() => setPaymentMessage(''), 5000);
          } catch (err) {
            setSuccess(false);
            setPaymentMessage(`Payment verification error: ${err.message}`);
            setTimeout(() => setPaymentMessage(''), 5000);
          }
        },
        theme: {
          color: '#4CAF50'
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setSuccess(false);
      setPaymentMessage(`Payment initialization error: ${err.message}`);
      setTimeout(() => setPaymentMessage(''), 5000);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
            <Head>
        <title>Sales Call Analyzer | Settings</title>
        <meta name="description" content="Upload, transcribe, and analyze your sales calls with advanced AI analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
        
    <Header/>

      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">User Settings</h1>
          <p className="mt-2 text-xl text-gray-600 font-light">Manage your account preferences and security</p>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 mb-8 transition-shadow duration-300 hover:shadow-lg">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
          </div>
          
          {profile ? (
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Name:</span> {profile.name || 'Not set'}</p>
              <p><span className="font-medium">Email:</span> {profile.email}</p>
              <p><span className="font-medium">minutes:</span> {profile.minutes}</p>
            </div>
          ) : (
            <div className="py-4 flex justify-center">
              <div className="h-6 w-6 border-2 border-t-indigo-600 border-r-indigo-600 border-b-purple-600 border-l-purple-600 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Update Profile Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 mb-8 transition-shadow duration-300 hover:shadow-lg text-black">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Update Profile</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email:</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200" 
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Name:</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200" 
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">minutes:</label>
              <div className="flex gap-3">
                <input 
                  type="number" 
                  value={minutes} 
                  onChange={(e) => setminutes(e.target.value)} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200" 
                  readOnly
                />
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="cursor-pointer bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-md hover:opacity-90 transition duration-200 shadow whitespace-nowrap"
                >
                  Buy More Minutes
                </button>
              </div>
            </div>
            
            <button 
              onClick={updateProfile} 
              className="cursor-pointer mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium px-6 py-2.5 rounded-md hover:opacity-95 transition duration-200 shadow-md"
            >
              Update Profile
            </button>
            
            {profileMessage && (
              <div className={`mt-3 px-4 py-3 rounded-md ${success ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200'}`}>
                {profileMessage}
              </div>
            )}
            
            {paymentMessage && (
              <div className={`mt-3 px-4 py-3 rounded-md ${success ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200'}`}>
                {paymentMessage}
              </div>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 mb-8 transition-shadow duration-300 hover:shadow-lg">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
          </div>
          
          <div className="space-y-4 text-black">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Current Password:</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200" 
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">New Password:</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200" 
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Confirm New Password:</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200" 
              />
            </div>
            
            <button 
              onClick={changePassword} 
              className="cursor-pointer mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium px-6 py-2.5 rounded-md hover:opacity-95 transition duration-200 shadow-md"
            >
              Change Password
            </button>
            
            {passwordMessage && (
              <div className={`mt-3 px-4 py-3 rounded-md ${success ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200'}`}>
                {passwordMessage}
              </div>
            )}
          </div>
        </div>

      </div>
      
      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Choose a Plan</h3>
              <button 
                onClick={() => setShowPricingModal(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center p-3 border border-gray-200 rounded-md hover:border-indigo-500 transition-colors">
                <input 
                  type="radio" 
                  id="plan1" 
                  name="plan" 
                  value="INR_900_1000" 
                  checked={selectedPlan === "INR_900_1000"}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 mr-3"
                />
                <label htmlFor="plan1" className="flex-grow text-gray-700 font-medium">
                  ₹900 for 1000 minutes
                </label>
              </div>
              
              <div className="flex items-center p-3 border border-gray-200 rounded-md hover:border-indigo-500 transition-colors">
                <input 
                  type="radio" 
                  id="plan2" 
                  name="plan" 
                  value="USD_10_1000" 
                  checked={selectedPlan === "USD_10_1000"}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 mr-3"
                />
                <label htmlFor="plan2" className="flex-grow text-gray-700 font-medium">
                  $10 for 1000 minutes
                </label>
              </div>
              
              <div className="flex items-center p-3 border border-gray-200 rounded-md hover:border-indigo-500 transition-colors">
                <input 
                  type="radio" 
                  id="plan3" 
                  name="plan" 
                  value="INR_2000_3000" 
                  checked={selectedPlan === "INR_2000_3000"}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 mr-3"
                />
                <label htmlFor="plan3" className="flex-grow text-gray-700 font-medium">
                  ₹2000 for 3000 minutes <span className="text-green-600 font-medium">(33% savings)</span>
                </label>
              </div>
            </div>
            
            <button 
              onClick={initiatePayment}
              className="cursor-pointer w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium py-3 rounded-md hover:opacity-95 transition duration-200 shadow-md flex items-center justify-center"
            >
              Proceed to Payment
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      <Footer/>
    </div>
  );
}