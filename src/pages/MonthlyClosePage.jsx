import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useCloseStore, { getAllAssignees, addCustomAssignee } from '../hooks/useCloseStore';
import { PHASES, COLUMNS, COLUMN_LABELS } from '../data/closeDefaults';

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

function AssigneeDropdown({ value, onChange, disabled, assignees, onCreateAssignee }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  function handleCreate(e) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (trimmed) {
      onCreateAssignee(trimmed);
      onChange(trimmed);
    }
    setNewName('');
    setCreating(false);
    setOpen(false);
  }

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
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setCreating(false); }} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
            {assignees.map((a) => (
              <button
                key={a}
                onClick={(e) => { e.stopPropagation(); onChange(a); setOpen(false); }}
                className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors cursor-pointer ${a === value ? 'text-breeze-blue font-medium' : 'text-gray-600'}`}
              >
                {a}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              {creating ? (
                <form onSubmit={handleCreate} className="px-2 py-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Name"
                    className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-breeze-blue/30"
                    onKeyDown={(e) => { if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
                  />
                </form>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setCreating(true); }}
                  className="block w-full text-left px-3 py-1.5 text-xs text-breeze-blue hover:bg-gray-50 cursor-pointer"
                >
                  + Add person...
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TaskCard({ task, index, locked, onAssigneeChange, assignees, onCreateAssignee, onCardClick }) {
  const isComplete = task.status === 'complete';
  const isLucaPrepared = task.status === 'luca_prepared';

  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={locked}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => { if (isLucaPrepared && onCardClick) onCardClick(task); }}
          className={`bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 mb-2 transition-all ${
            snapshot.isDragging ? 'shadow-lg scale-[1.02]' : 'shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
          } ${isComplete ? 'opacity-70' : ''} ${isLucaPrepared ? 'border-breeze-blue/30 cursor-pointer hover:border-breeze-blue/60' : ''}`}
        >
          <p className={`text-sm font-medium text-[#0E1A2B] mb-2 leading-snug ${isComplete ? 'line-through text-gray-400' : ''}`}>
            {task.task}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <PhaseTag phase={task.phase} />
            <AssigneeDropdown
              value={task.assignee}
              onChange={onAssigneeChange}
              disabled={locked}
              assignees={assignees}
              onCreateAssignee={onCreateAssignee}
            />
            <span className="text-[10px] text-gray-400 ml-auto">{task.dueDay}</span>
          </div>
          {isComplete && task.completedAt && (
            <p className="text-[10px] text-gray-400 mt-2">
              Completed {formatCompletedDate(task.completedAt)} by {task.completedBy}
            </p>
          )}
          {isLucaPrepared && task.completedAt && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[10px] text-breeze-blue">Prepared {formatCompletedDate(task.completedAt)} by {task.completedBy}</span>
              <span className="text-[10px] text-gray-400 ml-auto">Click to review</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

function Column({ status, tasks, locked, onAssigneeChange, assignees, onCreateAssignee, onCardClick }) {
  const isLucaCol = status === 'luca_prepared';
  return (
    <div className="flex-1 min-w-[220px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <h3 className={`text-sm font-semibold ${isLucaCol ? 'text-breeze-blue' : 'text-[#0E1A2B]'}`}>
          {COLUMN_LABELS[status]}
        </h3>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
          isLucaCol ? 'bg-blue-50 text-breeze-blue' : 'bg-[#F1F5F9] text-gray-500'
        }`}>
          {tasks.length}
        </span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] rounded-xl p-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50/50' : isLucaCol ? 'bg-blue-50/30' : 'bg-[#F8FAFC]'
            }`}
          >
            {tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                locked={locked}
                onAssigneeChange={(a) => onAssigneeChange(task.id, a)}
                assignees={assignees}
                onCreateAssignee={onCreateAssignee}
                onCardClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

function AddTaskModal({ onAdd, onClose, assignees, onCreateAssignee }) {
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
              {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
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

export default function MonthlyClosePage({ onNavigateToChat }) {
  const currentMonth = getCurrentMonth();
  const recentMonths = useMemo(getRecentMonths, []);
  const store = useCloseStore(currentMonth);
  const { month, data, switchMonth, moveTask, setAssignee, addTask, toggleLock } = store;

  const [filterAssignee, setFilterAssignee] = useState(null);
  const [filterPhase, setFilterPhase] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignees, setAssignees] = useState(getAllAssignees);

  function handleCreateAssignee(name) {
    addCustomAssignee(name);
    setAssignees(getAllAssignees());
  }

  function handleCardClick(task) {
    if (onNavigateToChat) {
      onNavigateToChat(task);
    }
  }

  const tasks = data.tasks;
  const totalTasks = tasks.length;
  const completeTasks = tasks.filter((t) => t.status === 'complete').length;
  const lucaPreparedTasks = tasks.filter((t) => t.status === 'luca_prepared').length;
  const doneOrPrepared = completeTasks + lucaPreparedTasks;
  const pct = totalTasks > 0 ? Math.round((completeTasks / totalTasks) * 100) : 0;

  const columnCounts = {};
  for (const col of COLUMNS) {
    columnCounts[col] = tasks.filter((t) => t.status === col).length;
  }

  // Build filtered task lists per column — actually hide non-matching cards
  const hasFilter = filterAssignee || filterPhase;
  function filterTask(t) {
    if (filterAssignee && t.assignee !== filterAssignee) return false;
    if (filterPhase && t.phase !== filterPhase) return false;
    return true;
  }

  const filteredAssignees = [...new Set(tasks.map((t) => t.assignee))].filter((a) => a !== 'Unassigned');
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
              {lucaPreparedTasks > 0 && (
                <span className="text-breeze-blue font-normal ml-2">({lucaPreparedTasks} prepared by Luca)</span>
              )}
            </span>
            <span className="text-[11px] text-gray-400">
              {COLUMNS.map((col) => `${COLUMN_LABELS[col]}: ${columnCounts[col]}`).join(' \u00B7 ')}
            </span>
          </div>
          <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden flex">
            <div className="h-full bg-breeze-blue rounded-l-full transition-all duration-500" style={{ width: `${pct}%` }} />
            {lucaPreparedTasks > 0 && (
              <div className="h-full bg-breeze-blue/30 transition-all duration-500" style={{ width: `${Math.round((lucaPreparedTasks / totalTasks) * 100)}%` }} />
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mr-1">Assignee</span>
            <button
              onClick={() => setFilterAssignee(null)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors cursor-pointer ${
                !filterAssignee ? 'bg-breeze-blue text-white' : 'bg-[#F1F5F9] text-gray-500 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {filteredAssignees.map((a) => (
              <button
                key={a}
                onClick={() => setFilterAssignee(filterAssignee === a ? null : a)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors cursor-pointer ${
                  filterAssignee === a
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
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col);
              const visibleTasks = hasFilter ? colTasks.filter(filterTask) : colTasks;
              return (
                <Column
                  key={col}
                  status={col}
                  tasks={visibleTasks}
                  locked={data.locked}
                  onAssigneeChange={setAssignee}
                  assignees={assignees}
                  onCreateAssignee={handleCreateAssignee}
                  onCardClick={handleCardClick}
                />
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {showAddModal && (
        <AddTaskModal
          onAdd={addTask}
          onClose={() => setShowAddModal(false)}
          assignees={assignees}
          onCreateAssignee={handleCreateAssignee}
        />
      )}
    </div>
  );
}
