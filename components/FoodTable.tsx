
import React from 'react';
import { Trash2, Salad, PlusCircle, Download } from 'lucide-react';
import { FoodEntry } from '../types';

interface FoodTableProps {
  entries: FoodEntry[];
  onRemove: (id: string) => void;
  onExport: () => void;
}

const FoodTable: React.FC<FoodTableProps> = ({ entries, onRemove, onExport }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Salad className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-slate-800">Daily Intake Log</h2>
        </div>
        <button 
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-slate-200"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Food Item</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Serving Size</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Calories / Unit</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Calories</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  <p>No food entries yet. Use the form to start tracking!</p>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-800">{entry.foodItem}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {entry.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {entry.servingSize} {entry.unit}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {entry.caloriesPerUnit}
                  </td>
                  <td className="px-6 py-4 font-semibold text-orange-600">
                    {entry.totalCalories} kcal
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onRemove(entry.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200">
            <tr>
              <td colSpan={4} className="px-6 py-4 text-right font-bold text-slate-500">
                Grand Total:
              </td>
              <td className="px-6 py-4 font-bold text-orange-600 text-lg">
                {entries.reduce((sum, e) => sum + e.totalCalories, 0).toLocaleString()} kcal
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default FoodTable;
