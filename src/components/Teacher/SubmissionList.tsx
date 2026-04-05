import { useState, useMemo } from "react";
import { type Submission } from "../../types";
import SubmissionCard from "./SubmissionCard";

interface SubmissionListProps {
    submissions: Submission[];
    onReviewComplete: (id: string, marks: number, feedback: string) => Promise<void>;
}

const SubmissionList = ({ submissions, onReviewComplete }: SubmissionListProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeDateTab, setActiveDateTab] = useState<string>("");
    
    // Group submissions structurally
    const { groupedMap, sortedDates } = useMemo(() => {
        const map = new Map<string, Submission[]>();
        
        submissions.forEach(sub => {
            if (!sub.timestamp) return; // Fallback protection
            
            // Generate standard YYYY-MM-DD key natively
            const dateObj = sub.timestamp.toDate();
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const key = `${year}-${month}-${day}`;
            
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(sub);
        });

        // Sort keys descending (newest dates first)
        const keys = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
        
        return { groupedMap: map, sortedDates: keys };
    }, [submissions]);

    // Safety fallback initialization to force rendering the newest date natively
    if (activeDateTab === "" && sortedDates.length > 0) {
        setActiveDateTab(sortedDates[0]);
    }

    // Isolate visually the submissions we are displaying currently
    const displayedSubmissions = useMemo(() => {
        if (!activeDateTab || !groupedMap.has(activeDateTab)) return [];
        
        let filtered = groupedMap.get(activeDateTab)!;
        
        // Bonus search requirement
        if (searchQuery.trim()) {
            const lowerQ = searchQuery.toLowerCase();
            filtered = filtered.filter(s => s.studentName.toLowerCase().includes(lowerQ));
        }

        // Deep Sort natively handling Unreviewed vs Reviewed (Reviewed falls to bottom organically)
        // If they fall into the same tier, sort chronologically
        return filtered.sort((a, b) => {
            if (a.reviewed === b.reviewed) {
                return b.timestamp.toMillis() - a.timestamp.toMillis();
            }
            return a.reviewed ? 1 : -1;
        });

    }, [activeDateTab, groupedMap, searchQuery]);

    // Format helper function displaying Date tabs humanly
    const formatTabDate = (dateString: string) => {
        const target = new Date(dateString);
        target.setHours(0, 0, 0, 0); // Normalize targeting zero out hours
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffTime = today.getTime() - target.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        
        return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="flex flex-col gap-6">
            
            {/* Search Topbar */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-slate-800 focus:border-slate-800 sm:text-sm"
                        placeholder="Search student names..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Daily Pagination Tracker row */}
            {sortedDates.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {sortedDates.map(dateKey => (
                        <button
                            key={dateKey}
                            onClick={() => setActiveDateTab(dateKey)}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeDateTab === dateKey 
                                ? 'bg-slate-800 text-white shadow-md' 
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            {formatTabDate(dateKey)}
                            <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs ${activeDateTab === dateKey ? 'bg-slate-600 text-slate-100' : 'bg-gray-100 text-gray-500'}`}>
                                {groupedMap.get(dateKey)!.length}
                            </span>
                        </button>
                    ))}
                </div>
            ) : null}

            {/* Submission Cards Flowing Render Loop */}
            <div className="flex flex-col relative w-full pt-2">
                {sortedDates.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500 flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="text-lg font-medium text-gray-700">No submissions found</p>
                        <p className="text-sm mt-1">When students complete challenges, they will populate organically right here.</p>
                    </div>
                ) : displayedSubmissions.length === 0 ? (
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                        <p>No students match your active filters.</p>
                    </div>
                ) : (
                    displayedSubmissions.map((sub) => (
                        <SubmissionCard 
                            key={sub.id} 
                            submission={sub} 
                            onReviewComplete={onReviewComplete} 
                        />
                    ))
                )}
            </div>
            
        </div>
    );
};

export default SubmissionList;
