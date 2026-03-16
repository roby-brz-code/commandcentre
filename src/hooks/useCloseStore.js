import { useState, useCallback } from 'react';
import { DEFAULT_TASKS, DEFAULT_ASSIGNEES } from '../data/closeDefaults';

function storageKey(month) {
  return `luca-close-${month}`;
}

function loadCustomAssignees() {
  try {
    const raw = localStorage.getItem('luca-custom-assignees');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCustomAssignees(list) {
  localStorage.setItem('luca-custom-assignees', JSON.stringify(list));
}

export function getAllAssignees() {
  const custom = loadCustomAssignees();
  return [...DEFAULT_ASSIGNEES.filter((a) => a !== 'Unassigned'), ...custom, 'Unassigned'];
}

export function addCustomAssignee(name) {
  const custom = loadCustomAssignees();
  if (!custom.includes(name) && !DEFAULT_ASSIGNEES.includes(name)) {
    custom.push(name);
    saveCustomAssignees(custom);
  }
}

function initMonth(month) {
  const raw = localStorage.getItem(storageKey(month));
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  return {
    locked: false,
    tasks: DEFAULT_TASKS.map((t) => ({
      ...t,
      assignee: 'Unassigned',
      status: 'not_started',
      completedAt: null,
      completedBy: null,
      isCustom: false,
    })),
  };
}

function persist(month, data) {
  localStorage.setItem(storageKey(month), JSON.stringify(data));
}

export function getCloseData(month) {
  return initMonth(month);
}

export function prepareTaskById(month, taskId, completedBy = 'Luca') {
  const data = initMonth(month);
  const task = data.tasks.find((t) => t.id === taskId);
  if (task && task.status !== 'complete' && task.status !== 'luca_prepared') {
    task.status = 'luca_prepared';
    task.completedAt = new Date().toISOString();
    task.completedBy = completedBy;
    persist(month, data);
    return task;
  }
  return null;
}

export default function useCloseStore(initialMonth) {
  const [month, setMonth] = useState(initialMonth);
  const [data, setData] = useState(() => initMonth(initialMonth));

  const reload = useCallback((m) => {
    const d = initMonth(m || month);
    setData(d);
    return d;
  }, [month]);

  const save = useCallback((newData) => {
    persist(month, newData);
    setData({ ...newData });
  }, [month]);

  const switchMonth = useCallback((m) => {
    setMonth(m);
    const d = initMonth(m);
    setData(d);
  }, []);

  const moveTask = useCallback((taskId, newStatus, destIndex) => {
    const updated = { ...data, tasks: [...data.tasks] };
    const idx = updated.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1 || updated.locked) return;

    const task = { ...updated.tasks[idx] };
    task.status = newStatus;
    if ((newStatus === 'complete' || newStatus === 'luca_prepared') && !task.completedAt) {
      task.completedAt = new Date().toISOString();
      task.completedBy = task.assignee || 'Unknown';
    }
    if (newStatus !== 'complete' && newStatus !== 'luca_prepared') {
      task.completedAt = null;
      task.completedBy = null;
    }

    // Remove from old position
    updated.tasks.splice(idx, 1);

    // Insert at new position within the destination column
    if (destIndex != null) {
      const colTasks = updated.tasks.filter((t) => t.status === newStatus);
      if (destIndex >= colTasks.length) {
        const lastColIdx = updated.tasks.findLastIndex((t) => t.status === newStatus);
        updated.tasks.splice(lastColIdx + 1, 0, task);
      } else {
        const targetTask = colTasks[destIndex];
        const globalIdx = updated.tasks.indexOf(targetTask);
        updated.tasks.splice(globalIdx, 0, task);
      }
    } else {
      updated.tasks.push(task);
    }

    save(updated);
  }, [data, save]);

  const setAssignee = useCallback((taskId, assignee) => {
    const updated = { ...data, tasks: data.tasks.map((t) =>
      t.id === taskId ? { ...t, assignee } : t
    )};
    save(updated);
  }, [data, save]);

  const addTask = useCallback((task) => {
    const updated = {
      ...data,
      tasks: [...data.tasks, {
        ...task,
        status: 'not_started',
        completedAt: null,
        completedBy: null,
        isCustom: true,
      }],
    };
    save(updated);
  }, [data, save]);

  const toggleLock = useCallback(() => {
    save({ ...data, locked: !data.locked });
  }, [data, save]);

  return { month, data, switchMonth, moveTask, setAssignee, addTask, toggleLock, reload };
}
