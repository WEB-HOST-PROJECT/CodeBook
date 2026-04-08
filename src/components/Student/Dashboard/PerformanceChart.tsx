import React, { useMemo } from "react";
import { type Submission } from "../../../types";
import { format, startOfWeek } from "date-fns";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart 
} from "recharts";
import { Trophy, Target, TrendingUp } from "lucide-react";

interface PerformanceChartProps {
  submissions: Submission[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ submissions }) => {
  const chartData = useMemo(() => {
    // Only consider reviewed submissions for performance marks
    const reviewed = submissions.filter(s => s.reviewed && s.marks !== undefined && s.timestamp?.toDate);
    
    if (reviewed.length === 0) return [];

    // Group by week
    const groups: Record<string, { totalMarks: number; count: number; datePoint: Date }> = {};

    reviewed.forEach(sub => {
      const date = sub.timestamp.toDate();
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!groups[weekKey]) {
        groups[weekKey] = { totalMarks: 0, count: 0, datePoint: weekStart };
      }
      
      groups[weekKey].totalMarks += sub.marks!;
      groups[weekKey].count += 1;
    });

    // Convert to array and sort chronologically
    const sortedWeeks = Object.values(groups).sort((a, b) => a.datePoint.getTime() - b.datePoint.getTime());

    return sortedWeeks.map(week => ({
      weekLabel: `Week of ${format(week.datePoint, 'MMM dd')}`,
      average: Number((week.totalMarks / week.count).toFixed(1)),
      tests: week.count
    }));
  }, [submissions]);

  // Overall Stats
  const totalReviewed = submissions.filter(s => s.reviewed).length;
  const averageAllTime = totalReviewed > 0 
    ? (submissions.filter(s => s.reviewed && s.marks !== undefined).reduce((acc, curr) => acc + (curr.marks || 0), 0) / totalReviewed).toFixed(1)
    : "0.0";
  const totalAttempted = submissions.length;

  if (totalAttempted === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200">
        <TrendingUp className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Complete some tests to start tracking your performance over time.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Average Score</p>
            <p className="text-3xl font-bold text-gray-900">{averageAllTime} <span className="text-sm font-medium text-gray-400">/ 10</span></p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
            <Target className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Attempts</p>
            <p className="text-3xl font-bold text-gray-900">{totalAttempted}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Weekly Performance Trend</h3>
          <p className="text-sm text-gray-500">Based on evaluated submissions</p>
        </div>

        {chartData.length < 2 ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-lg">
                <p className="text-gray-500 mb-1">Not enough data to map a trend.</p>
                <p className="text-sm text-gray-400">Complete more tests over different weeks.</p>
            </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="weekLabel" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  dy={10}
                />
                <YAxis 
                  domain={[0, 10]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value} / 10`, 'Average Score']}
                  labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAvg)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceChart;
