import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useCloseStore from '../hooks/useCloseStore';
import { PHASES, ASSIGNEES, COLUMNS, COLUMN_LABELS } from '../data/closeDefaults';

function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getRecentMonths() {
  const months = [];
  const now = new Date();
  for (let i = 2; i >= -1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

function formatMonth(m) {
  const [y, mo] = m.split('-');
  const d = new Date(parseInt(y), parseInt(mo) - 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatCompletedDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function PhaseTag({ phase }) {
  const color = PHASES[phase] || PHASES.Other;
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}26`, color }}
    >
      {phase}
    </span>
  );
}

function AssigneeDropdown({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); if (!disabled) setOpen(!open); }}
        className="text-[11px] px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#334155] hover:bg-gray-200 transition-colors cursor-pointer disabled:cursor-default"
        disabled={disabled}
      >
        {value}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
            {ASSIGNEES.map((a) => (
              <button
                key={a}
                onClick={(e) => { e.stopPropagation(); onChange(a); setOpen(false); }}
                className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors cursor-pointer ${a === value ? 'text-breeze-blue font-medium' : 'text-gray-600'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TaskCard({ task, index, locked, onAssigneeChange, faded }) {
  const isComplete = task.status === 'complete';
  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={locked}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 mb-2 transition-all ${
            snapshot.isDragging ? 'shadow-lg scale-[1.02]' : 'shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
          } ${isComplete ? 'opacity-70' : ''} ${faded ? 'opacity-40' : ''}`}
        >
          <p className={`text-sm font-medium text-[#0E1A2B] mb-2 leading-snug ${isComplete ? 'line-through text-gray-400' : ''}`}>
            {task.task}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <PhaseTag phase={task.phase} />
            <AssigneeDropdown value={task.assignee} onChange={onAssigneeChange} disabled={locked} />
            <span className="text-[10px] text-gray-400 ml-auto">{task.dueDay}</span>
          </div>
          {isComplete && task.completedAt && (
            <p className="text-[10px] text-gray-400 mt-2">
              Completed {formatCompletedDate(task.completedAt)} by {task.completedBy}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
}

function Column({ status, tasks, locked, onAssigneeChange, filterFn }) {
  return (
    <div className="flex-1 min-w-[240px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <h3 className="text-sm font-semibold text-[#0E1A2B]">{COLUMN_LABELS[status]}</h3>
        <span className="text-[11px] font-medium bg-[#F1F5F9] text-gray-500 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] rounded-xl p-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50/50' : 'bg-[#F8FAFC]'
            }`}
          >
            {tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                locked={locked}
                onAssigneeChange={(a) => onAssigneeChange(task.id, a)}
                faded={filterFn && !filterFn(task)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

function AddTaskModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [phase, setPhase] = useState('Other');
  const [assignee, setAssignee] = useState('Unassigned');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: `custom-${Date.now()}`,
      task: name.trim(),
      phase,
      assignee,
      dueDay: '',
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold text-[#0E1A2B] mb-4">Add Task</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Task name"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-breeze-blue/20 focus:border-breeze-blue"
          />
          <div className="flex gap-3">
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-breeze-blue/20 bg-white"
            >
              {Object.keys(PHASES).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-breeze-blue/20 bg-white"
            >
              {ASSIGNEES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-breeze-blue text-white rounded-lg hover:bg-breeze-dark transition-colors cursor-pointer">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MonthlyClosePage() {
  const currentMonth = getCurrentMonth();
  const recentMonths = useMemo(getRecentMonths, []);
  const store = useCloseStore(currentMonth);
  const { month, data, switchMonth, moveTask, setAssignee, addTask, toggleLock } = store;

  const [filterAssignee, setFilterAssignee] = useState(null);
  const [filterPhase, setFilterPhase] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const tasks = data.tasks;
  const totalTasks = tasks.length;
  const completeTasks = tasks.filter((t) => t.status === 'complete').length;
  const pct = totalTasks > 0 ? Math.round((completeTasks / totalTasks) * 100) : 0;

  const columnCounts = {};
  for (const col of COLUMNS) {
    columnCounts[col] = tasks.filter((t) => t.status === col).length;
  }

  const filterFn = (filterAssignee || filterPhase)
    ? (t) => {
        if (filterAssignee && t.assignee !== filterAssignee) return false;
        if (filterPhase && t.phase !== filterPhase) return false;
        return true;
      }
    : null;

  const activePhases = [...new Set(tasks.map((t) => t.phase))];

  function onDragEnd(result) {
    if (!result.destination || data.locked) return;
    const { draggableId, destination } = result;
    moveTask(draggableId, destination.droppableId, destination.index);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#F8FAFC]">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-[#0E1A2B]">Monthly Close</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              disabled={data.locked}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-breeze-blue transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Task
            </button>
            <button
              onClick={toggleLock}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                data.locked
                  ? 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                  : 'bg-breeze-blue text-white hover:bg-breeze-dark'
              }`}
            >
              {data.locked ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  Unlock
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  Lock Month
                </>
              )}
            </button>
          </div>
        </div>

        {/* Month tabs */}
        <div className="flex items-center gap-1 mb-4">
          {recentMonths.map((m) => {
            const mData = (() => { try { return JSON.parse(localStorage.getItem(`luca-close-${m}`)); } catch { return null; } })();
            const isLocked = mData?.locked;
            return (
              <button
                key={m}
                onClick={() => switchMonth(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  m === month
                    ? 'bg-breeze-blue text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {formatMonth(m)}
                {isLocked && <span className="ml-1.5 text-green-400">&#10003;</span>}
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-700">
              {completeTasks} of {totalTasks} tasks complete — {pct}%
            </span>
            <span className="text-[11px] text-gray-400">
              Not Started: {columnCounts.not_started} &middot; In Progress: {columnCounts.in_progress} &middot; In Review: {columnCounts.in_review} &middot; Complete: {columnCounts.complete}
            </span>
          </div>
          <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div className="h-full bg-breeze-blue rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mr-1">Assignee</span>
            {['All', ...ASSIGNEES.filter((a) => a !== 'Unassigned')].map((a) => (
              <button
                key={a}
                onClick={() => setFilterAssignee(a === 'All' ? null : a)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors cursor-pointer ${
                  (a === 'All' && !filterAssignee) || filterAssignee === a
                    ? 'bg-breeze-blue text-white'
                    : 'bg-[#F1F5F9] text-gray-500 hover:bg-gray-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mr-1">Phase</span>
            <button
              onClick={() => setFilterPhase(null)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors cursor-pointer ${
                !filterPhase ? 'bg-breeze-blue text-white' : 'bg-[#F1F5F9] text-gray-500 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {activePhases.map((p) => {
              const color = PHASES[p] || PHASES.Other;
              const active = filterPhase === p;
              return (
                <button
                  key={p}
                  onClick={() => setFilterPhase(active ? null : p)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors cursor-pointer"
                  style={{
                    backgroundColor: active ? color : `${color}15`,
                    color: active ? '#fff' : color,
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-auto px-6 py-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 min-h-full">
            {COLUMNS.map((col) => (
              <Column
                key={col}
                status={col}
                tasks={tasks.filter((t) => t.status === col)}
                locked={data.locked}
                onAssigneeChange={setAssignee}
                filterFn={filterFn}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {showAddModal && (
        <AddTaskModal
          onAdd={addTask}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
