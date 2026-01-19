
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, BrainCircuit, Sparkles, Loader2, Info, 
  Save, Upload, FileJson, CheckCircle2, History 
} from 'lucide-react';
import SummaryCards from './components/SummaryCards';
import FoodTable from './components/FoodTable';
import { FoodEntry, FoodCategory } from './types';
import { estimateNutrients, getNutritionTips } from './services/geminiService';

const DEFAULT_GOAL = 2000;
const STORAGE_KEY = 'fitfeast_v1_data';

const App: React.FC = () => {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [goal, setGoal] = useState<number>(DEFAULT_GOAL);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [smartInput, setSmartInput] = useState('');
  const [aiTips, setAiTips] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [manualEntry, setManualEntry] = useState({
    foodItem: '',
    category: FoodCategory.OTHER,
    servingSize: 1,
    unit: 'serving',
    caloriesPerUnit: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const { entries: savedEntries, goal: savedGoal } = JSON.parse(savedData);
        setEntries(savedEntries || []);
        setGoal(savedGoal || DEFAULT_GOAL);
        setLastSaved(new Date());
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // 2. Auto-save to LocalStorage
  useEffect(() => {
    const dataToSave = JSON.stringify({ entries, goal });
    localStorage.setItem(STORAGE_KEY, dataToSave);
    setLastSaved(new Date());
  }, [entries, goal]);

  const dailyTotal = entries.reduce((sum, entry) => sum + entry.totalCalories, 0);

  const addEntry = (entryData: Omit<FoodEntry, 'id' | 'timestamp' | 'totalCalories'>) => {
    const newEntry: FoodEntry = {
      ...entryData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      totalCalories: Math.round(entryData.servingSize * entryData.caloriesPerUnit)
    };
    setEntries(prev => [newEntry, ...prev]);
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleSmartAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInput.trim()) return;
    setIsAiLoading(true);
    try {
      const nutrientEstimate = await estimateNutrients(smartInput);
      addEntry(nutrientEstimate);
      setSmartInput('');
    } catch (err) {
      console.error("AI Estimation failed:", err);
      alert("Failed to estimate nutrition. Please try manual entry.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEntry.foodItem) return;
    addEntry({ ...manualEntry });
    setManualEntry({
      foodItem: '',
      category: FoodCategory.OTHER,
      servingSize: 1,
      unit: 'serving',
      caloriesPerUnit: 0
    });
  };

  const handleExportCSV = () => {
    const headers = ['Food Item', 'Category', 'Serving Size', 'Unit', 'Calories/Unit', 'Total Calories', 'Logged At'];
    const rows = entries.map(e => [
      `"${e.foodItem.replace(/"/g, '""')}"`,
      e.category,
      e.servingSize,
      e.unit,
      e.caloriesPerUnit,
      e.totalCalories,
      new Date(e.timestamp).toLocaleString()
    ]);

    // Use BOM for Excel UTF-8 compatibility
    const csvContent = "\uFEFF" + [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fitfeast_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDownloadBackup = () => {
    const data = JSON.stringify({ entries, goal, exportDate: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fitfeast_dashboard_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.entries && Array.isArray(parsed.entries)) {
          setEntries(parsed.entries);
          if (parsed.goal) setGoal(parsed.goal);
          alert("Dashboard restored successfully!");
        }
      } catch (err) {
        alert("Invalid backup file format.");
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (entries.length > 0) {
      const updateTips = async () => {
        const tips = await getNutritionTips(entries);
        setAiTips(tips);
      };
      const timeout = setTimeout(updateTips, 1000);
      return () => clearTimeout(timeout);
    } else {
      setAiTips('');
    }
  }, [entries]);

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <Plus className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">FitFeast</h1>
              {lastSaved && (
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Synced {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 font-semibold uppercase tracking-tight">
                Target: 
                <input 
                  type="number" 
                  value={goal} 
                  onChange={(e) => setGoal(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 transition-all"
                />
                <span className="text-xs text-slate-400">kcal</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SummaryCards total={dailyTotal} goal={goal} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <FoodTable entries={entries} onRemove={removeEntry} onExport={handleExportCSV} />
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                Manual Entry Form
              </h3>
              <form onSubmit={handleManualAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Food Item Name</label>
                  <input
                    type="text"
                    required
                    value={manualEntry.foodItem}
                    onChange={(e) => setManualEntry({...manualEntry, foodItem: e.target.value})}
                    placeholder="e.g., Avocado Toast with Egg"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</label>
                  <select
                    value={manualEntry.category}
                    onChange={(e) => setManualEntry({...manualEntry, category: e.target.value as FoodCategory})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  >
                    {Object.values(FoodCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">kcal per Unit</label>
                  <input
                    type="number"
                    required
                    value={manualEntry.caloriesPerUnit}
                    onChange={(e) => setManualEntry({...manualEntry, caloriesPerUnit: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={manualEntry.servingSize}
                    onChange={(e) => setManualEntry({...manualEntry, servingSize: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unit Type</label>
                  <input
                    type="text"
                    required
                    value={manualEntry.unit}
                    onChange={(e) => setManualEntry({...manualEntry, unit: e.target.value})}
                    placeholder="g, cup, serving"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2 mt-4">
                  <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 active:scale-[0.99] transition-all shadow-xl shadow-slate-200"
                  >
                    Log Entry
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-6 h-6" />
                <h3 className="font-bold text-lg tracking-tight">AI Smart Log</h3>
              </div>
              <p className="text-emerald-50 text-xs mb-4 leading-relaxed opacity-90">
                Type what you ate (e.g., "A bowl of Greek yogurt with honey") and Gemini will do the math.
              </p>
              <form onSubmit={handleSmartAdd}>
                <div className="relative">
                  <textarea
                    value={smartInput}
                    onChange={(e) => setSmartInput(e.target.value)}
                    placeholder="Describe your meal here..."
                    className="w-full h-32 px-4 py-3 bg-white/15 border border-white/20 rounded-xl text-white placeholder:text-emerald-100/50 focus:bg-white/25 focus:outline-none transition-all text-sm resize-none"
                  />
                  <button 
                    type="submit"
                    disabled={isAiLoading || !smartInput}
                    className="absolute bottom-3 right-3 p-2.5 bg-white text-emerald-700 rounded-xl hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg"
                  >
                    {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Data Management
              </h3>
              <div className="space-y-3">