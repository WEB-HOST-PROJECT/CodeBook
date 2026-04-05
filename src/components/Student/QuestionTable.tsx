import { type Question } from "../../types";

interface QuestionTableProps {
    questions: Question[];
    onStartTest: (question: Question) => void;
}

const QuestionTable = ({ questions, onStartTest }: QuestionTableProps) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                                Assignment
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">
                                Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {questions.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
                                        <p className="text-lg font-medium text-gray-700">No pending assignments</p>
                                        <p className="text-gray-500">You've completed everything! Check back later.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            questions.map((q) => (
                                <tr key={q.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">{q.title}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 line-clamp-2">{q.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => onStartTest(q)}
                                            className="inline-flex items-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Start Test
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuestionTable;
