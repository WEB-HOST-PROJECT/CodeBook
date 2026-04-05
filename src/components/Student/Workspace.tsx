import { useState } from "react";
import Editor from "@monaco-editor/react";
import { type Question } from "../../types";

interface WorkspaceProps {
    question: Question;
    isSubmitting: boolean;
    onBack: () => void;
    onSubmit: (code: string) => void;
}

const Workspace = ({ question, isSubmitting, onBack, onSubmit }: WorkspaceProps) => {
    const [code, setCode] = useState("<!-- Write your HTML structure below -->\n<h1>My Code</h1>");
    const [codeError, setCodeError] = useState<string | null>(null);

    const handleSubmitClick = () => {
        if (!code.trim()) {
            setCodeError("Code cannot be empty. Please write some HTML before submitting.");
            return;
        }
        setCodeError(null);
        onSubmit(code);
    };

    return (
        <div className="flex flex-col flex-1 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Tools */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <button 
                        onClick={onBack}
                        className="text-gray-500 hover:text-gray-900 font-medium text-sm flex items-center mb-2 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Assignments
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">{question.title}</h2>
                    <p className="text-gray-600 mt-1 max-w-3xl">{question.description}</p>
                </div>

                <div className="flex flex-col items-end shrink-0 w-full sm:w-auto">
                    <button
                        disabled={isSubmitting}
                        onClick={handleSubmitClick}
                        className="w-full sm:w-auto inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors focus:ring-4 focus:ring-blue-100"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Submitting...
                            </>
                        ) : (
                            <>
                                Submit Assignment
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </>
                        )}
                    </button>
                    {codeError && <span className="text-red-500 text-xs mt-2 font-medium">{codeError}</span>}
                </div>
            </div>

            {/* Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px] flex-1 pb-6">
                
                {/* Editor Container */}
                <div className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-[500px] lg:h-full">
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase flex items-center">
                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                            Editor (HTML)
                        </span>
                    </div>
                    <div className="flex-1 w-full h-full relative">
                        <Editor
                            height="100%"
                            defaultLanguage="html"
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => {
                                setCode(value || "");
                                if (codeError) setCodeError(null);
                            }}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 15,
                                wordWrap: 'on',
                                automaticLayout: true,
                                padding: { top: 16 }
                            }}
                        />
                    </div>
                </div>

                {/* Preview Container */}
                <div className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-[500px] lg:h-full">
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase flex items-center">
                            <svg className="w-4 h-4 mr-2 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            Live Output
                        </span>
                    </div>
                    <div className="flex-1 bg-white relative p-4">
                        <iframe
                            className="w-full h-full border border-gray-100 rounded shadow-inner"
                            srcDoc={code}
                            title="live-preview"
                            sandbox="allow-scripts"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Workspace;
