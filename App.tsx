/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Calculator, 
  Settings, 
  Trophy,
  Plus,
  CheckCircle2,
  Clock,
  ChevronRight,
  User,
  TrendingUp,
  Target,
  BarChart3,
  Award,
  AlertCircle,
  CalendarDays,
  Save
} from 'lucide-react';
import type { UserStats, Task, Grade, TimetableEntry, TimetableSettings } from './types';

// --- Helpers ---

const getLetterGrade = (percentage: number) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

const getGradeColor = (letter: string) => {
  switch (letter) {
    case 'A': return 'text-emerald-400';
    case 'B': return 'text-blue-400';
    case 'C': return 'text-yellow-400';
    case 'D': return 'text-orange-400';
    case 'F': return 'text-red-400';
    default: return 'text-white';
  }
};

const addMinutes = (time: string, mins: number) => {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m + mins);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'planner', icon: CalendarIcon, label: 'Quest Log' },
    { id: 'deadlines', icon: AlertCircle, label: 'Deadlines' },
    { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
    { id: 'grades', icon: Calculator, label: 'The Forge' },
    { id: 'ranks', icon: Award, label: 'Ranks' },
    { id: 'timetable', icon: Clock, label: 'Chronos' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 h-screen border-r border-white/10 flex flex-col p-6 fixed left-0 top-0 bg-[#0a0a0a] z-50">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-white flex items-center justify-center">
          <Clock className="text-black w-6 h-6" />
        </div>
        <h1 className="font-display font-bold text-xl tracking-tighter">CHRONOS</h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-black' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <User size={16} />
          </div>
          <div>
            <p className="text-xs font-bold">STUDENT_01</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Rank: Novice</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const XPBar = ({ stats }: { stats: UserStats | null }) => {
  if (!stats) return null;
  const nextLevelXp = stats.level * 1000;
  const progress = (stats.xp / nextLevelXp) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-display font-black italic">LVL {stats.level}</span>
          <span className="text-white/40 text-xs font-mono uppercase tracking-tighter">Experience Points</span>
        </div>
        <span className="text-sm font-mono">{stats.xp} / {nextLevelXp} XP</span>
      </div>
      <div className="h-4 bg-white/5 border border-white/10 relative overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full xp-gradient"
        />
      </div>
    </div>
  );
};

// --- Pages ---

const Dashboard = ({ stats, tasks, grades }: { stats: UserStats | null, tasks: Task[], grades: Grade[] }) => {
  const pendingTasks = tasks.filter(t => !t.completed).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  const upcomingDeadlines = pendingTasks.slice(0, 3);
  
  const averageScore = useMemo(() => {
    if (grades.length === 0) return 0;
    const totalScore = grades.reduce((acc, g) => acc + g.score, 0);
    const totalMax = grades.reduce((acc, g) => acc + g.max_score, 0);
    return (totalScore / totalMax) * 100;
  }, [grades]);

  const stats_overview = [
    { label: 'Pending Quests', value: pendingTasks.length, icon: Target, color: 'text-blue-400' },
    { label: 'Average Score', value: averageScore.toFixed(1) + '%', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Next Deadline', value: upcomingDeadlines[0]?.due_date || 'None', icon: AlertCircle, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-12">
      <section>
        <XPBar stats={stats} />
      </section>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats_overview.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="brutalist-card flex items-center gap-4"
          >
            <div className={`p-3 bg-white/5 rounded-none ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-display font-bold italic">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="brutalist-card lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-bold text-lg italic uppercase">Upcoming Deadlines</h2>
            <button className="text-xs text-white/40 hover:text-white flex items-center gap-1">
              ALL DEADLINES <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    task.type === 'exam' ? 'bg-red-500' : task.type === 'homework' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{task.type} • Due {task.due_date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-red-400">DUE SOON</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-white/40 italic">No upcoming deadlines. You're all caught up!</p>
            )}
          </div>
        </div>

        <div className="brutalist-card">
          <h2 className="font-display font-bold text-lg italic uppercase mb-6">Class Pulse</h2>
          <div className="space-y-6">
            {grades.slice(0, 4).map(grade => {
              const percentage = (grade.score / grade.max_score) * 100;
              const letter = getLetterGrade(percentage);
              return (
                <div key={grade.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold">{grade.subject}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{percentage.toFixed(0)}%</p>
                  </div>
                  <span className={`text-xl font-display font-black italic ${getGradeColor(letter)}`}>
                    {letter}
                  </span>
                </div>
              );
            })}
            {grades.length === 0 && <p className="text-sm text-white/40 italic">No data in the forge.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Deadlines = ({ tasks }: { tasks: Task[] }) => {
  const pendingTasks = tasks.filter(t => !t.completed).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-black italic uppercase">Deadlines</h1>
        <p className="text-white/40 text-sm">Chronological view of all your upcoming academic obligations.</p>
      </div>

      <div className="space-y-4">
        {pendingTasks.map(task => (
          <div key={task.id} className="p-6 border border-white/10 bg-[#141414] flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`w-1 h-12 ${
                task.type === 'exam' ? 'bg-red-500' : task.type === 'homework' ? 'bg-blue-500' : 'bg-green-500'
              }`} />
              <div>
                <h3 className="font-bold text-lg">{task.title}</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{task.type}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display font-black italic">{task.due_date}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Target Date</p>
            </div>
          </div>
        ))}
        {pendingTasks.length === 0 && (
          <div className="text-center py-20 border border-white/10 bg-[#141414]">
            <CheckCircle2 className="mx-auto mb-4 text-emerald-400" size={48} />
            <p className="text-white/40 italic">Zero deadlines detected. Enjoy your freedom.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Calendar = ({ tasks }: { tasks: Task[] }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentMonth, currentYear, firstDayOfMonth, daysInMonth]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-black italic uppercase">Calendar</h1>
          <p className="text-white/40 text-sm">Visual overview of your academic month.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentMonth(m => m === 0 ? 11 : m - 1)} className="p-2 hover:bg-white/5 border border-white/10">{"<"}</button>
          <span className="font-display font-bold italic uppercase min-w-[120px] text-center">{monthNames[currentMonth]} {currentYear}</span>
          <button onClick={() => setCurrentMonth(m => m === 11 ? 0 : m + 1)} className="p-2 hover:bg-white/5 border border-white/10">{">"}</button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-l border-t border-white/10">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="p-4 border-r border-b border-white/10 text-center text-[10px] text-white/40 uppercase tracking-widest font-bold bg-white/5">{d}</div>
        ))}
        {calendarDays.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="p-4 border-r border-b border-white/10 bg-white/[0.02]" />;
          
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayTasks = tasks.filter(t => t.due_date === dateStr);

          return (
            <div key={day} className="min-h-[120px] p-2 border-r border-b border-white/10 hover:bg-white/[0.02] transition-colors">
              <span className="text-xs font-mono text-white/40">{day}</span>
              <div className="mt-2 space-y-1">
                {dayTasks.map(t => (
                  <div key={t.id} className={`text-[9px] p-1 truncate ${
                    t.type === 'exam' ? 'bg-red-500/20 text-red-400 border-l-2 border-red-500' : 
                    t.type === 'homework' ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-500' : 
                    'bg-green-500/20 text-green-400 border-l-2 border-green-500'
                  }`}>
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Timetable = ({ settings, onSave }: { settings: TimetableSettings, onSave: (s: TimetableSettings) => void }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const generatedSchedule = useMemo(() => {
    const schedule = [];
    let currentTime = localSettings.start_time;

    for (let i = 1; i <= localSettings.num_classes; i++) {
      const endTime = addMinutes(currentTime, localSettings.class_duration);
      schedule.push({
        type: 'class',
        index: i,
        start: currentTime,
        end: endTime
      });
      currentTime = endTime;

      if (i === localSettings.break_after) {
        const breakEnd = addMinutes(currentTime, localSettings.break_duration);
        schedule.push({
          type: 'break',
          start: currentTime,
          end: breakEnd
        });
        currentTime = breakEnd;
      }
    }
    return schedule;
  }, [localSettings]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-black italic uppercase">Chronos</h1>
          <p className="text-white/40 text-sm">Dynamic school timetable based on your daily structure.</p>
        </div>
        <button 
          onClick={() => onSave(localSettings)}
          className="bg-white text-black px-6 py-2 font-bold flex items-center gap-2 hover:bg-white/90 transition-colors"
        >
          <Save size={18} /> SAVE STRUCTURE
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="brutalist-card h-fit space-y-6">
          <h2 className="font-display font-bold text-lg italic uppercase">Structure</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Classes Per Day</label>
              <input 
                type="number" 
                value={localSettings.num_classes}
                onChange={e => setLocalSettings({...localSettings, num_classes: parseInt(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Start Time</label>
              <input 
                type="time" 
                value={localSettings.start_time}
                onChange={e => setLocalSettings({...localSettings, start_time: e.target.value})}
                className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Class Duration (min)</label>
              <input 
                type="number" 
                value={localSettings.class_duration}
                onChange={e => setLocalSettings({...localSettings, class_duration: parseInt(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Break Duration (min)</label>
              <input 
                type="number" 
                value={localSettings.break_duration}
                onChange={e => setLocalSettings({...localSettings, break_duration: parseInt(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Break After Class #</label>
              <input 
                type="number" 
                value={localSettings.break_after}
                onChange={e => setLocalSettings({...localSettings, break_after: parseInt(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-white outline-none"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-5 gap-4">
            {days.map(day => (
              <div key={day} className="space-y-4">
                <div className="p-3 bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest">{day}</span>
                </div>
                <div className="space-y-2">
                  {generatedSchedule.map((slot, i) => (
                    <div 
                      key={`${day}-${i}`} 
                      className={`p-3 border ${slot.type === 'break' ? 'border-dashed border-white/20 bg-transparent' : 'border-white/10 bg-[#141414]'} text-center`}
                    >
                      {slot.type === 'class' ? (
                        <>
                          <p className="text-[10px] text-white/40 font-mono">{slot.start}</p>
                          <p className="text-xs font-bold mt-1">Class {slot.index}</p>
                        </>
                      ) : (
                        <p className="text-[10px] text-white/20 uppercase tracking-widest italic">Break</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Planner = ({ tasks, onComplete, onAdd }: { tasks: Task[], onComplete: (id: number) => void, onAdd: (t: any) => void }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', type: 'homework', due_date: '', xp_reward: 50 });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-black italic uppercase">Quest Log</h1>
          <p className="text-white/40 text-sm">Manage your academic challenges and earn rewards.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-white text-black px-6 py-2 font-bold flex items-center gap-2 hover:bg-white/90 transition-colors"
        >
          <Plus size={18} /> NEW QUEST
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tasks.map(task => (
          <motion.div 
            layout
            key={task.id} 
            className={`p-6 border ${task.completed ? 'border-white/5 opacity-50' : 'border-white/10'} bg-[#141414] flex items-center justify-between`}
          >
            <div className="flex items-center gap-6">
              <button 
                onClick={() => !task.completed && onComplete(task.id)}
                className={`w-8 h-8 border flex items-center justify-center transition-colors ${
                  task.completed ? 'bg-green-500 border-green-500' : 'border-white/20 hover:border-white'
                }`}
              >
                {task.completed && <CheckCircle2 size={16} className="text-black" />}
              </button>
              <div>
                <h3 className={`font-bold ${task.completed ? 'line-through text-white/40' : ''}`}>{task.title}</h3>
                <div className="flex gap-4 mt-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} /> {task.due_date}
                  </span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1">
                    <BookOpen size={10} /> {task.type}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-mono ${task.completed ? 'text-white/20' : 'text-green-400'}`}>
                {task.completed ? 'CLAIMED' : `+${task.xp_reward} XP`}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border-2 border-white p-8 w-full max-w-md"
            >
              <h2 className="text-2xl font-display font-black italic uppercase mb-6">New Quest</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Title</label>
                  <input 
                    type="text" 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-white outline-none"
                    placeholder="e.g. History Essay"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Type</label>
                    <select 
                      value={newTask.type}
                      onChange={e => setNewTask({...newTask, type: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-white outline-none"
                    >
                      <option value="homework">Homework</option>
                      <option value="exam">Exam</option>
                      <option value="study">Study</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Due Date</label>
                    <input 
                      type="date" 
                      value={newTask.due_date}
                      onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-white outline-none"
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => setShowAdd(false)}
                    className="flex-1 border border-white/20 py-3 font-bold hover:bg-white/5"
                  >
                    CANCEL
                  </button>
                  <button 
                    onClick={() => {
                      onAdd(newTask);
                      setShowAdd(false);
                      setNewTask({ title: '', type: 'homework', due_date: '', xp_reward: 50 });
                    }}
                    className="flex-1 bg-white text-black py-3 font-bold hover:bg-white/90"
                  >
                    CREATE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Grades = ({ grades, onAdd }: { grades: Grade[], onAdd: (g: any) => void }) => {
  const [newGrade, setNewGrade] = useState({ subject: '', score: '', max_score: '100' });
  
  const averageScore = useMemo(() => {
    if (grades.length === 0) return 0;
    const totalScore = grades.reduce((acc, g) => acc + g.score, 0);
    const totalMax = grades.reduce((acc, g) => acc + g.max_score, 0);
    return (totalScore / totalMax) * 100;
  }, [grades]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-black italic uppercase">The Forge</h1>
          <p className="text-white/40 text-sm">Input your scores and track your academic progress.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/40 uppercase tracking-widest">Total Average</p>
          <p className="text-4xl font-display font-black italic">{averageScore.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-5 px-6 py-2 text-[10px] text-white/40 uppercase tracking-widest">
            <span className="col-span-2">Subject</span>
            <span>Raw Score</span>
            <span>Percentage</span>
            <span className="text-right">Grade</span>
          </div>
          {grades.map(grade => {
            const percentage = (grade.score / grade.max_score) * 100;
            const letter = getLetterGrade(percentage);
            return (
              <div key={grade.id} className="grid grid-cols-5 p-6 border border-white/10 bg-[#141414] items-center">
                <span className="col-span-2 font-bold">{grade.subject}</span>
                <span className="font-mono text-xs">{grade.score} / {grade.max_score}</span>
                <span className="font-mono">{percentage.toFixed(1)}%</span>
                <span className={`text-right font-display font-black italic ${getGradeColor(letter)}`}>{letter}</span>
              </div>
            );
          })}
        </div>

        <div className="brutalist-card h-fit">
          <h2 className="font-display font-bold text-lg italic uppercase mb-6">Add Score</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Subject / Class</label>
              <input 
                type="text" 
                value={newGrade.subject}
                onChange={e => setNewGrade({...newGrade, subject: e.target.value})}
                className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-white outline-none"
                placeholder="e.g. Physics"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Score Received</label>
                <input 
                  type="number" 
                  value={newGrade.score}
                  onChange={e => setNewGrade({...newGrade, score: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Total Score (Max)</label>
                <input 
                  type="number" 
                  value={newGrade.max_score}
                  onChange={e => setNewGrade({...newGrade, max_score: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-white outline-none"
                />
              </div>
            </div>
            <button 
              onClick={() => {
                onAdd({ 
                  ...newGrade, 
                  score: parseFloat(newGrade.score), 
                  max_score: parseFloat(newGrade.max_score),
                  weight: 1.0 // Default weight for simple average
                });
                setNewGrade({ subject: '', score: '', max_score: '100' });
              }}
              className="w-full bg-white text-black py-3 font-bold hover:bg-white/90 mt-4"
            >
              ADD SCORE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Ranks = ({ grades }: { grades: Grade[] }) => {
  const rankedClasses = useMemo(() => {
    const subjects: Record<string, { score: number, max: number }> = {};
    
    grades.forEach(g => {
      if (!subjects[g.subject]) {
        subjects[g.subject] = { score: 0, max: 0 };
      }
      subjects[g.subject].score += g.score;
      subjects[g.subject].max += g.max_score;
    });

    return Object.entries(subjects)
      .map(([name, data]) => {
        const percentage = (data.score / data.max) * 100;
        return {
          name,
          score: data.score,
          max: data.max,
          percentage,
          letter: getLetterGrade(percentage)
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [grades]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-black italic uppercase">Ranks</h1>
        <p className="text-white/40 text-sm">Your classes ranked from best to worst performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rankedClasses.map((cls, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            key={cls.name} 
            className="p-8 border border-white/10 bg-[#141414] flex items-center justify-between relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/5" />
            <div className="flex items-center gap-8">
              <span className="text-4xl font-display font-black italic text-white/10 w-12">#{i + 1}</span>
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight">{cls.name}</h3>
                <p className="text-xs font-mono text-white/40 mt-1 uppercase">Total: {cls.score} / {cls.max}</p>
              </div>
            </div>
            <div className="flex items-center gap-12">
              <div className="text-right">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Efficiency</p>
                <p className="text-xl font-mono">{cls.percentage.toFixed(1)}%</p>
              </div>
              <div className="w-16 h-16 border-2 border-white/10 flex items-center justify-center">
                <span className={`text-3xl font-display font-black italic ${getGradeColor(cls.letter)}`}>
                  {cls.letter}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        {rankedClasses.length === 0 && (
          <div className="text-center py-20 border border-white/10 bg-[#141414]">
            <BarChart3 className="mx-auto mb-4 text-white/20" size={48} />
            <p className="text-white/40 italic">No rankings available. Enter scores in The Forge to see your standing.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [timetableSettings, setTimetableSettings] = useState<TimetableSettings>({
    num_classes: 6,
    start_time: '08:00',
    class_duration: 50,
    break_duration: 15,
    break_after: 3
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, tasksRes, gradesRes, settingsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/tasks'),
        fetch('/api/grades'),
        fetch('/api/timetable/settings')
      ]);
      setStats(await statsRes.json());
      setTasks(await tasksRes.json());
      setGrades(await gradesRes.json());
      const settings = await settingsRes.json();
      if (settings) setTimetableSettings(settings);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const completeTask = async (id: number) => {
    try {
      const res = await fetch(`/api/tasks/${id}/complete`, { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        setStats(prev => prev ? { ...prev, xp: data.newXp, level: data.newLevel } : null);
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
      }
    } catch (error) {
      console.error("Failed to complete task", error);
    }
  };

  const addTask = async (task: any) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to add task", error);
    }
  };

  const addGrade = async (grade: any) => {
    try {
      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grade)
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to add grade", error);
    }
  };

  const saveTimetableSettings = async (settings: TimetableSettings) => {
    try {
      const res = await fetch('/api/timetable/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) setTimetableSettings(settings);
    } catch (error) {
      console.error("Failed to save settings", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent animate-spin mb-4 mx-auto" />
          <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Initializing System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-12 max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard stats={stats} tasks={tasks} grades={grades} />}
            {activeTab === 'planner' && <Planner tasks={tasks} onComplete={completeTask} onAdd={addTask} />}
            {activeTab === 'deadlines' && <Deadlines tasks={tasks} />}
            {activeTab === 'calendar' && <Calendar tasks={tasks} />}
            {activeTab === 'grades' && <Grades grades={grades} onAdd={addGrade} />}
            {activeTab === 'ranks' && <Ranks grades={grades} />}
            {activeTab === 'timetable' && <Timetable settings={timetableSettings} onSave={saveTimetableSettings} />}
            {activeTab === 'settings' && (
              <div className="max-w-2xl space-y-8">
                <h1 className="text-4xl font-display font-black italic uppercase">Settings</h1>
                <div className="space-y-6">
                  <div className="p-6 border border-white/10 bg-[#141414]">
                    <h3 className="font-bold mb-4">Profile</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Display Name</label>
                        <input type="text" defaultValue="STUDENT_01" className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-white outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border border-white/10 bg-[#141414]">
                    <h3 className="font-bold mb-4">System</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dark Mode (Always On)</span>
                      <div className="w-12 h-6 bg-white flex items-center px-1">
                        <div className="w-4 h-4 bg-black" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
