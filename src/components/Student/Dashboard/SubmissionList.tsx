import React, { useState, useMemo } from "react";
import { type Submission } from "../../../types";
import { CheckCircle2, CircleDashed, Code2, Calendar, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface SubmissionListProps {
  submissions: Submission[];
  isLoading: boolean;
}

const SubmissionCard = ({ s }: { s: Submission }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dateStr = s.timestamp?.toDate ? format(s.timestamp.toDate(), "MMM dd, yyyy • p") : "Awaiting sync...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{s.questionTitle}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {dateStr}
              </span>
              <span className="flex items-center gap-1">
                {s.reviewed ? (
                  <span className="text-green-600 flex items-center gap-1 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                    <CircleDashed className="w-3.5 h-3.5" /> Pending Review
                  </span>
                )}
              </span>
            </div>
          </div>
          {s.reviewed && s.marks !== undefined && (
            <div className="flex flex-col items-center sm:items-end p-3 bg-gray-50 rounded-lg min-w-[80px]">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Score</span>
              <span className="text-2xl font-bold text-blue-600 leading-none">{s.marks}/10</span>
            </div>
          )}
        </div>

        {/* Feedback Section if reviewed */}
        {s.reviewed && s.feedback && (
          <div className="mb-4 bg-blue-50/50 rounded-lg p-3 sm:p-4 border border-blue-100 flex items-start gap-3">
            <div className="mt-0.5 text-blue-500 shrink-0"><FileText className="w-5 h-5"/></div>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Teacher's Feedback</p>
              <p className="text-sm text-blue-800">{s.feedback}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
        >
          <Code2 className="w-4 h-4" />
          {isExpanded ? "Hide Code Submission" : "View Code Submission"}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3"
            >
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100 font-mono">
                  <code>{s.code || "No code provided."}</code>
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const SubmissionList: React.FC<SubmissionListProps> = ({ submissions, isLoading }) => {
  const [filter, setFilter] = useState<"all" | "reviewed" | "unreviewed">("all");

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (filter === "reviewed") return s.reviewed;
      if (filter === "unreviewed") return !s.reviewed;
      return true;
    });
  }, [submissions, filter]);

  if (isLoading) {
    return (
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm overflow-hidden relative">
            <div className="w-full animate-pulse flex flex-col gap-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="mt-4 h-10 bg-gray-100 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Submissions Yet</h3>
        <p className="text-gray-500 text-center max-w-sm">
          You haven't completed any coding assignments yet. Head over to Available Tests to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full flex flex-col gap-6">
      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {(["all", "reviewed", "unreviewed"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`min-h-[36px] px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap capitalize ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {f === "all" ? "All Submissions" : f}
          </button>
        ))}
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">No submissions matching the filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map(s => (
             <SubmissionCard key={s.id} s={s} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionList;
