'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
// ↓ 先ほど作ったファイルへのパス
import { supabase } from './utils/supabase';
import { 
  Calendar, CheckSquare, Users, Clock, LayoutDashboard, Plus, Trash2, 
  CheckCircle, List, GripVertical, ChevronLeft, ChevronRight, Bell, Flag, 
  Edit2, X as XIcon, Copy, ArrowDown, Clipboard, School, 
  Calculator, MousePointerClick, TrendingUp, Settings, Moon, Sun, 
  RefreshCw, Printer, AlertTriangle, Grid, UserPlus,
  Sparkles, BookOpen, Layout, Mail, CalendarClock, ArrowLeft, Bot
} from 'lucide-react';

// --- Types ---
type TaskStatus = 'now' | 'next' | 'someday' | 'done';
type Theme = 'light' | 'dark';
type FontSize = 'small' | 'medium' | 'large';

interface Task {
    id: string;
    content: string;
    details?: string;
    grade: string;
    status: TaskStatus;
    completedAt?: string;
}

interface Announcement {
    id: string;
    grade: string;
    title: string;
    content: string;
}

interface DashboardData {
    schoolName: string;
    weeklyGoal: string;
    todaysEvents: Array<{ id: string; title: string; type: 'school' | 'staff' }>;
    announcements: Announcement[];
}

// --- Components ---

// 1. Modal Component
const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-gray-900">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200">
                        <XIcon size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// 2. Settings Screen
