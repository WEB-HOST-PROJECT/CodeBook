import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';

const AuthUser = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'reset_password'>('loading');
    const [message, setMessage] = useState('Processing your request...');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasAttempted = useRef(false);

    useEffect(() => {
        if (hasAttempted.current) return;

        const mode = searchParams.get('mode');
        const oobCode = searchParams.get('oobCode');

        if (mode === 'verifyEmail' && oobCode) {
            hasAttempted.current = true;
            applyActionCode(auth, oobCode)
                .then(() => {
                    setStatus('success');
                    setMessage('Your email has been verified successfully!');
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                })
                .catch((error: any) => {
                    setStatus('error');
                    if (error.code === 'auth/invalid-action-code') {
                        setMessage('This verification link has already been used or has expired. If you previously verified your account, you can simply log in.');
                    } else {
                        setMessage(error.message || 'The verification link is invalid or has expired.');
                    }
                });
        } else if (mode === 'resetPassword' && oobCode) {
            hasAttempted.current = true;
            verifyPasswordResetCode(auth, oobCode)
                .then(() => {
                    setStatus('reset_password');
                    setMessage('Please enter your new password.');
                })
                .catch((error: any) => {
                    setStatus('error');
                    setMessage(error.message || 'The password reset link is invalid or has expired.');
                });
        } else {
            setStatus('error');
            setMessage('Invalid or missing verification link.');
        }
    }, [searchParams, navigate]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword.length < 6) {
            setMessage('Password should be at least 6 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        const oobCode = searchParams.get('oobCode');
        if (!oobCode) return;

        setIsSubmitting(true);
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setStatus('success');
            setMessage('Your password has been successfully reset!');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to reset password. The link might have expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center -mt-10 lg:-mt-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center sm:mx-0 mx-4">
                <h2 className="text-2xl font-bold mb-4 text-indigo-900">
                    {searchParams.get('mode') === 'resetPassword' ? 'Reset Password' : 'Email Verification'}
                </h2>

                {status === 'loading' && (
                    <div className="text-indigo-600 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                        <p>{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-green-600">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <p className="font-medium text-lg">{message}</p>
                        <p className="text-sm mt-4 text-gray-500">Redirecting to login...</p>
                    </div>
                )}
                
                {status === 'reset_password' && (
                    <form onSubmit={handleResetPassword} className="text-left space-y-4">
                        <p className="text-gray-600 text-center mb-6">{message}</p>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {status === 'error' && (
                    <div className="text-red-600">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <p className="font-medium">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-6 w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-sm font-medium hover:bg-indigo-700 transition"
                        >
                            Return to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthUser;
