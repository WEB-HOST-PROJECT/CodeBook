import { useState } from "react";
import Editor from "@monaco-editor/react";
import { type Submission } from "../../types";

interface SubmissionCardProps {
    submission: Submission;
    onReviewComplete: (id: string, marks: number, feedback: string) => Promise<void>;
}

const SubmissionCard = ({ submission, onReviewComplete }: SubmissionCardProps) => {
    const [marks, setMarks] = useState<string>("");
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFading, setIsFading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedMarks = parseInt(marks, 10);
        if (isNaN(parsedMarks)) return;

        setIsSubmitting(true);
        try {
            await onReviewComplete(submission.id as string, parsedMarks, feedback);
            // Trigger animation fade out for half a second
            setIsFading(true); 
            // The parent will inherently re-render and sort it away, so we just let it organically shift.
        } catch (error) {
            console.error("Error submitting review: ", error);
            alert("Failed to save review.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isFading ? "opacity-0 scale-95 h-0 my-0 border-0" : "opacity-100 scale-100 mb-6 bg-white rounded-xl shadow-sm border border-gray-200"}`}>
            
            {/* Header / Meta */}
            <div 
                className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-inner ${submission.reviewed ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                        {submission.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-gray-900">{submission.studentName}</h4>
                            {submission.reviewed && (
                                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                                    Reviewed ({submission.marks}/10)
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Assignment: <span className="font-semibold text-gray-700">{submission.questionTitle}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 self-end sm:self-auto">
                    <span>
                        {submission.timestamp 
                            ? new Date(submission.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : "Just now"}
                    </span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>

            {/* Expandable Body */}
            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="px-6 pb-6 pt-2 bg-gray-50 border-t border-gray-100">
                    
                    {/* Visualizer Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Editor Readonly */}
                        <div className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-[350px]">
                            <div className="bg-slate-100 px-4 py-2 border-b border-gray-200">
                                <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Student Raw Code</span>
                            </div>
                            <div className="flex-1">
                                <Editor
                                    height="100%"
                                    defaultLanguage="html"
                                    theme="vs-dark"
                                    value={submission.code}
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        padding: { top: 12 }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Rendering Iframe */}
                        <div className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-[350px]">
                            <div className="bg-slate-100 px-4 py-2 border-b border-gray-200">
                                <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Interactive Preview</span>
                            </div>
                            <div className="flex-1 bg-white relative p-2">
                                <iframe
                                    className="w-full h-full border border-gray-100 shadow-inner rounded"
                                    srcDoc={submission.code}
                                    title={`preview-${submission.id}`}
                                    sandbox="allow-scripts"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Review Form OR Finished Review State */}
                    {submission.reviewed ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
                            <h3 className="text-emerald-900 font-bold mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Official Review
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-shrink-0 bg-white border border-emerald-100 px-4 py-3 rounded-lg text-center">
                                    <span className="block text-2xl font-black text-emerald-600">{submission.marks}/10</span>
                                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Score</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-emerald-800 italic bg-white/60 p-3 rounded border border-emerald-100 min-h-[64px]">
                                        "{submission.feedback || "No additional feedback provided."}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitReview} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Evaluate & Grade
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                                <div className="sm:col-span-3">
                                    <label htmlFor={`marks-${submission.id}`} className="block text-sm font-medium text-gray-700">Marks (out of 10)</label>
                                    <input
                                        id={`marks-${submission.id}`}
                                        type="number"
                                        min="0"
                                        max="10"
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="e.g. 8"
                                        value={marks}
                                        onChange={(e) => setMarks(e.target.value)}
                                    />
                                </div>
                                <div className="sm:col-span-9">
                                    <label htmlFor={`feedback-${submission.id}`} className="block text-sm font-medium text-gray-700">Feedback <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <textarea
                                        id={`feedback-${submission.id}`}
                                        rows={2}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
                                        placeholder="Great job! Next time try to use semantic tags..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center"
                                >
                                    {isSubmitting ? "Saving..." : "Submit Review"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmissionCard;
