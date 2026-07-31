import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaEnvelope, FaSpinner, FaArrowLeft, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';
import { BiLibrary } from 'react-icons/bi';
import { forgotPassword } from '../services/api';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      if (response.data?.emailPreviewUrl) setEmailPreviewUrl(response.data.emailPreviewUrl);
      toast.success(response.data?.message || 'Password reset link sent!');
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request password reset. Please try again.';
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
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No worries! Enter your account email address and we'll send you a password reset link.
          </p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <FaCheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Check Your Inbox</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                If an account exists for <strong className="text-blue-600 dark:text-purple-400">{email}</strong>, you will receive an email with instructions to reset your password.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                The link is valid for 15 minutes. Check your spam/junk folder if you don't see it.
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
                  Click here to open the password reset email
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col space-y-3">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs text-blue-600 dark:text-purple-400 font-semibold hover:underline"
              >
                Didn't receive an email? Try again
              </button>

              <Link
                to="/login"
                className="inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <FaArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Log In</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <label className="sr-only">Email Address</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaEnvelope className="w-4 h-4" />
              </div>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 hover:shadow-lg text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-55 focus:outline-none"
            >
              {loading ? (
                <FaSpinner className="animate-spin w-5 h-5" />
              ) : (
                <>
                  <FaPaperPlane className="w-4 h-4" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
              >
                <FaArrowLeft className="w-3 h-3 mr-2" />
                <span>Back to Log In</span>
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
