import { useState, useEffect } from "react";
import { auth, db, googleProvider } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [infoMsg, setInfoMsg] = useState<string | null>(null);

    const navigate = useNavigate();
    const { user, role: currentUserRole } = useAuth();
    const role = "student"; // Hardcoded to student

    // If already logged in AND verified (if email/password), redirect them
    useEffect(() => {
        if (user && currentUserRole) {
            // Google users are automatically verified.
            if (user.emailVerified || user.providerData.some(p => p.providerId === 'google.com')) {
                navigate(currentUserRole === "student" ? "/students" : "/teacher");
            }
        }
    }, [user, currentUserRole, navigate]);

    const handleGoogleSignIn = async () => {
        setError(null);
        setInfoMsg(null);
        setLoading(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user already exists
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                const finalName = name.trim() || user.displayName || "Unknown Student";
                
                await setDoc(docRef, {
                    email: user.email,
                    role: role, 
                    name: finalName
                });
                navigate("/students");
            } else {
                const userRole = docSnap.data().role;
                navigate(userRole === "student" ? "/students" : "/teacher");
            }
        } catch (err: any) {
            setError(err.message || "Failed to sign in with Google.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setInfoMsg(null);
        setLoading(true);
        
        try {
            if (isLoginView) {
                const userCred = await signInWithEmailAndPassword(auth, email, password);
                
                if (!userCred.user.emailVerified) {
                    setError("Please verify your email address to log in.");
                    setLoading(false);
                    return;
                }

                const docSnap = await getDoc(doc(db, "users", userCred.user.uid));
                const userRole = docSnap.data()?.role;

                if (userRole === "teacher") {
                    navigate("/teacher");
                } else {
                    navigate("/students");
                }
            } else {
                if (!name.trim()) {
                    setError("Please enter your full name.");
                    setLoading(false);
                    return;
                }

                const userCred = await createUserWithEmailAndPassword(auth, email, password);
                await sendEmailVerification(userCred.user);

                await setDoc(doc(db, "users", userCred.user.uid), {
                    email,
                    role,
                    name: name.trim()
                });
                
                setInfoMsg("Registration successful! Please check your email to verify your account before logging in.");
                setIsLoginView(true);
            }
        } catch (err: any) {
            let userFriendlyError = "An unexpected error occurred.";
            if (err.code === "auth/invalid-credential") userFriendlyError = "Invalid email or password.";
            else if (err.code === "auth/email-already-in-use") userFriendlyError = "This email is already registered.";
            else if (err.code === "auth/weak-password") userFriendlyError = "Password should be at least 6 characters.";
            else userFriendlyError = err.message || userFriendlyError;
            
            setError(userFriendlyError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center -mt-10 lg:-mt-20">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sm:mx-0 mx-4">
                
                <div className="bg-indigo-600 px-6 py-8 text-center sm:px-10">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isLoginView ? "Student Portal" : "Join as a Student"}
                    </h2>
                    <p className="text-indigo-100 text-sm">
                        {isLoginView ? "Sign in to access your modules" : "Join our educational platform today"}
                    </p>
                </div>

                <div className="px-6 py-8 sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        {infoMsg && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                                <p className="text-sm text-green-700 font-medium">{infoMsg}</p>
                            </div>
                        )}

                        {!isLoginView && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="name">Full Name</label>
                                <div className="mt-1">
                                    <input
                                        id="name"
                                        type="text"
                                        required={!isLoginView}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email address</label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? "Loading..." : (isLoginView ? "Sign In" : "Register")}
                            </button>
                        </div>

                        <div className="relative mt-5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleGoogleSignIn}
                                className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                        </div>
                    </form>

                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={() => setIsLoginView(!isLoginView)}
                            className="w-full flex justify-center py-2.5 px-4 border border-indigo-200 rounded-lg shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                            {isLoginView ? "Create new account" : "Sign in to existing account"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;