const SettingsScreen = ({
    theme, setTheme,
    fontSize, setFontSize,
    classes, setClasses,
    classTeachers, setClassTeachers,
    handleYearUpdate
}: any) => {
    const [newClass, setNewClass] = useState('');
    const [newTeacher, setNewTeacher] = useState('');
    const [updateStep, setUpdateStep] = useState(0);

    const addClass = () => {
        if (newClass && !classes.includes(newClass)) {
            setClasses([...classes, newClass]);
            if (newTeacher) {
                setClassTeachers((prev: any) => ({ ...prev, [newClass]: newTeacher }));
            }
            setNewClass('');
            setNewTeacher('');
        }
    };

    const removeClass = (cls: string) => {
        setClasses(classes.filter((c: string) => c !== cls));
        setClassTeachers((prev: any) => {
            const newTeachers = { ...prev };
            delete newTeachers[cls];
            return newTeachers;
        });
    };

    const updateTeacher = (cls: string, teacherName: string) => {
        setClassTeachers((prev: any) => ({ ...prev, [cls]: teacherName }));
    };

    const executeUpdate = () => {
        handleYearUpdate();
        setUpdateStep(0);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in">
            <section className={`p-6 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Settings size={24} /> 画面設定
                </h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 opacity-70">テーマ設定</label>
                        <div className="flex gap-4">
                            <button onClick={() => setTheme('light')} className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}><Sun size={24} /> <span>ライトモード</span></button>
                            <button onClick={() => setTheme('dark')} className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition ${theme === 'dark' ? 'border-indigo-500 bg-gray-700 text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}><Moon size={24} /> <span>ダークモード</span></button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 opacity-70">文字サイズ</label>
                        <div className="flex gap-2">
                            {['small', 'medium', 'large'].map(size => (
                                <button key={size} onClick={() => setFontSize(size)} className={`flex-1 py-3 rounded-lg border transition font-bold ${fontSize === size ? 'bg-indigo-600 text-white border-indigo-600' : theme === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-white text-gray-600 border-gray-200'}`}>{size === 'small' ? '小' : size === 'medium' ? '中' : '大'}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className={`p-6 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users size={24} /> クラス・担任設定
                </h3>
                <div className="flex flex-col md:flex-row gap-2 mb-6">
                    <input value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="クラス名 (例: 3年1組)" className={`flex-1 p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                    <input value={newTeacher} onChange={(e) => setNewTeacher(e.target.value)} placeholder="担任名 (例: 山田先生)" className={`flex-1 p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                    <button onClick={addClass} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-bold whitespace-nowrap">追加</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((cls: string) => (
                        <div key={cls} className={`p-3 rounded-lg border flex items-center justify-between gap-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center gap-3 flex-1">
                                <span className="font-bold w-20">{cls}</span>
                                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                <input value={classTeachers[cls] || ''} onChange={(e) => updateTeacher(cls, e.target.value)} placeholder="担任未設定" className={`flex-1 bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`} />
                            </div>
                            <button onClick={() => removeClass(cls)} className="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
                                <XIcon size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className={`p-6 rounded-xl shadow-sm border border-red-200 ${theme === 'dark' ? 'bg-red-900/10' : 'bg-red-50'}`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
                    <AlertTriangle size={24} /> 年度更新
                </h3>
                <p className="text-sm opacity-70 mb-4">年度切り替え処理を行います。現在のタスクや時間割データはリセットされます。</p>
                <button onClick={() => setUpdateStep(1)} className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold flex items-center gap-2 shadow-sm"><RefreshCw size={20} /> 年度更新を開始する</button>
            </section>

            <Modal isOpen={updateStep === 1} onClose={() => setUpdateStep(0)} title="年度更新の確認 (1/2)">
                <div className="text-center py-4">
                    <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
                    <p className="text-lg font-bold mb-2">今年度のデータにはアクセスできなくなりますが、よろしいですか？</p>
                    <div className="flex gap-4 justify-center mt-6">
                        <button onClick={() => setUpdateStep(0)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold">キャンセル</button>
                        <button onClick={() => setUpdateStep(2)} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold">次へ進む</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={updateStep === 2} onClose={() => setUpdateStep(0)} title="年度更新の確認 (2/2)">
                <div className="text-center py-4">
                    <RefreshCw size={48} className="text-red-600 mx-auto mb-4 animate-spin-slow" />
                    <p className="text-lg font-bold mb-6">年度更新を実施します。</p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => setUpdateStep(0)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold">キャンセル</button>
                        <button onClick={executeUpdate} className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold shadow-lg">実行する</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// 3. Menu Screen
const MenuScreen = ({ setCurrentView, data, setData, theme }: any) => {
    // ... (Code remains same, for brevity)
    // ダッシュボードのデータはローカルのままにします（複雑化防止のため）
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [tempSchoolName, setTempSchoolName] = useState('');
    const [tempGoal, setTempGoal] = useState('');
    const [tempEvents, setTempEvents] = useState('');
    const [tempAnnouncements, setTempAnnouncements] = useState<Announcement[]>([]);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const openEdit = (section: string) => {
        if (section === 'schoolName') setTempSchoolName(data.schoolName);
        if (section === 'goal') setTempGoal(data.weeklyGoal);
        if (section === 'events') setTempEvents(data.todaysEvents.map((e: any) => `${e.type === 'school' ? '全校' : '職員'}:${e.title}`).join('\n'));
        if (section === 'announcements') setTempAnnouncements([...data.announcements]);
        setEditingSection(section);
    };

    const saveSchoolName = () => { setData((prev: any) => ({ ...prev, schoolName: tempSchoolName })); setEditingSection(null); };
    const saveGoal = () => { setData((prev: any) => ({ ...prev, weeklyGoal: tempGoal })); setEditingSection(null); };
    const saveEvents = () => {
        const newEvents = tempEvents.split('\n').filter(line => line.trim()).map((line, idx) => {
            const parts = line.split(':');
            const type = parts[0]?.includes('全校') ? 'school' : 'staff';
            const title = parts.length > 1 ? parts.slice(1).join(':') : parts[0];
            return { id: `ne-${idx}`, type: type, title };
        });
        setData((prev: any) => ({ ...prev, todaysEvents: newEvents }));
        setEditingSection(null);
    };
    const addAnnouncement = () => { setTempAnnouncements([...tempAnnouncements, { id: generateId(), grade: '1年部', title: '新しいお知らせ', content: '' }]); };
    const updateTempAnnouncement = (id: string, field: string, value: string) => { setTempAnnouncements(tempAnnouncements.map(a => a.id === id ? { ...a, [field]: value } : a)); };
    const saveAnnouncements = () => { setData((prev: any) => ({ ...prev, announcements: tempAnnouncements })); setEditingSection(null); };

    const cardClass = `p-6 rounded-xl shadow-sm border relative group ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-l-4 border-gray-100'}`;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <Modal isOpen={editingSection === 'schoolName'} onClose={() => setEditingSection(null)} title="学校名を編集">
                <label className="block text-sm font-bold text-gray-700 mb-2">学校名</label>
                <input value={tempSchoolName} onChange={e => setTempSchoolName(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="例: 青空小学校" />
                <button onClick={saveSchoolName} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-bold">保存</button>
            </Modal>

            <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-md relative group">
                <button onClick={() => openEdit('schoolName')} className="absolute top-4 right-4 text-indigo-300 hover:text-white opacity-0 group-hover:opacity-100 transition p-2 bg-indigo-800 rounded-lg">
                     <Edit2 size={18} />
                </button>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    {data.schoolName} <span className="text-xl font-normal opacity-80">業務ポータル</span>
                </h2>
                <p className="text-indigo-200 opacity-90">
                    {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                </p>
            </div>

            <Modal isOpen={editingSection === 'goal'} onClose={() => setEditingSection(null)} title="「今週のめあて」を編集">
                <textarea value={tempGoal} onChange={e => setTempGoal(e.target.value)} className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 outline-none" />
                <button onClick={saveGoal} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-bold">保存</button>
            </Modal>
            <Modal isOpen={editingSection === 'events'} onClose={() => setEditingSection(null)} title="「本日の行事」を編集">
                <p className="text-xs text-gray-500 mb-2">「全校:内容」または「職員:内容」のように入力して改行してください。</p>
                <textarea value={tempEvents} onChange={e => setTempEvents(e.target.value)} className="w-full p-3 border rounded-lg h-48 focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm" />
                <button onClick={saveEvents} className="mt-4 w-full bg-orange-600 text-white py-2 rounded-lg font-bold">保存</button>
            </Modal>
            <Modal isOpen={editingSection === 'announcements'} onClose={() => setEditingSection(null)} title="お知らせを編集">
                <div className="space-y-4">
                    {tempAnnouncements.map(a => (
                        <div key={a.id} className="p-3 border rounded bg-gray-50 relative">
                            <button onClick={() => setTempAnnouncements(tempAnnouncements.filter(t => t.id !== a.id))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><XIcon size={16}/></button>
                            <select value={a.grade} onChange={e => updateTempAnnouncement(a.id, 'grade', e.target.value)} className="mb-2 p-1 border rounded text-sm">
                                {['校長', '教頭', '教務', '1年部', '2年部', '3年部', '4年部', '5年部', '6年部', '専科・他', '全校', '職員'].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <input value={a.title} onChange={e => updateTempAnnouncement(a.id, 'title', e.target.value)} className="w-full mb-2 p-2 border rounded text-sm font-bold" placeholder="タイトル" />
                            <textarea value={a.content} onChange={e => updateTempAnnouncement(a.id, 'content', e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="内容" rows={2} />
                        </div>
                    ))}
                    <button onClick={addAnnouncement} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:bg-gray-50 flex items-center justify-center gap-2">
                        <Plus size={16}/> お知らせを追加
                    </button>
                </div>
                <button onClick={saveAnnouncements} className="mt-4 w-full bg-yellow-600 text-white py-2 rounded-lg font-bold">保存</button>
            </Modal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${cardClass} border-l-4 !border-l-indigo-500`}>
                    <button onClick={() => openEdit('goal')} className="absolute top-4 right-4 text-gray-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                        <Edit2 size={18} />
                    </button>
                    <div className="flex items-center gap-2 mb-4">
                        <Flag className="text-indigo-600" />
                        <h3 className="font-bold text-lg">今週のめあて</h3>
                    </div>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                        <p className={`text-xl font-bold text-center whitespace-pre-wrap ${theme === 'dark' ? 'text-indigo-200' : 'text-indigo-900'}`}>{data.weeklyGoal}</p>
                    </div>
                </div>
                <div className={`${cardClass} border-l-4 !border-l-orange-500`}>
                    <button onClick={() => openEdit('events')} className="absolute top-4 right-4 text-gray-300 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition">
                        <Edit2 size={18} />
                    </button>
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-orange-600" />
                        <h3 className="font-bold text-lg">本日の行事</h3>
                    </div>
                    <ul className="space-y-3">
                        {data.todaysEvents.map((e: any) => (
                            <li key={e.id} className={`flex items-center gap-3 p-2 rounded transition ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${e.type === 'school' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {e.type === 'school' ? '全校' : '職員'}
                                </span>
                                <span className="font-medium">{e.title}</span>
                            </li>
                        ))}
                        {data.todaysEvents.length === 0 && <li className="text-gray-400 text-sm">予定はありません</li>}
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className={`md:col-span-2 ${cardClass}`}>
                    <button onClick={() => openEdit('announcements')} className="absolute top-4 right-4 text-gray-300 hover:text-yellow-600 opacity-0 group-hover:opacity-100 transition">
                        <Edit2 size={18} />
                    </button>
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Bell className="text-yellow-500" /> 各学年部よりお知らせ
                    </h3>
                    <div className="space-y-4">
                        {data.announcements.map((a: Announcement) => (
                            <div key={a.id} className={`flex gap-4 p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="flex-shrink-0 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs shadow-sm">
                                    {a.grade.replace('年部','').substring(0,2)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{a.title}</p>
                                    <p className="text-xs opacity-70 mt-1 whitespace-pre-wrap">{a.content}</p>
                                </div>
                            </div>
                        ))}
                        {data.announcements.length === 0 && <p className="text-gray-400 text-sm p-4">お知らせはありません</p>}
                    </div>
                </div>
                <div className={`${cardClass} flex flex-col justify-between`}>
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Clock className="text-gray-400" /> クイックアクセス
                    </h3>
                    <div className="space-y-3">
                        <button onClick={() => setCurrentView('schedule')} className="w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition flex items-center justify-center gap-2">
                            <Calendar size={18} /> 時間割・週案へ
                        </button>
                        <button onClick={() => setCurrentView('tasks')} className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 transition flex items-center justify-center gap-2">
                            <CheckSquare size={18} /> 今日のタスクへ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 4. Task Management Screen (DB Connected)
const TaskManagementScreen = ({ tasks, setTasks, selectedGrade, setSelectedGrade, grades, setGrades, theme }: any) => {
    const [newTaskInput, setNewTaskInput] = useState('');
    const [newGradeInput, setNewGradeInput] = useState('');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const gradeTasks = tasks.filter((t: Task) => t.grade === selectedGrade);
    
    const generateId = () => Math.random().toString(36).substr(2, 9);
    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const columns = [
        { id: 'now', title: '🔥 今すること', color: 'text-red-800', bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50' },
        { id: 'next', title: '📅 次すること', color: 'text-blue-800', bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50' },
        { id: 'someday', title: '📁 いつかすること', color: 'text-gray-700', bg: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100' },
        { id: 'done', title: '✅ 本日の完了', color: 'text-green-800', bg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50' },
    ];

    const addTask = async (content: string, grade: string) => {
        const newTask: Task = { id: generateId(), content, grade, status: 'now' };
        
        // 1. 画面を先に更新(サクサク感のため)
        setTasks([...tasks, newTask]);

        // 2. データベースに保存
        const { error } = await supabase.from('tasks').insert([{
            id: newTask.id,
            content: newTask.content,
            grade: newTask.grade,
            status: newTask.status
        }]);
        if(error) console.error("Error adding task:", error);
    };
    
    const addGrade = () => {
        if (newGradeInput && !grades.includes(newGradeInput)) {
            setGrades([...grades, newGradeInput]);
            setNewGradeInput('');
        }
    };

    const updateTask = async (updatedTask: Task) => { 
        // 1. 画面を先に更新
        setTasks(tasks.map((t: Task) => t.id === updatedTask.id ? updatedTask : t)); 
        setSelectedTask(null); 

        // 2. DB更新
        await supabase.from('tasks').update({
            content: updatedTask.content,
            details: updatedTask.details
        }).eq('id', updatedTask.id);
    };
    
    const moveTask = async (draggedId: string, targetStatus: TaskStatus, targetTaskId?: string) => {
        // UI上での並び替え（以前と同じロジック）
        let updatedTasks = [...tasks];
        const draggedIndex = updatedTasks.findIndex(t => t.id === draggedId);
        if (draggedIndex === -1) return;

        const draggedTask = { ...updatedTasks[draggedIndex], status: targetStatus };
        if (targetStatus === 'done') {
             draggedTask.completedAt = getTodayDate();
        } else {
             delete draggedTask.completedAt;
        }

        updatedTasks.splice(draggedIndex, 1); 

        if (targetTaskId) {
            const targetIndex = updatedTasks.findIndex(t => t.id === targetTaskId);
            if (targetIndex !== -1) {
                updatedTasks.splice(targetIndex, 0, draggedTask);
            } else {
                updatedTasks.push(draggedTask);
            }
        } else {
            updatedTasks.push(draggedTask);
        }
        
        setTasks(updatedTasks);
        setDraggedTaskId(null);

        // DB更新（ステータスのみ保存）
        // ※注意: 並び順はDBには保存されません（リロードすると戻ります）
        await supabase.from('tasks').update({
            status: targetStatus,
            completed_at: draggedTask.completedAt
        }).eq('id', draggedId);
    };

    const handleColumnDrop = (e: any, status: TaskStatus) => {
        e.preventDefault();
        if (draggedTaskId) {
            moveTask(draggedTaskId, status);
        }
    };

    const handleTaskDrop = (e: any, targetTask: Task) => {
        e.stopPropagation();
        e.preventDefault();
        if (draggedTaskId && draggedTaskId !== targetTask.id) {
            moveTask(draggedTaskId, targetTask.status, targetTask.id);
        }
    };

    const deleteTask = async (id: string, e: any) => {
        e?.stopPropagation(); 
        setTasks(tasks.filter((t: Task) => t.id !== id));
        if (selectedTask?.id === id) setSelectedTask(null);

        // DB削除
        await supabase.from('tasks').delete().eq('id', id);
    };
    const handleDragStart = (e: any, taskId: string) => { setDraggedTaskId(taskId); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver = (e: any) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

    const TaskEditModal = () => {
        const [editContent, setEditContent] = useState(selectedTask?.content || '');
        const [editDetails, setEditDetails] = useState(selectedTask?.details || '');
        if (!selectedTask) return null;
        return (
            <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="タスク詳細">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">タスク名</label>
                        <input value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">詳細メモ</label>
                        <textarea value={editDetails} onChange={e => setEditDetails(e.target.value)} className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="詳細を入力..." />
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t mt-4">
                        <button onClick={(e) => deleteTask(selectedTask.id, e)} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"><Trash2 size={16} /> 削除</button>
                        <button onClick={() => updateTask({ ...selectedTask, content: editContent, details: editDetails })} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700">保存</button>
                    </div>
                </div>
            </Modal>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {selectedTask && <TaskEditModal />}
            <div className={`mb-6 p-4 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold opacity-60 px-2">管理職・学年を選択</h3>
                    <div className="flex gap-2">
                        <input value={newGradeInput} onChange={(e) => setNewGradeInput(e.target.value)} className={`text-xs p-1 px-2 border rounded ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`} placeholder="新しい役職/学年..." />
                        <button onClick={addGrade} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"><Plus size={14} /></button>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {grades.map((grade: string) => {
                        const isManager = grade.includes('校長') || grade.includes('教頭') || grade.includes('教務');
                        return (
                            <button key={grade} onClick={() => setSelectedGrade(grade)} className={`py-3 rounded-lg font-bold text-sm transition-all duration-200 border truncate px-2 ${selectedGrade === grade ? (isManager ? 'bg-purple-700 text-white border-purple-700 shadow-md transform scale-105' : 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105') : (theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50')}`}>
                                {grade}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mb-6 flex gap-2">
                <input type="text" value={newTaskInput} onChange={(e) => setNewTaskInput(e.target.value)} placeholder={`${selectedGrade}のタスクを追加...`} className={`flex-1 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} onKeyPress={(e) => e.key === 'Enter' && newTaskInput && (addTask(newTaskInput, selectedGrade), setNewTaskInput(''))} />
                <button onClick={() => { if(newTaskInput) { addTask(newTaskInput, selectedGrade); setNewTaskInput(''); } }} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700 flex items-center gap-2"><Plus size={20} /> 追加</button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden min-h-[500px]">
                {columns.map(col => (
                    <div key={col.id} className={`${col.bg} rounded-xl p-4 flex flex-col border border-gray-200/50 transition-colors ${draggedTaskId ? 'hover:bg-opacity-80 ring-2 ring-transparent hover:ring-indigo-200' : ''}`} onDragOver={handleDragOver} onDrop={(e) => handleColumnDrop(e, col.id as TaskStatus)}>
                        <h3 className={`font-bold ${col.color} mb-3 flex items-center justify-between`}>
                            <span>{col.title}</span>
                            <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">
                                {col.id === 'done' ? gradeTasks.filter((t: Task) => t.status === 'done' && t.completedAt === getTodayDate()).length : gradeTasks.filter((t: Task) => t.status === col.id).length}
                            </span>
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pb-10">
                            {gradeTasks.filter((t: Task) => col.id === 'done' ? t.status === 'done' && t.completedAt === getTodayDate() : t.status === col.id).map((task: Task) => (
                                <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} onDrop={(e) => handleTaskDrop(e, task)} onClick={() => setSelectedTask(task)} className={`p-3 rounded-lg shadow-sm border cursor-pointer group transition-all relative hover:shadow-md active:scale-95 ${task.status === 'done' ? 'opacity-60 bg-gray-50' : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}>
                                    <div className="flex items-start gap-2">
                                        <GripVertical size={16} className="text-gray-300 mt-1 flex-shrink-0" />
                                        <div className="flex-1">
                                            <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>{task.content}</span>
                                            {task.details && <div className="mt-1 text-xs text-gray-400 line-clamp-1 flex items-center gap-1"><List size={10} /> 詳細あり</div>}
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pl-2 bg-inherit">
                                         <button onClick={(e) => deleteTask(task.id, e)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100/50">
                                        {task.status !== 'done' && (
                                            <>
                                                {task.status !== 'now' && <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, 'now'); }} className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200">🔥 今</button>}
                                                {task.status !== 'next' && <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, 'next'); }} className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 border border-blue-200">📅 次</button>}
                                                {task.status !== 'someday' && <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, 'someday'); }} className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 border border-gray-200">📁 いつか</button>}
                                            </>
                                        )}
                                        <div className="flex-1"></div>
                                        {task.status !== 'done' && <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, 'done'); }} className="text-xs p-1 text-green-600 hover:bg-green-50 rounded" title="完了"><CheckCircle size={16} /></button>}
                                    </div>
                                </div>
                            ))}
                            <div className="h-full min-h-[50px] flex items-center justify-center text-gray-400 text-xs border-2 border-dashed border-transparent rounded-lg transition-all" >{gradeTasks.filter((t: Task) => t.status === col.id).length === 0 && 'ここにドラッグ'}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 5. Schedule View
const ScheduleView = ({ scheduleDate, setScheduleDate, allSchedules, setAllSchedules, classes, classTeachers, theme }: any) => {
    // ... (Code remains largely same but could be connected to DB later)
    // 複雑さを避けるため、時間割は一旦ローカルステートのままにします
    const [viewMode, setViewMode] = useState('week');
    const [currentClass, setCurrentClass] = useState(classes[0] || '1年1組');
    const [clipboard, setClipboard] = useState<string | null>(null);
    const [selectedCells, setSelectedCells] = useState(new Set());
    const [lastFocusedCell, setLastFocusedCell] = useState<string | null>(null);
    const inputRefs = useRef<any>({});

    const WEEK_DAYS = ['月', '火', '水', '木', '金'];
    const PERIODS = [1, 2, 3, 4, 5, 6];

    const getDateString = (date: Date) => {
        if (!(date instanceof Date) || isNaN(date.getTime())) return '';
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().split('T')[0];
    };

    const schedule = allSchedules[currentClass] || {};

    const weekDates = useMemo(() => {
        const currentDay = scheduleDate.getDay();
        const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(scheduleDate);
        monday.setDate(scheduleDate.getDate() + distanceToMonday);
        return WEEK_DAYS.map((_, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            return date;
        });
    }, [scheduleDate]);

    const statistics = useMemo(() => {
        const weeklyCounts: any = {};
        const totalCounts: any = {};
        const weekDateStrings = weekDates.map(d => getDateString(d));

        Object.entries(schedule).forEach(([key, item]: [string, any]) => {
            const [year, month, day] = key.split('-');
            const dateStr = `${year}-${month}-${day}`;
            if (item.subject) {
                totalCounts[item.subject] = (totalCounts[item.subject] || 0) + 1;
                if (weekDateStrings.includes(dateStr)) {
                    weeklyCounts[item.subject] = (weeklyCounts[item.subject] || 0) + 1;
                }
            }
        });
        const sortedSubjects = Array.from(new Set([...Object.keys(weeklyCounts), ...Object.keys(totalCounts)])).sort();
        return { weeklyCounts, totalCounts, sortedSubjects };
    }, [schedule, weekDates]);

    const changeWeek = (offset: number) => {
        const newDate = new Date(scheduleDate);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + offset * 7);
        } else {
            newDate.setDate(newDate.getDate() + offset);
        }
        setScheduleDate(newDate);
    };

    const getKey = (date: Date, period: number) => `${getDateString(date)}-${period}`;

    const handleScheduleChange = (key: string, field: string, value: string, targetClass?: string) => {
        const cls = targetClass || currentClass;
        setAllSchedules((prev: any) => ({
            ...prev,
            [cls]: {
                ...(prev[cls] || {}),
                [key]: { ...(prev[cls]?.[key] || { subject: '', teacher: '' }), [field]: value }
            }
        }));
    };

    const applyTeacherToWeek = () => {
        const teacherName = classTeachers[currentClass];
        if (!teacherName) {
            alert(`${currentClass}の担任が設定されていません。\n[設定] > [クラス・担任設定] から登録してください。`);
            return;
        }
        if (!window.confirm(`${currentClass}の今週のすべてのコマに、担任「${teacherName}」を一括入力しますか？\n(既に入力されている内容は上書きされません)`)) {
            return;
        }
        setAllSchedules((prev: any) => {
            const currentClassSchedule = { ...(prev[currentClass] || {}) };
            weekDates.forEach(date => {
                PERIODS.forEach(period => {
                    const key = getKey(date, period);
                    const existingCell = currentClassSchedule[key] || { subject: '', teacher: '' };
                    if (!existingCell.teacher || !existingCell.teacher.trim()) {
                        currentClassSchedule[key] = { ...existingCell, teacher: teacherName };
                    }
                });
            });
            return { ...prev, [currentClass]: currentClassSchedule };
        });
    };

    const handleInputMouseDown = (e: any, id: string) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const newSet = new Set(selectedCells);
            if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
            setSelectedCells(newSet);
            setLastFocusedCell(id);
        } else {
            if (!selectedCells.has(id)) setSelectedCells(new Set([id]));
            setLastFocusedCell(id);
        }
    };

    const handleFocus = (id: string) => {
        if (!selectedCells.has(id)) setSelectedCells(new Set([id]));
        setLastFocusedCell(id);
    };

    const handleKeyDown = (e: any, date: Date, period: number, field: string) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === 'Enter') {
            e.preventDefault();
            const dateStr = getDateString(date);
            if (field === 'subject') {
                const nextKey = `${dateStr}-${period}-teacher`;
                if (inputRefs.current[nextKey]) inputRefs.current[nextKey].focus();
            } else {
                const nextPeriod = period + 1;
                if (nextPeriod <= 6) {
                    const nextKey = `${dateStr}-${nextPeriod}-subject`;
                    if (inputRefs.current[nextKey]) inputRefs.current[nextKey].focus();
                }
            }
        }
    };

    const copyCell = () => {
        if (lastFocusedCell) {
            const parts = lastFocusedCell.split('-');
            if (parts.length >= 5) {
                const field = parts.pop();
                const key = parts.join('-');
                const val = schedule[key]?.[field as any] || '';
                setClipboard(val);
            }
        }
    };

    const pasteCell = () => {
        if (clipboard !== null && selectedCells.size > 0) {
            setAllSchedules((prev: any) => {
                const newSchedules = { ...prev };
                selectedCells.forEach((id: any) => {
                    const parts = id.split('-');
                    if (parts.length >= 5) {
                        const field = parts.pop();
                        const key = parts.join('-');
                        const cls = currentClass;
                        if (!newSchedules[cls]) newSchedules[cls] = {};
                        newSchedules[cls][key] = { ...(newSchedules[cls][key] || { subject: '', teacher: '' }), [field]: clipboard };
                    }
                });
                return newSchedules;
            });
        }
    };

    const copyDown = () => {
        if (selectedCells.size > 0) {
            setAllSchedules((prev: any) => {
                const classSchedule = { ...(prev[currentClass] || {}) };
                selectedCells.forEach((id: any) => {
                    const parts = id.split('-');
                    if (parts.length >= 5) {
                        const field = parts.pop();
                        const period = parseInt(parts[3]);
                        const currentKey = `${parts[0]}-${parts[1]}-${parts[2]}-${period}`;
                        const nextPeriod = period + 1;
                        if (nextPeriod <= 6) {
                            const nextKey = `${parts[0]}-${parts[1]}-${parts[2]}-${nextPeriod}`;
                            const val = classSchedule[currentKey]?.[field] || '';
                            classSchedule[nextKey] = { ...(classSchedule[nextKey] || { subject: '', teacher: '' }), [field]: val };
                        }
                    }
                });
                return { ...prev, [currentClass]: classSchedule };
            });
        }
    };

    const handlePrint = () => { window.print(); };

    return (
        <div className="space-y-4 pb-20 print:p-0 print:pb-0">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 no-print dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold dark:text-indigo-400"><School size={20} /></div>
                    {viewMode === 'week' && (
                        <select value={currentClass} onChange={(e) => setCurrentClass(e.target.value)} className="p-2 border rounded-lg font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600">
                            {classes.map((c: string) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    )}
                    {viewMode === 'day' && <span className="font-bold text-lg dark:text-white">全クラス一覧表示</span>}
                </div>
                {viewMode === 'week' && (
                    <div className="flex items-center gap-2 bg-indigo-50 p-1 rounded-lg border border-indigo-100 self-end xl:self-auto dark:bg-gray-700 dark:border-gray-600">
                        <button onClick={applyTeacherToWeek} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition bg-white text-indigo-700 shadow-sm border hover:bg-indigo-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 whitespace-nowrap" title="設定済みの担任名を一括入力">
                            <UserPlus size={14} /> 担任一括入力
                        </button>
                        <div className="w-px h-6 bg-indigo-200 mx-1 dark:bg-gray-600"></div>
                        <button onClick={copyCell} disabled={!lastFocusedCell} className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition ${lastFocusedCell ? 'bg-white text-indigo-700 shadow-sm dark:bg-gray-600 dark:text-gray-200' : 'text-gray-400 cursor-not-allowed'}`}><Copy size={14} /> コピー</button>
                        <button onClick={pasteCell} disabled={selectedCells.size === 0 || clipboard === null} className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition ${selectedCells.size > 0 && clipboard !== null ? 'bg-white text-indigo-700 shadow-sm dark:bg-gray-600 dark:text-gray-200' : 'text-gray-400 cursor-not-allowed'}`}><Clipboard size={14} /> 貼付</button>
                        <button onClick={copyDown} disabled={selectedCells.size === 0} className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition ${selectedCells.size > 0 ? 'bg-white text-indigo-700 shadow-sm dark:bg-gray-600 dark:text-gray-200' : 'text-gray-400 cursor-not-allowed'}`}><ArrowDown size={14} /> 下へ</button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition shadow-sm font-bold text-sm"><Printer size={16} /> PDF/印刷</button>
                    <button onClick={() => setViewMode(viewMode === 'week' ? 'day' : 'week')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition shadow-sm font-bold text-sm ${viewMode === 'day' ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700 dark:bg-gray-700 dark:text-white'}`}>
                        {viewMode === 'week' ? <Grid size={16} /> : <Calendar size={16} />}
                        {viewMode === 'week' ? '全クラス表示' : '個別表示'}
                    </button>
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg shadow-inner dark:bg-gray-700">
                        <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-white rounded-full transition dark:hover:bg-gray-600"><ChevronLeft size={20}/></button>
                        <span className="text-sm font-bold text-gray-700 min-w-[120px] text-center dark:text-gray-200">
                            {viewMode === 'week' ? `${weekDates[0].toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'})} 〜` : scheduleDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                        </span>
                        <button onClick={() => changeWeek(1)} className="p-1 hover:bg-white rounded-full transition dark:hover:bg-gray-600"><ChevronRight size={20}/></button>
                    </div>
                </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mb-2 flex items-center gap-2 no-print">
                <MousePointerClick size={16} /> <span>ヒント: <b>Ctrl (Command)</b> キーを押しながらクリックで複数選択</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto print-area dark:bg-gray-800 dark:border-gray-700">
                {viewMode === 'week' && (
                    <>
                        <div className="p-4 hidden print:block text-center font-bold text-xl">{currentClass} 日課表</div>
                        <table className="w-full text-sm text-left border-collapse table-fixed min-w-[800px]">
                            <thead>
                                <tr>
                                    <th className="border-b p-2 bg-gray-100 w-12 text-center text-gray-600 font-bold text-xs dark:bg-gray-700 dark:text-gray-300">限</th>
                                    {weekDates.map((date, i) => (
                                        <th key={i} className="border-b border-l p-2 bg-indigo-50 text-center dark:bg-gray-700 dark:border-gray-600">
                                            <div className="text-indigo-900 font-bold text-sm dark:text-indigo-300">{WEEK_DAYS[i]}</div>
                                            <div className="text-indigo-600 text-[10px] font-medium dark:text-indigo-400">{date.toLocaleDateString('ja-JP', { day: 'numeric' })}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border-b border-r p-2 bg-gray-50 text-center font-bold text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">朝</td>
                                    {weekDates.map((date) => {
                                        const key = `${getDateString(date)}-morning`;
                                        return (
                                            <td key={key} className="border-b border-r p-1 dark:border-gray-600">
                                                <input className="w-full p-1 text-center text-xs text-gray-700 bg-gray-50/50 rounded hover:bg-white focus:bg-white focus:outline-none transition-all dark:bg-gray-800 dark:text-gray-200" placeholder="-" />
                                            </td>
                                        );
                                    })}
                                </tr>
                                {PERIODS.map(period => (
                                    <tr key={period}>
                                        <td className="border-b border-r p-2 bg-gray-50 text-center font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">{period}</td>
                                        {weekDates.map(date => {
                                            const key = getKey(date, period);
                                            const subjectId = `${key}-subject`;
                                            const teacherId = `${key}-teacher`;
                                            const isSubjectSelected = selectedCells.has(subjectId);
                                            const isTeacherSelected = selectedCells.has(teacherId);
                                            return (
                                                <td key={key} className="border-b border-r p-1 align-top h-24 dark:border-gray-600">
                                                    <div className="flex flex-col h-full gap-1">
                                                        <div className="flex-1">
                                                            <input ref={el => { if (el) inputRefs.current[subjectId] = el; }} value={schedule[key]?.subject || ''} onChange={(e) => handleScheduleChange(key, 'subject', e.target.value)} onMouseDown={(e) => handleInputMouseDown(e, subjectId)} onFocus={() => handleFocus(subjectId)} onKeyDown={(e) => handleKeyDown(e, date, period, 'subject')} autoComplete="off" className={`w-full p-1 rounded border-transparent border hover:border-indigo-200 focus:border-indigo-500 focus:bg-white focus:outline-none text-sm font-bold text-gray-800 text-center dark:text-gray-100 ${isSubjectSelected ? 'bg-blue-100 ring-2 ring-blue-300 dark:bg-blue-900' : 'bg-indigo-50/30 dark:bg-gray-700'}`} placeholder="-" />
                                                        </div>
                                                        <div>
                                                            <input ref={el => { if (el) inputRefs.current[teacherId] = el; }} value={schedule[key]?.teacher || ''} onChange={(e) => handleScheduleChange(key, 'teacher', e.target.value)} onMouseDown={(e) => handleInputMouseDown(e, teacherId)} onFocus={() => handleFocus(teacherId)} onKeyDown={(e) => handleKeyDown(e, date, period, 'teacher')} autoComplete="off" className={`w-full p-1 rounded border-transparent border hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:outline-none text-[10px] text-gray-600 text-center dark:text-gray-300 ${isTeacherSelected ? 'bg-blue-100 ring-2 ring-blue-300 dark:bg-blue-900' : 'bg-gray-50 dark:bg-gray-700'}`} placeholder="担任" />
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
                {viewMode === 'day' && (
                    <>
                        <div className="p-4 hidden print:block text-center font-bold text-xl">{scheduleDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} 全クラス日課表</div>
                        <table className="w-full text-sm text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr>
                                    <th className="border-b p-2 bg-gray-100 w-16 text-center text-gray-600 font-bold text-xs dark:bg-gray-700 dark:text-gray-300">クラス</th>
                                    {PERIODS.map(period => (
                                        <th key={period} className="border-b border-l p-2 bg-indigo-50 text-center dark:bg-gray-700 dark:border-gray-600">
                                            <div className="text-indigo-900 font-bold text-sm dark:text-indigo-300">{period}限</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map((cls: string) => (
                                    <tr key={cls}>
                                        <td className="border-b border-r p-2 bg-gray-50 text-center font-bold text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">{cls}</td>
                                        {PERIODS.map(period => {
                                            const key = getKey(scheduleDate, period);
                                            const cellData = allSchedules[cls]?.[key] || { subject: '', teacher: '' };
                                            return (
                                                <td key={`${cls}-${period}`} className="border-b border-r p-1 align-top h-16 dark:border-gray-600">
                                                    <div className="flex flex-col h-full gap-1">
                                                        <input value={cellData.subject} onChange={(e) => handleScheduleChange(key, 'subject', e.target.value, cls)} className="w-full p-1 bg-indigo-50/30 text-center font-bold text-gray-800 focus:bg-white focus:outline-none rounded dark:bg-gray-800 dark:text-gray-200" placeholder="-" />
                                                        <input value={cellData.teacher} onChange={(e) => handleScheduleChange(key, 'teacher', e.target.value, cls)} className="w-full p-0.5 bg-transparent text-center text-[10px] text-gray-500 focus:bg-white focus:outline-none rounded dark:text-gray-400" placeholder="-" />
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
            {viewMode === 'week' && (
                <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-emerald-500 no-print dark:bg-gray-800 dark:border-emerald-600">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg dark:text-emerald-400"><Calculator size={24} /> <span>時数集計：{currentClass}</span></div>
                        <div className="text-xs text-gray-500 flex gap-4 dark:text-gray-400"><span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-100 rounded-full"></span> 今週</span><span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-100 rounded-full"></span> 累計</span></div>
                    </div>
                    {statistics.sortedSubjects.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {statistics.sortedSubjects.map((subject: string) => (
                                <div key={subject} className="flex flex-col bg-gray-50 rounded-lg p-2 border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                                    <div className="text-sm font-bold text-gray-700 mb-1 truncate dark:text-gray-200" title={subject}>{subject}</div>
                                    <div className="flex gap-1 mt-auto">
                                        <div className="flex-1 bg-white border border-emerald-200 rounded px-1 py-0.5 text-center dark:bg-gray-800 dark:border-gray-600">
                                            <span className="text-[10px] text-emerald-600 block leading-none">今週</span>
                                            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{statistics.weeklyCounts[subject] || 0}</span>
                                        </div>
                                        <div className="flex-1 bg-white border border-gray-200 rounded px-1 py-0.5 text-center dark:bg-gray-800 dark:border-gray-600">
                                            <span className="text-[10px] text-gray-500 block leading-none">累計</span>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{statistics.totalCounts[subject] || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                            <TrendingUp className="mx-auto mb-2 opacity-20" />
                            <p>教科を入力すると、ここに集計が表示されます</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// 6. Gen AI Screen Component
const GenAIScreen = ({ theme }: any) => {
    const [selectedTool, setSelectedTool] = useState<string | null>(null);

    const tools = [
        { id: 'lesson_plan', title: '授業案生成AI', description: '教科書や単元名から、質の高い授業案案を自動生成します。', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 'board_plan', title: '板書計画生成AI', description: '授業のねらいに沿った、分かりやすい板書レイアウトを提案します。', icon: Layout, color: 'text-green-600', bg: 'bg-green-100' },
        { id: 'newsletter', title: '学年通信文書生成AI', description: '季節の挨拶や行事の案内など、温かみのある文章を作成します。', icon: Mail, color: 'text-orange-600', bg: 'bg-orange-100' },
        { id: 'schedule_adjust', title: '日程調整AI', description: '会議や面談の候補日から、最適なスケジュール調整案を出します。', icon: CalendarClock, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    if (selectedTool) {
        const tool = tools.find(t => t.id === selectedTool);
        if (!tool) return null;
        return (
            <div className="space-y-6 animate-in fade-in">
                <button onClick={() => setSelectedTool(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition font-bold mb-4">
                    <ArrowLeft size={20} /> ツール一覧に戻る
                </button>
                <div className={`p-8 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center min-h-[400px] ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
                    <div className={`p-4 rounded-full mb-4 ${tool.bg} ${tool.color}`}>
                        <tool.icon size={48} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{tool.title}</h2>
                    <p className="text-gray-500 mb-8 max-w-md">{tool.description}</p>
                    <div className="bg-yellow-50 text-yellow-800 px-6 py-4 rounded-lg border border-yellow-200 flex items-center gap-3">
                        <Bot size={24} />
                        <div className="text-left">
                            <p className="font-bold">開発中 / Coming Soon</p>
                            <p className="text-sm opacity-80">この機能には Gemini API が組み込まれる予定です。</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className={`p-6 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="text-purple-500" size={24} />
                    <h2 className="text-xl font-bold">校務支援 生成AIツール</h2>
                </div>
                <p className="text-gray-500 text-sm">Geminiを活用して、日々の業務時間を短縮しましょう。使用したいツールを選択してください。</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map(tool => (
                    <button key={tool.id} onClick={() => setSelectedTool(tool.id)} className={`p-6 rounded-xl shadow-sm border text-left transition-all duration-200 hover:shadow-md hover:scale-[1.02] flex items-start gap-4 group ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                        <div className={`p-3 rounded-lg ${tool.bg} ${tool.color} group-hover:opacity-80 transition`}>
                            <tool.icon size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">{tool.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed opacity-80">{tool.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// 7. All Tasks View
const AllTasksView = ({ tasks, theme }: any) => (
    <div className={`p-6 rounded-xl shadow-sm border h-full overflow-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><List /> 全学年タスク一括管理</h2>
        <div className="space-y-4">
            {tasks.filter((t: Task) => t.status !== 'done').map((task: Task) => (
                <div key={task.id} className={`flex items-center p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <span className={`w-20 text-xs font-bold px-2 py-1 rounded text-center mr-4 ${['校長', '教頭', '教務'].includes(task.grade) ? 'bg-purple-100 text-purple-800' : 'bg-indigo-50 text-indigo-600'}`}>{task.grade}</span>
                    <span className="flex-1 font-medium">{task.content} {task.details && <span className="ml-2 text-xs opacity-60">- {task.details}</span>}</span>
                    <span className={`text-xs px-2 py-1 rounded text-white ${task.status === 'now' ? 'bg-red-500' : task.status === 'next' ? 'bg-blue-500' : 'bg-gray-400'}`}>{task.status.toUpperCase()}</span>
                </div>
            ))}
        </div>
    </div>
);

// --- Main Component ---
export default function SchoolManagerAppV19() {
    const INITIAL_TASKS: Task[] = [
        // 初期タスクは一旦空にします（DBから読み込むため）
    ];

    const INITIAL_DASHBOARD: DashboardData = {
        schoolName: '〇〇小学校',
        weeklyGoal: 'あいさつ運動を強化し、地域との連携を深めよう',
        todaysEvents: [
            { id: 'e1', title: '避難訓練 (3限目)', type: 'school' },
            { id: 'e2', title: '職員会議 (16:00〜)', type: 'staff' },
        ],
        announcements: [
            { id: 'a1', grade: '1年部', title: 'アサガオ観察セットの準備', content: '来週月曜日に使用します。倉庫の確認をお願いします。' },
            { id: 'a2', grade: '5年部', title: '林間学校のしおり印刷完了', content: '職員室の棚に置いてあります。各自配布をお願いします。' },
        ]
    };

    const INITIAL_CLASSES = ['1年1組', '1年2組', '2年1組', '職員室'];
    const INITIAL_CLASS_TEACHERS = {'1年1組': '田中先生', '1年2組': '鈴木先生', '2年1組': '佐藤先生'};
    const INITIAL_GRADES = ['校長', '教頭', '教務', '1年部', '2年部', '3年部', '4年部', '5年部', '6年部', '専科・他'];

    const [mounted, setMounted] = useState(false);
    const [currentView, setCurrentView] = useState('menu');
    const [theme, setTheme] = useState<Theme>('light');
    const [fontSize, setFontSize] = useState<FontSize>('medium');
    const [classes, setClasses] = useState(INITIAL_CLASSES);
    const [classTeachers, setClassTeachers] = useState(INITIAL_CLASS_TEACHERS);
    const [grades, setGrades] = useState(INITIAL_GRADES);
    
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [dashboardData, setDashboardData] = useState(INITIAL_DASHBOARD);
    const [scheduleDate, setScheduleDate] = useState(new Date()); 
    const [allSchedules, setAllSchedules] = useState({});
    const [selectedGrade, setSelectedGrade] = useState('1年部');

    useEffect(() => {
        setMounted(true);
        // Supabaseからタスクを取得
        const fetchTasks = async () => {
            const { data, error } = await supabase.from('tasks').select('*');
            if (error) console.error("Error fetching tasks:", error);
            else if (data) {
                // DBのデータをアプリの形式に変換
                const formattedTasks = data.map((t: any) => ({
                    id: t.id,
                    content: t.content,
                    details: t.details,
                    grade: t.grade,
                    status: t.status,
                    completedAt: t.completed_at
                }));
                setTasks(formattedTasks);
            }
        };
        fetchTasks();

        const loadState = (key: string) => {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : null;
        };
        const savedTheme = loadState('sm_theme');
        if (savedTheme) setTheme(savedTheme);
        const savedClasses = loadState('sm_classes');
        if (savedClasses) setClasses(savedClasses);
        const savedTeachers = loadState('sm_class_teachers');
        if (savedTeachers) setClassTeachers(savedTeachers);
        const savedGrades = loadState('sm_grades');
        if (savedGrades) setGrades(savedGrades);
        // TasksはDBから読み込むのでLocalStorageからは読まない
        const savedDashboard = loadState('sm_dashboard');
        if (savedDashboard) setDashboardData(savedDashboard);
        const savedSchedules = loadState('sm_schedules');
        if (savedSchedules) setAllSchedules(savedSchedules);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('sm_theme', JSON.stringify(theme));
            localStorage.setItem('sm_classes', JSON.stringify(classes));
            localStorage.setItem('sm_class_teachers', JSON.stringify(classTeachers));
            localStorage.setItem('sm_grades', JSON.stringify(grades));
            // TasksはDB管理なのでLocalStorageには保存しない（重複防止）
            localStorage.setItem('sm_dashboard', JSON.stringify(dashboardData));
            localStorage.setItem('sm_schedules', JSON.stringify(allSchedules));
        }
    }, [theme, classes, classTeachers, grades, dashboardData, allSchedules, mounted]);

    const handleYearUpdate = () => {
        if (window.confirm('本当に年度更新を行いますか？全てのデータがリセットされます。')) {
            setTasks([]);
            setAllSchedules({});
            setDashboardData({ ...dashboardData, todaysEvents: [], announcements: [] });
            setClasses(INITIAL_CLASSES);
            setClassTeachers(INITIAL_CLASS_TEACHERS);
            setGrades(INITIAL_GRADES);
            alert("年度更新が完了しました。データがリセットされました。");
        }
    };

    const getBaseClasses = () => {
        let base = "h-screen font-sans flex flex-col md:flex-row overflow-hidden transition-colors duration-300 ";
        if (theme === 'dark') base += "bg-gray-900 text-gray-100 ";
        else base += "bg-gray-50 text-gray-900 ";
        if (fontSize === 'small') base += "text-sm ";
        if (fontSize === 'large') base += "text-lg ";
        return base;
    };

    const menuItems = [
        { id: 'menu', icon: LayoutDashboard, label: 'メニュー' },
        { id: 'tasks', icon: CheckSquare, label: 'タスク管理' },
        { id: 'schedule', icon: Calendar, label: '行事・日課' },
        { id: 'allTasks', icon: List, label: '全体一覧' },
        { id: 'gen_ai', icon: Sparkles, label: '生成AI' },
        { id: 'settings', icon: Settings, label: '設定' }
    ];

    if (!mounted) return null;

    return (
        <div className={getBaseClasses()}>
            <aside className={`w-full md:w-20 flex-shrink-0 flex flex-row md:flex-col items-center md:items-center justify-around md:justify-start p-2 md:py-6 z-20 shadow-xl no-print ${theme === 'dark' ? 'bg-gray-800' : 'bg-indigo-900 text-white'}`}>
                <div className="hidden md:flex items-center justify-center mb-6 w-full">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-indigo-900'}`}>小</div>
                </div>
                <nav className="flex md:flex-col gap-1 md:gap-4 w-full justify-around md:justify-start">
                    {menuItems.map((item) => (
                        <button key={item.id} onClick={() => setCurrentView(item.id)} title={item.label} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${currentView === item.id ? (theme === 'dark' ? 'bg-gray-700 text-white shadow-lg' : 'bg-white text-indigo-900 shadow-lg') : 'opacity-70 hover:opacity-100'}`}>
                            <item.icon size={24} strokeWidth={currentView === item.id ? 2.5 : 2} />
                            <span className="text-[10px] md:hidden mt-1">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 overflow-hidden relative flex flex-col">
                <header className={`border-b px-6 py-3 flex justify-between items-center shadow-sm z-10 no-print ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                     <h1 className="text-lg font-bold opacity-90">
                         {currentView === 'menu' && 'ダッシュボード'}
                         {currentView === 'tasks' && 'マイタスク管理'}
                         {currentView === 'schedule' && '行事・日課表設定'}
                         {currentView === 'allTasks' && '全体タスク一覧'}
                         {currentView === 'gen_ai' && '生成AIツール'}
                         {currentView === 'settings' && 'システム設定'}
                     </h1>
                     <div className="text-sm opacity-60">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                    {currentView === 'menu' && <MenuScreen setCurrentView={setCurrentView} data={dashboardData} setData={setDashboardData} theme={theme} />}
                    {currentView === 'tasks' && <TaskManagementScreen tasks={tasks} setTasks={setTasks} selectedGrade={selectedGrade} setSelectedGrade={setSelectedGrade} grades={grades} setGrades={setGrades} theme={theme} />}
                    {currentView === 'allTasks' && <AllTasksView tasks={tasks} theme={theme} />}
                    {currentView === 'schedule' && <ScheduleView scheduleDate={scheduleDate} setScheduleDate={setScheduleDate} allSchedules={allSchedules} setAllSchedules={setAllSchedules} classes={classes} classTeachers={classTeachers} theme={theme} />}
                    {currentView === 'gen_ai' && <GenAIScreen theme={theme} />}
                    {currentView === 'settings' && <SettingsScreen theme={theme} setTheme={setTheme} fontSize={fontSize} setFontSize={setFontSize} classes={classes} setClasses={setClasses} classTeachers={classTeachers} setClassTeachers={setClassTeachers} handleYearUpdate={handleYearUpdate} />}
                </div>
            </main>
        </div>
    );
}