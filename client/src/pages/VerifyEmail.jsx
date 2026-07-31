import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowRight, FaPaperPlane } from 'react-icons/fa';
import { BiLibrary } from 'react-icons/bi';
import { verifyEmail, resendVerification } from '../services/api';

export const VerifyEmail = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ success: false, message: '' });
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [showResendInput, setShowResendInput] = useState(false);

  useEffect(() => {
    const handleVerify = async () => {
      if (!token) {
        setLoading(false);
        setStatus({ success: false, message: 'Invalid verification token' });
        return;
      }

      try {
        const response = await verifyEmail(token);
        setStatus({ success: true, message: response.data?.message || 'Email verified successfully!' });
        toast.success('Email verified successfully!');
      } catch (err) {
        const msg = err.response?.data?.message || 'Verification link is invalid or has expired.';
        setStatus({ success: false, message: msg });
      } finally {
        setLoading(false);
      }
    };

    handleVerify();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setResending(true);
    try {
      const response = await resendVerification(resendEmail);
      toast.success(response.data?.message || 'Verification link resent!');
      setShowResendInput(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email.');
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
        className="max-w-md w-full space-y-8 bg-white dark:bg-[#151f32] p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800 text-center"
      >
        <BiLibrary className="mx-auto w-12 h-12 text-blue-600 dark:text-purple-500 animate-pulse" />

        {loading ? (
          <div className="py-8 space-y-4">
            <FaSpinner className="mx-auto w-10 h-10 text-blue-600 dark:text-purple-500 animate-spin" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verifying your email...</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we validate your activation token.</p>
          </div>
        ) : status.success ? (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <FaCheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Email Verified!</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{status.message}</p>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center space-x-2 w-full py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
            >
              <span>Proceed to Log In</span>
              <FaArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
              <FaTimesCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Verification Failed</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{status.message}</p>
            </div>

            {showResendInput ? (
              <form onSubmit={handleResend} className="space-y-4 pt-2">
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your registered email"
                />
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {resending ? <FaSpinner className="animate-spin" /> : <><FaPaperPlane className="w-3.5 h-3.5" /> <span>Send New Link</span></>}
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowResendInput(true)}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Resend Verification Link
              </button>
            )}

            <div className="pt-2">
              <Link to="/login" className="text-xs font-semibold text-blue-600 dark:text-purple-400 hover:underline">
                Return to Log In
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
