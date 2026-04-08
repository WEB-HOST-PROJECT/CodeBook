import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { type Question, type Submission } from "../types";
import { Tabs } from "../components/ui/Tabs";
import QuestionList from "../components/Student/Dashboard/QuestionList";
import SubmissionList from "../components/Student/Dashboard/SubmissionList";
import PerformanceChart from "../components/Student/Dashboard/PerformanceChart";
import Workspace from "../components/Student/Workspace";
import { Laptop, ListChecks, BarChart3 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const StudentDashboard = () => {
  const { user, name } = useAuth();

  // Core Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());
  
  // Loading States
  const [isLoadingQ, setIsLoadingQ] = useState(true);
  const [isLoadingS, setIsLoadingS] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState("tests");
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch Questions
    const fetchQuestions = async () => {
      setIsLoadingQ(true);
      try {
        const qSnap = await getDocs(collection(db, "questions"));
        const fetched = qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Question[];
        setQuestions(fetched);
      } catch (err) {
        console.error("Error fetching questions: ", err);
      } finally {
        setIsLoadingQ(false);
      }
    };

    // Fetch Submissions + Compute Attempted
    const fetchSubmissions = async () => {
      setIsLoadingS(true);
      try {
        const subQuery = query(
          collection(db, "submissions"), 
          where("studentId", "==", user.uid)
          // Note: Firestore requires a composite index if we combine where() and orderBy(). 
          // If orderBy("timestamp", "desc") throws on first load, we'd sort client-side. 
          // For safety, we will fetch and sort client side if needed, but normally orderBy should work without issue if matching equality on studentId and then ordering on timestamp needs an index.
          // Let's rely on client-side sort to be safe from composite index requirements on default install.
        );
        const subSnap = await getDocs(subQuery);
        const subData: Submission[] = [];
        const attempts = new Set<string>();
        
        subSnap.docs.forEach(doc => {
          const dt = { id: doc.id, ...doc.data() } as Submission;
          subData.push(dt);
          attempts.add(dt.questionId);
        });

        // Sort client side (latest first) to avoid missing index errors
        subData.sort((a, b) => {
          const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
          const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
          return tB - tA;
        });

        setSubmissions(subData);
        setAttemptedIds(attempts);
      } catch (err) {
        console.error("Error fetching submissions: ", err);
      } finally {
        setIsLoadingS(false);
      }
    };

    fetchQuestions();
    fetchSubmissions();
  }, [user]);

  const availableQuestions = questions.filter(q => !attemptedIds.has(q.id));

  const handleSubmitAssignment = async (code: string) => {
    if (!activeQuestion || !user) return;
    setIsSubmitting(true);

    try {
      const newSubData = {
        studentId: user.uid,
        studentName: name || user.displayName || "Unknown Student",
        questionId: activeQuestion.id,
        questionTitle: activeQuestion.title,
        code: code,
        timestamp: serverTimestamp(),
        reviewed: false
      };

      const docRef = await addDoc(collection(db, "submissions"), newSubData);

      // Optimistic Update
      setAttemptedIds(prev => {
        const newSet = new Set(prev);
        newSet.add(activeQuestion.id);
        return newSet;
      });

      // Also append to submissions so it shows up instantly in the "My Submissions" tab
      // However timestamp evaluates to null until fetched, so we mock it for immediate display.
      const optimisticSubmission: Submission = {
        id: docRef.id,
        ...newSubData,
        timestamp: { toMillis: () => Date.now(), toDate: () => new Date() } // Mock Date
      } as Submission;

      setSubmissions(prev => [optimisticSubmission, ...prev]);
      
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

  const tabs = [
    { id: "tests", label: "Available Tests", icon: <Laptop className="w-4 h-4" /> },
    { id: "submissions", label: "My Submissions", icon: <ListChecks className="w-4 h-4" /> },
    { id: "performance", label: "Weekly Performance", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col pt-4 px-4 sm:px-6 lg:px-8 bg-[#fdfdfd] min-h-screen">
      
      {/* Header */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {activeQuestion ? "Coding Environment" : "Dashboard"}
          </h1>
          <p className="mt-1 text-gray-500 font-medium">
            {activeQuestion
              ? "Write your solution below. Keep an eye on the requirements."
              : `Welcome back, ${name || 'Student'}! Stay on top of your assignments.`}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          <span className="text-sm font-semibold text-gray-700">{name}</span>
        </div>
      </header>

      {/* Success Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center shadow-sm z-10"
          >
            <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-green-800 font-medium">{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      {activeQuestion ? (
        <Workspace
          question={activeQuestion}
          isSubmitting={isSubmitting}
          onBack={() => setActiveQuestion(null)}
          onSubmit={handleSubmitAssignment}
        />
      ) : (
        <div className="flex-1 flex flex-col">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <main className="flex-1 pb-10">
            <AnimatePresence mode="wait">
              {activeTab === "tests" && (
                <motion.div key="tests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  {isLoadingQ || isLoadingS ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                  ) : (
                    <QuestionList questions={availableQuestions} onStartTest={setActiveQuestion} />
                  )}
                </motion.div>
              )}
              {activeTab === "submissions" && (
                <motion.div key="sub" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <SubmissionList submissions={submissions} isLoading={isLoadingS} />
                </motion.div>
              )}
              {activeTab === "performance" && (
                <motion.div key="perf" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  {isLoadingS ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                  ) : (
                    <PerformanceChart submissions={submissions} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
