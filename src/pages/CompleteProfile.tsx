import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const CompleteProfile = () => {
    const { user, name } = useAuth();
    const navigate = useNavigate();
    
    const [studentName, setStudentName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If they already have a name populated via Context, they shouldn't be here.
        if (name) {
            navigate("/students");
        }
        // If there's no active user session, kick them back to login.
        if (!user) {
            navigate("/login");
        }
    }, [user, name, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const cleanName = studentName.trim();
        if (!cleanName) {
            setError("Your name cannot be empty. Please enter your full name.");
            return;
        }

        if (!user) return; // Fallback safeguard

        setLoading(true);
        setError(null);

        try {
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: "student",
                name: cleanName
            });
            // onSnapshot triggers natively via AuthContext routing you out seamlessly upon completion!
            navigate("/students");
        } catch (err: any) {
            console.error("Failed completing profile:", err);
            setError("Something went wrong saving your profile.");
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center -mt-10 lg:-mt-20">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sm:mx-0 mx-4">
                
                <div className="bg-indigo-600 px-6 py-8 text-center sm:px-10">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Complete Profile
                    </h2>
                    <p className="text-indigo-100 text-sm">
                        Just one more step! We need your name for grading.
                    </p>
                </div>

                <div className="px-6 py-8 sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="studentName">
                                Full Student Name
                            </label>
                            <p className="text-xs text-gray-400 mt-1 mb-2">
                                Please do not use your parent's name. Use the name you registered in class with.
                            </p>
                            <input
                                id="studentName"
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="E.g. John Doe"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? "Saving..." : "Enter Dashboard"}
                        </button>
                        
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;
