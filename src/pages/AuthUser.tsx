import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../firebase';

const AuthUser = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

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
        } else {
            setStatus('error');
            setMessage('Invalid verification link.');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex-1 flex items-center justify-center -mt-10 lg:-mt-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center sm:mx-0 mx-4">
                <h2 className="text-2xl font-bold mb-4 text-indigo-900">Email Verification</h2>

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
