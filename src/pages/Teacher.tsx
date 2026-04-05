import { useState, useEffect } from "react";
import { db } from "../firebase";
import { 
    collection, 
    getDocs, 
    doc, 
    updateDoc, 
    query, 
    orderBy 
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { type Question, type Submission } from "../types";

import QuestionForm from "../components/Teacher/QuestionForm";
import QuestionList from "../components/Teacher/QuestionList";
import SubmissionList from "../components/Teacher/SubmissionList";

const Teacher = () => {
    const { name } = useAuth();
    
    // UI Architecture State
    const [activeTab, setActiveTab] = useState<"assign" | "submissions">("assign");
    
    // Core Data Loading State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Unpack questions natively
            const qSnap = await getDocs(collection(db, "questions"));
            const qs = qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Question[];
            
            // Unpack submissions natively, sorting completely via Firestore timestamp organically first
            const sQuery = query(collection(db, "submissions"), orderBy("timestamp", "desc"));
            const sSnap = await getDocs(sQuery);
            const subs = sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Submission[];

            setQuestions(qs);
            setSubmissions(subs);
        } catch (error) {
            console.error("Critical error mapping dashboard documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto mount pulling down all parameters
    useEffect(() => {
        fetchData();
    }, []);

    const handleExecuteReview = async (id: string, marks: number, feedback: string) => {
        try {
            const docRef = doc(db, "submissions", id);
            await updateDoc(docRef, {
                marks,
                feedback,
                reviewed: true
            });

            // Visually fade update directly inside parent state
            // Ensures the list triggers its internal deep sorting mechanic natively pushing it to bottom
            setSubmissions(prev => 
                prev.map(sub => 
                    sub.id === id 
                        ? { ...sub, marks, feedback, reviewed: true } 
                        : sub
                )
            );
        } catch (error) {
            console.error("Failed executing review logic via network", error);
            throw error; // Toss back organically allowing local SubmissionCard to handle the visual error trap
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col pt-4">
            
            <header className="mb-8 border-b border-gray-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Teacher Portal</h1>
                    <p className="mt-1 text-gray-600">Welcome admin {name}. Manage your assignments securely below.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-slate-800 shadow-sm"></div>
                    <span className="text-sm font-medium text-slate-800">Administrator Access</span>
                </div>
            </header>

            {/* High Level Tabs */}
            <div className="flex space-x-1 bg-gray-100/80 p-1 rounded-xl w-full sm:w-fit mb-8 border border-gray-200">
                <button
                    onClick={() => setActiveTab("assign")}
                    className={`flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                        activeTab === "assign" 
                        ? 'bg-white text-slate-900 shadow-sm border border-gray-200/50' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Assign Questions
                </button>
                <button
                    onClick={() => setActiveTab("submissions")}
                    className={`flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                        activeTab === "submissions" 
                        ? 'bg-white text-slate-900 shadow-sm border border-gray-200/50' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Recent Submissions
                    
                    {/* Unreviewed Badge indicator */}
                    {submissions.filter(s => !s.reviewed).length > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {submissions.filter(s => !s.reviewed).length}
                        </span>
                    )}
                </button>
            </div>

            {/* Master Content Area */}
            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                     <svg className="animate-spin h-10 w-10 text-slate-800 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500 font-medium">Unpacking server structures...</p>
                </div>
            ) : (
                <div className="flex-1 pb-12 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === "assign" ? (
                        <div className="max-w-4xl">
                            <QuestionForm onQuestionAdded={fetchData} />
                            <QuestionList questions={questions} onRefresh={fetchData} />
                        </div>
                    ) : (
                        <SubmissionList 
                            submissions={submissions} 
                            onReviewComplete={handleExecuteReview} 
                        />
                    )}
                </div>
            )}

        </div>
    );
};

export default Teacher;