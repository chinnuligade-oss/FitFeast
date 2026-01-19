
import React from 'react';
import { Activity, Flame, Target, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
  total: number;
  goal: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ total, goal }) => {
  const remaining = Math.max(0, goal - total);
  const percentage = Math.min(100, (total / goal) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-slate-500">Current Calories</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-slate-800">{total.toLocaleString()}</span>
          <span className="text-sm text-slate-400 mb-1">kcal</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-slate-500">Daily Goal</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-slate-800">{goal.toLocaleString()}</span>
          <span className="text-sm text-slate-400 mb-1">kcal</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-sm font-medium text-slate-500">Remaining</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-slate-800">{remaining.toLocaleString()}</span>
          <span className="text-sm text-slate-400 mb-1">kcal</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-slate-500">Goal Progress</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-1000 ${percentage > 100 ? 'bg-red-500' : 'bg-purple-600'}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="mt-1 text-right text-xs text-slate-400 font-medium">
          {percentage.toFixed(0)}%
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
