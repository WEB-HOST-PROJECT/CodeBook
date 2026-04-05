import { type Question } from "../../types";
import { db } from "../../firebase";
import { doc, deleteDoc } from "firebase/firestore";

interface QuestionListProps {
    questions: Question[];
    onRefresh: () => void;
}

const QuestionList = ({ questions, onRefresh }: QuestionListProps) => {

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this specific question?")) return;
        
        try {
            await deleteDoc(doc(db, "questions", id));
            onRefresh();
        } catch (error) {
            console.error("Error deleting question: ", error);
            alert("Failed to delete question.");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Active Library ({questions.length})</h3>
            </div>
            
            {questions.length === 0 ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <p>No questions actively assigned right now.</p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {questions.map((q) => (
                        <li key={q.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900">{q.title}</h4>
                                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{q.description}</p>
                            </div>
                            <div className="flex items-start shrink-0">
                                <button
                                    onClick={() => handleDelete(q.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-transparent hover:border-red-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default QuestionList;
