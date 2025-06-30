import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// TypeScript interfaces
interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

interface NewTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<NewTask>({ title: '', description: '', priority: 'medium' });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get<Task[]>(`${API_BASE_URL}/api/tasks`);
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post<Task>(`${API_BASE_URL}/api/tasks`, newTask);
      setTasks([response.data, ...tasks]);
      setNewTask({ title: '', description: '', priority: 'medium' });
    } catch (err) {
      setError('Failed to add task. Please try again.');
      console.error('Error adding task:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (task: Task): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.put<Task>(`${API_BASE_URL}/api/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        completed: task.completed
      });
      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
      setEditingTask(null);
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id: number, completed: boolean): Promise<void> => {
    try {
      const response = await axios.put<Task>(`${API_BASE_URL}/api/tasks/${id}`, {
        completed: !completed
      });
      setTasks(tasks.map(task => 
        task.id === id ? response.data : task
      ));
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const deleteTask = async (id: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
      if (editingTask?.id === id) {
        setEditingTask(null);
      }
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const startEditing = (task: Task): void => {
    setEditingTask({ ...task });
  };

  const cancelEditing = (): void => {
    setEditingTask(null);
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#7bed9f';
      default: return '#70a1ff';
    }
  };

  const getFilteredTasks = (): Task[] => {
    let filtered = tasks;

    // Filter by completion status
    if (activeTab === 'pending') {
      filtered = filtered.filter(task => !task.completed);
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(task => task.completed);
    }

    // Filter by priority
    if (filter !== 'all') {
      filtered = filtered.filter(task => task.priority === filter);
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎯 KIIS Todo Project</h1>
        <p>A Cloud-Native Task Management System</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={addTask} className="task-form">
          <div className="form-group">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              placeholder="Enter task title..."
              className="task-input"
              disabled={loading}
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({...newTask, priority: e.target.value as 'low' | 'medium' | 'high'})}
              className="priority-select"
              disabled={loading}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            placeholder="Task description (optional)..."
            className="task-description"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !newTask.title.trim()}>
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </form>
        
        <div className="task-stats">
          <span>Total: {tasks.length}</span>
          <span>Completed: {completedTasks.length}</span>
          <span>Pending: {pendingTasks.length}</span>
        </div>

        <div className="filters">
          <div className="tab-buttons">
            <button 
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Tasks ({tasks.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending ({pendingTasks.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed ({completedTasks.length})
            </button>
          </div>
          
          <div className="priority-filter">
            <label>Filter by Priority:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Edit Modal */}
        {editingTask && (
          <div className="modal-overlay">
            <div className="edit-modal">
              <h3>Edit Task</h3>
              <form onSubmit={(e) => { e.preventDefault(); updateTask(editingTask); }}>
                <div className="form-group">
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    placeholder="Task title..."
                    className="task-input"
                    required
                  />
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({...editingTask, priority: e.target.value as 'low' | 'medium' | 'high'})}
                    className="priority-select"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  placeholder="Task description..."
                  className="task-description"
                />
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={editingTask.completed}
                      onChange={(e) => setEditingTask({...editingTask, completed: e.target.checked})}
                    />
                    Mark as completed
                  </label>
                </div>
                <div className="modal-buttons">
                  <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={cancelEditing}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        <div className="task-list">
          {loading && tasks.length === 0 ? (
            <div className="loading">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="no-tasks">
              {tasks.length === 0 ? 'No tasks yet. Add one above!' : 'No tasks match your current filter.'}
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-content">
                  <div className="task-header">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id, task.completed)}
                      className="task-checkbox"
                    />
                    <span className="task-title">{task.title}</span>
                    <span 
                      className="priority-badge" 
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="task-description-display">{task.description}</p>
                  )}
                  <div className="task-meta">
                    <small>Created: {new Date(task.created_at).toLocaleString()}</small>
                    {task.updated_at !== task.created_at && (
                      <small> • Updated: {new Date(task.updated_at).toLocaleString()}</small>
                    )}
                  </div>
                </div>
                <div className="task-actions">
                  <button 
                    onClick={() => startEditing(task)}
                    className="edit-button"
                    title="Edit task"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="delete-button"
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </header>
    </div>
  );
}

export default App;