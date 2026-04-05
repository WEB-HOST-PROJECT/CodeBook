import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

interface QuestionFormProps {
    onQuestionAdded: () => void;
}

const QuestionForm = ({ onQuestionAdded }: QuestionFormProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "questions"), {
                title: title.trim(),
                description: description.trim()
            });
            setTitle("");
            setDescription("");
            onQuestionAdded();
        } catch (error) {
            console.error("Error adding question: ", error);
            alert("Failed to assign question.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assign New Question</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Question Title</label>
                    <input
                        id="title"
                        type="text"
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-slate-800 focus:border-slate-800 sm:text-sm"
                        placeholder="E.g. Build a Navigation Bar"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Detailed Description</label>
                    <textarea
                        id="description"
                        required
                        rows={4}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-slate-800 focus:border-slate-800 sm:text-sm resize-none"
                        placeholder="Describe the HTML structure and requirements..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center"
                    >
                        {isSubmitting ? "Assigning..." : "Assign Question"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuestionForm;
