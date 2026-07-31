import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaSpinner, FaEye, FaEyeSlash, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { BiLibrary } from 'react-icons/bi';

export const Register = () => {
  const { register } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password) {
      toast.error('All fields are required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name.trim(), email.trim(), password);
      if (res.emailPreviewUrl) setEmailPreviewUrl(res.emailPreviewUrl);
      toast.success(res.message || 'Registration successful! Please check your email.');
      setRegistered(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
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
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Join MediaShelf to catalog your personal library.
          </p>
        </div>

        {registered ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center py-4"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-purple-950/60 text-blue-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto">
              <FaCheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Verify Your Email</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                We sent a verification link to <strong className="text-blue-600 dark:text-purple-400">{formData.email}</strong>.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Please click the link in your email to activate your MediaShelf account before logging in.
              </p>
            </div>

            {emailPreviewUrl && (
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center space-y-2">
                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">📧 Dev Mode: View email in browser</p>
                <a
                  href={emailPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-purple-400 hover:underline break-all block"
                >
                  {emailPreviewUrl}
                </a>
              </div>
            )}

            <Link
              to="/login"
              className="inline-flex items-center justify-center space-x-2 w-full py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 text-white shadow-md transition-all active:scale-[0.99]"
            >
              <span>Proceed to Log In</span>
              <FaArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name */}
              <div className="relative">
                <label className="sr-only">Full Name</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaUser className="w-4 h-4" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                  placeholder="Full Name"
                />
              </div>

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
                  placeholder="Password (Min. 6 chars)"
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

              {/* Confirm Password */}
              <div className="relative">
                <label className="sr-only">Confirm Password</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaLock className="w-4 h-4" />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
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
                <span>Register</span>
              )}
            </button>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <span>Already have an account? </span>
              <Link to="/login" className="font-semibold text-blue-600 dark:text-purple-400 hover:underline">
                Log in here
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Register;
