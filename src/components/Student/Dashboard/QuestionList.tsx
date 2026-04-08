import React from "react";
import { type Question } from "../../../types";
import { PlayCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface QuestionListProps {
  questions: Question[];
  onStartTest: (q: Question) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({ questions, onStartTest }) => {
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 mt-6 shadow-sm">
        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">All tests completed!</h3>
        <p className="text-gray-500 text-center max-w-sm">
          You have successfully completed all currently available assignments. Check back later for new modules.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.map((q, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={q.id}
            className="group bg-white rounded-xl border border-gray-200 p-5 flex flex-col h-full shadow-sm hover:shadow-md transition-all sm:min-h-[200px]"
          >
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{q.title}</h3>
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                  <Clock className="w-3 h-3" /> 
                  Pending
                </span>
              </div>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                {q.description}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 mt-auto">
              <button
                onClick={() => onStartTest(q)}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg font-medium transition-colors min-h-[44px]"
              >
                <PlayCircle className="w-4 h-4" />
                Start Test
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuestionList;
