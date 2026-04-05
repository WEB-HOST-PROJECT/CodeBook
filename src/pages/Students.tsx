import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { type Question } from "../types";
import QuestionTable from "../components/Student/QuestionTable";
import Workspace from "../components/Student/Workspace";

const Students = () => {
    const { user, name } = useAuth();
    
    // Core State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());
    const [isLoadingData, setIsLoadingData] = useState(true);
    
    // View State
    const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successToast, setSuccessToast] = useState<string | null>(null);

    // Fetch dependencies
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            setIsLoadingData(true);

            try {
                // 1. Fetch available questions
                const qSnap = await getDocs(collection(db, "questions"));
                const fetchedQuestions = qSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Question[];

                // 2. Fetch submissions for this specific student to filter out what they've already done
                const subQuery = query(collection(db, "submissions"), where("studentId", "==", user.uid));
                const subSnap = await getDocs(subQuery);
                const attempts = new Set<string>();
                subSnap.forEach(doc => {
                    attempts.add(doc.data().questionId);
                });

                setAttemptedIds(attempts);
                setQuestions(fetchedQuestions);
            } catch (error) {
                console.error("Error fetching dashboard data: ", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    // Derived State: Filter out questions they already attempted
    const availableQuestions = questions.filter(q => !attemptedIds.has(q.id));

    const handleSubmitAssignment = async (code: string) => {
        if (!activeQuestion || !user) return;
        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "submissions"), {
                studentId: user.uid,
                studentName: name || user.displayName || "Unknown Student",
                questionId: activeQuestion.id,
                questionTitle: activeQuestion.title,
                code: code,
                timestamp: serverTimestamp()
            });

            // Mark question as attempted, removing it from view organically
            setAttemptedIds(prev => {
                const newSet = new Set(prev);
                newSet.add(activeQuestion.id);
                return newSet;
            });
            
            // Pop back to table and show a toast
            setActiveQuestion(null);
            setSuccessToast(`Successfully submitted "${activeQuestion.title}"!`);
            setTimeout(() => setSuccessToast(null), 4000);

        } catch (error) {
            console.error("Error submitting code: ", error);
            alert("Failed to submit code. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col pt-4">
            
            {/* Header: Fixed on both views */}
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {activeQuestion ? "Coding Environment" : "Student Dashboard"}
                    </h1>
                    <p className="mt-1 text-gray-600">
                        {activeQuestion 
                            ? "Complete your assessment below." 
                            : `Welcome back, ${name || 'Student'}! Here are your pending modules.`}
                    </p>
                </div>
                {/* Visual identity badge */}
                <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    <span className="text-sm font-medium text-blue-800">Authenticated Student</span>
                </div>
            </header>

            {/* Success Toast */}
            {successToast && (
                <div className="animate-in fade-in slide-in-from-top-4 mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center shadow-sm">
                    <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-green-800 font-medium">{successToast}</span>
                </div>
            )}

            {/* Loading Skeleton */}
            {isLoadingData ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                     <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500 font-medium">Loading assignments...</p>
                </div>
            ) : (
                /* Router: Table vs Workspace */
                activeQuestion ? (
                    <Workspace 
                        question={activeQuestion}
                        isSubmitting={isSubmitting}
                        onBack={() => setActiveQuestion(null)}
                        onSubmit={handleSubmitAssignment}
                    />
                ) : (
                    <QuestionTable 
                        questions={availableQuestions}
                        onStartTest={setActiveQuestion}
                    />
                )
            )}
        </div>
    );
};

export default Students;