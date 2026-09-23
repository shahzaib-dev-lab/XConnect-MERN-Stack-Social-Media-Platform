import React, { useState } from 'react';
import axios from 'axios';
import { RiTwitterXLine } from 'react-icons/ri';
const API_AUTH_URL = 'https://xconnect-mern-stack-social-media-platform-production.up.railway.app/api/auth';
const AuthModal = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/login' : '/register';

    try {
      const response = await axios.post(`${API_AUTH_URL}${endpoint}`, formData);
      const { token, user } = response.data;

      // LocalStorage session store
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      onLoginSuccess(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm select-none">
      <div className="bg-black border border-[#2f3336] rounded-2xl p-6 md:p-8 w-full max-w-md flex flex-col items-center shadow-2xl">
        <RiTwitterXLine className="text-4xl text-white mb-4" />
        
        <h2 className="text-2xl font-bold mb-6 text-white">
          {isLogin ? 'Sign in to X' : 'Create your account'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-lg mb-4 w-full text-center"> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {!isLogin && (
            <>
              <input type="text" name="name" laceholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full bg-[#16181c] border border-[#2f3336] text-white p-3 rounded-xl focus:outline-none focus:border-[#1d9bf0]" />

              <input type="text" name="username" placeholder="Username (e.g. shahzaib)" value={formData.username} onChange={handleChange} required className="w-full bg-[#16181c] border border-[#2f3336] text-white p-3 rounded-xl focus:outline-none focus:border-[#1d9bf0]" /> 
              </> )}

          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full bg-[#16181c] border border-[#2f3336] text-white p-3 rounded-xl focus:outline-none focus:border-[#1d9bf0]"/>

          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full bg-[#16181c] border border-[#2f3336] text-white p-3 rounded-xl focus:outline-none focus:border-[#1d9bf0]"/>

          <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-full hover:bg-gray-200 transition cursor-pointer mt-2"> {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <span onClick={() => {setIsLogin(!isLogin); setError('');}} className="text-[#1d9bf0] cursor-pointer hover:underline font-semibold">{isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;