import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from './UserContext';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit, Download, BarChart2 } from 'lucide-react';

// 简单的日历网格生成
function getCalendarDays(current) {
  const first = new Date(current.getFullYear(), current.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay()); // 从周日开始
  const days = [];
  const iter = new Date(start);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(iter));
    iter.setDate(iter.getDate() + 1);
  }
  return days;
}

const emptySet = () => ({ setIndex: 1, reps: 10, weight: 20, restSeconds: 90 });

export default function TrainingLog() {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayLogs, setDayLogs] = useState([]); // 选中日期的所有日志
  const [showEditor, setShowEditor] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [summary, setSummary] = useState(null);

  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()+1}`;

  const calendarDays = useMemo(() => getCalendarDays(currentDate), [currentDate]);

  useEffect(() => {
    if (!user) return;
    loadDayLogs(selectedDate);
    loadMonthlySummary(currentDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, monthKey]);

  const formatDateInput = (d) => d.toISOString().split('T')[0];

  async function loadDayLogs(dateObj) {
    if (!user) return;
    const date = formatDateInput(dateObj);
    const res = await fetch(`/api/workouts/day?userId=${user.id}&date=${date}`);
    if (res.ok) {
      const data = await res.json();
      setDayLogs(data);
    }
  }

  async function loadMonthlySummary(dateObj) {
    if (!user) return;
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth() + 1;
    const res = await fetch(`/api/workouts/summary/month?userId=${user.id}&year=${y}&month=${m}`);
    if (res.ok) setSummary(await res.json());
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  function isToday(d) {
    const t = new Date();
    return d.toDateString() === t.toDateString();
  }
  function isCurrentMonth(d) {
    return d.getMonth() === currentDate.getMonth();
  }
  function isSelected(d) {
    return d.toDateString() === selectedDate.toDateString();
  }

  function startCreate() {
    setEditingLog({
      exerciseName: '',
      startTime: `${formatDateInput(selectedDate)}T09:00:00`,
      endTime: `${formatDateInput(selectedDate)}T10:00:00`,
      durationSeconds: 3600,
      sets: [emptySet()],
      notes: ''
    });
    setShowEditor(true);
  }

  function editLog(log) {
    setEditingLog(JSON.parse(JSON.stringify(log)));
    setShowEditor(true);
  }

  function computeVolume(sets) {
    if (!sets) return 0;
    return sets.reduce((sum, s) => sum + (Number(s.reps || 0) * Number(s.weight || 0)), 0);
  }

  async function saveLog() {
    if (!user || !editingLog) return;
    const ensureSeconds = (s) => {
      if (!s) return s;
      return s.length === 16 ? `${s}:00` : s;
    };
    const payload = {
      ...editingLog,
      startTime: ensureSeconds(editingLog.startTime),
      endTime: ensureSeconds(editingLog.endTime),
      user: { id: user.id },
    };
    const method = editingLog.id ? 'PUT' : 'POST';
    const url = editingLog.id ? `/api/workouts/${editingLog.id}` : '/api/workouts';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setShowEditor(false);
      await loadDayLogs(selectedDate);
      await loadMonthlySummary(currentDate);
    } else {
      alert('保存失败');
    }
  }

  async function removeLog(id) {
    const ok = confirm('确定删除这条日志吗？');
    if (!ok) return;
    const res = await fetch(`/api/workouts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadDayLogs(selectedDate);
      await loadMonthlySummary(currentDate);
    }
  }

  async function exportLogs(format='csv') {
    if (!user) return;
    const res = await fetch(`/api/workouts/export?userId=${user.id}&format=${format}`);
    if (!res.ok) { alert('导出失败'); return; }
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(await res.json(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'workout_logs.json'; a.click(); URL.revokeObjectURL(url);
    } else {
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'workout_logs.csv'; a.click(); URL.revokeObjectURL(url);
    }
  }

  const selectedLogs = dayLogs;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Training Log</h2>
          <p className="text-gray-500">精确记录每次锻炼，自动统计训练量与趋势</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportLogs('csv')} className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm">
            <Download size={16} /> 导出 CSV
          </button>
          <button onClick={() => exportLogs('json')} className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm">
            <Download size={16} /> 导出 JSON
          </button>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-gray-900 font-medium">Training Calendar</div>
            <div className="text-gray-500 text-sm">点击日期查看/新增训练记录</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={previousMonth} className="h-9 w-9 flex items-center justify-center border rounded-md">
              <ChevronLeft size={18} />
            </button>
            <div className="px-3 py-1 text-sm border rounded-md">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button onClick={nextMonth} className="h-9 w-9 flex items-center justify-center border rounded-md">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((d, idx) => (
            <button
              key={idx}
              onClick={() => { setSelectedDate(d); loadDayLogs(d);} }
              className={[
                'h-20 rounded-md border flex items-start p-2 text-sm relative',
                !isCurrentMonth(d) ? 'text-gray-400 bg-gray-50' : 'bg-white',
                isToday(d) ? 'ring-1 ring-indigo-500' : '',
                isSelected(d) ? 'bg-indigo-50 border-indigo-300' : ''
              ].join(' ')}
            >
              <span>{d.getDate()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Day Panel */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-gray-900 font-medium">
              {selectedDate.toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric', weekday:'long' })}
            </div>
            <div className="text-gray-500 text-sm">{selectedLogs.length} 条记录</div>
          </div>
          <div className="flex gap-2">
            <button onClick={startCreate} className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm bg-black text-white">
              <Plus size={16} /> Log Workout
            </button>
          </div>
        </div>

        {selectedLogs.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <div className="mb-2">这一天还没有训练记录</div>
            <button onClick={startCreate} className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm">
              <Plus size={16} /> 立即记录
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedLogs.map((log) => (
              <div key={log.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{log.exerciseName}</div>
                    <div className="text-xs text-gray-500">训练量：{(log.totalVolume ?? computeVolume(log.sets)).toFixed(1)} | 组数：{log.totalSets ?? log.sets?.length}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 border rounded-md" onClick={() => editLog(log)}><Edit size={16} /></button>
                    <button className="p-2 border rounded-md" onClick={() => removeLog(log.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {log.sets?.map((s, i) => (
                    <div key={i} className="text-sm bg-gray-50 border rounded p-2">
                      第{s.setIndex || (i+1)}组：{s.reps} 次 × {s.weight} kg
                      {typeof s.restSeconds === 'number' ? <span className="text-xs text-gray-500">（休息 {s.restSeconds}s）</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 月度汇总与趋势 */}
        {summary && (
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center gap-2 text-gray-800 mb-2"><BarChart2 size={18}/> 本月概览</div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="border rounded p-3">
                <div className="text-gray-500">训练次数</div>
                <div className="text-xl font-semibold">{summary.workoutsCount}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-gray-500">总训练量</div>
                <div className="text-xl font-semibold">{Number(summary.totalVolume || 0).toFixed(1)}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-gray-500">项目数</div>
                <div className="text-xl font-semibold">{Object.keys(summary.volumeByExercise || {}).length}</div>
              </div>
            </div>
            {/* 简易趋势条 */}
            {summary.dailyTrend && (
              <div className="mt-4 flex gap-1 items-end h-20">
                {Object.values(summary.dailyTrend).map((v, i, arr) => {
                  const vmax = Math.max(1, ...arr.map(Number));
                  const h = Math.round(Number(v) / vmax * 72) + 4;
                  return <div key={i} className="w-2 bg-indigo-400 rounded" style={{height: h}}/>;
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-xl rounded-lg shadow p-4">
            <div className="text-lg font-semibold mb-3">{editingLog?.id ? '编辑训练' : '新增训练'}</div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">项目名称</label>
                <input value={editingLog.exerciseName}
                       onChange={e=>setEditingLog({...editingLog, exerciseName: e.target.value})}
                       className="w-full border rounded px-3 py-2 text-sm" placeholder="卧推/深蹲/硬拉等"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">开始时间</label>
                  <input type="datetime-local" value={editingLog.startTime?.slice(0,16)}
                         onChange={e=>setEditingLog({...editingLog, startTime: e.target.value})}
                         className="w-full border rounded px-3 py-2 text-sm"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">结束时间</label>
                  <input type="datetime-local" value={editingLog.endTime?.slice(0,16)}
                         onChange={e=>setEditingLog({...editingLog, endTime: e.target.value})}
                         className="w-full border rounded px-3 py-2 text-sm"/>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">备注</label>
                <textarea value={editingLog.notes||''}
                          onChange={e=>setEditingLog({...editingLog, notes: e.target.value})}
                          className="w-full border rounded px-3 py-2 text-sm" rows={2}/>
              </div>

              {/* 组列表 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">组列表</div>
                  <button className="text-sm px-2 py-1 border rounded" onClick={()=>{
                    const next = {...editingLog};
                    const s = emptySet();
                    s.setIndex = (next.sets?.length || 0) + 1;
                    next.sets = [...(next.sets||[]), s];
                    setEditingLog(next);
                  }}>+ 添加一组</button>
                </div>
                <div className="space-y-2">
                  {editingLog.sets?.map((s, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2">
                      <div className="col-span-2">
                        <input type="number" className="w-full border rounded px-2 py-1 text-sm" value={s.reps}
                               onChange={e=>{ const v = {...editingLog}; v.sets[i].reps = Number(e.target.value); setEditingLog(v); }}/>
                        <div className="text-xs text-gray-500 mt-1">次数</div>
                      </div>
                      <div className="col-span-3">
                        <input type="number" className="w-full border rounded px-2 py-1 text-sm" value={s.weight}
                               onChange={e=>{ const v = {...editingLog}; v.sets[i].weight = Number(e.target.value); setEditingLog(v); }}/>
                        <div className="text-xs text-gray-500 mt-1">重量(kg)</div>
                      </div>
                      <div className="col-span-3">
                        <input type="number" className="w-full border rounded px-2 py-1 text-sm" value={s.restSeconds||0}
                               onChange={e=>{ const v = {...editingLog}; v.sets[i].restSeconds = Number(e.target.value); setEditingLog(v); }}/>
                        <div className="text-xs text-gray-500 mt-1">休息(秒)</div>
                      </div>
                      <div className="col-span-2 flex items-center text-sm">体积：{Number(s.reps||0)*Number(s.weight||0)}</div>
                      <div className="col-span-2 flex items-center justify-end">
                        <button className="px-2 py-1 border rounded text-sm" onClick={()=>{
                          const v = {...editingLog}; v.sets.splice(i,1); v.sets.forEach((x,idx)=>x.setIndex=idx+1); setEditingLog(v);
                        }}>删除</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-right text-sm text-gray-700 mt-2">总训练量：{computeVolume(editingLog.sets)}</div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 border rounded" onClick={()=>setShowEditor(false)}>取消</button>
              <button className="px-3 py-2 bg-black text-white rounded" onClick={saveLog}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
