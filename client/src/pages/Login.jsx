import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaSpinner, FaEye, FaEyeSlash, FaExclamationCircle, FaPaperPlane } from 'react-icons/fa';
import { BiLibrary } from 'react-icons/bi';
import { resendVerification } from '../services/api';

export const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverifiedErr, setUnverifiedErr] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (unverifiedErr) setUnverifiedErr(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email.trim() || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    setUnverifiedErr(false);
    try {
      await login(email, password);
      toast.success('Welcome back to MediaShelf!');
      navigate('/');
    } catch (err) {
      const isUnverified = err.response?.data?.isUnverified;
      if (isUnverified) {
        setUnverifiedErr(true);
        toast.error('Please verify your email address before logging in.');
      } else {
        const msg = err.response?.data?.message || 'Invalid email or password';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setResending(true);
    try {
      const res = await resendVerification(formData.email);
      toast.success(res.data?.message || 'Verification link sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19] px-4 py-12 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-[#151f32] p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800"
      >
        <div className="text-center">
          <BiLibrary className="mx-auto w-12 h-12 text-blue-600 dark:text-purple-500 animate-pulse" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Log In
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Access your personal Movie & Book Library.
          </p>
        </div>

        {unverifiedErr && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs space-y-3"
          >
            <div className="flex items-start space-x-2">
              <FaExclamationCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Email Not Verified:</strong> Please check your inbox for the verification link sent during registration.
              </div>
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors disabled:opacity-50"
            >
              {resending ? (
                <FaSpinner className="animate-spin w-3.5 h-3.5" />
              ) : (
                <>
                  <FaPaperPlane className="w-3 h-3" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div className="relative">
              <label className="sr-only">Email Address</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaEnvelope className="w-4 h-4" />
              </div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                placeholder="Email Address"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="relative">
                <label className="sr-only">Password</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaLock className="w-4 h-4" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-600 dark:text-purple-400 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 hover:shadow-lg text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-55 focus:outline-none"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <span>Log In</span>
            )}
          </button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-semibold text-blue-600 dark:text-purple-400 hover:underline">
              Register here
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
