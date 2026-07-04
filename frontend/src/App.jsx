import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit2, 
  Plus, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Info, 
  Check, 
  X, 
  Server, 
  ListTodo, 
  CheckSquare, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import './App.css';

function App() {
  // States
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form input states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, active, completed
  
  // Editing states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  
  // API URL settings
  const [apiBaseUrl, setApiBaseUrl] = useState(() => {
    const saved = localStorage.getItem('todo_api_url');
    return saved || 'http://localhost:8000';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(apiBaseUrl);

  // Show Toast helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch todos
  const fetchTodos = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/todos/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks (HTTP ${response.status})`);
      }
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to connect to the backend server.');
      addToast('Could not load tasks from API', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Run fetch on URL change or mount
  useEffect(() => {
    fetchTodos();
  }, [apiBaseUrl]);

  // Save API URL helper
  const handleSaveSettings = (e) => {
    e.preventDefault();
    let formattedUrl = customApiUrl.trim();
    if (formattedUrl.endsWith('/')) {
      formattedUrl = formattedUrl.slice(0, -1);
    }
    setApiBaseUrl(formattedUrl);
    localStorage.setItem('todo_api_url', formattedUrl);
    setShowSettings(false);
    addToast(`API Base URL updated to: ${formattedUrl}`, 'success');
  };

  // Add a new todo
  const handleCreateTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Task title is required', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/todos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task (HTTP ${response.status})`);
      }

      const newTodo = await response.json();
      setTodos((prev) => [newTodo, ...prev]);
      setTitle('');
      setDescription('');
      addToast('Task created successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error creating task.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle todo completion
  const handleToggleCompleted = async (id, currentCompleted) => {
    try {
      const response = await fetch(`${apiBaseUrl}/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !currentCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task (HTTP ${response.status})`);
      }

      const updatedTodo = await response.json();
      setTodos((prev) => 
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
      addToast(
        updatedTodo.completed ? 'Task completed! 🎉' : 'Task marked as active',
        'success'
      );
    } catch (err) {
      console.error(err);
      addToast('Could not update completion status.', 'error');
    }
  };

  // Enable edit mode
  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
  };

  // Save edited todo
  const handleUpdateTodo = async (e, id) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      addToast('Task title cannot be empty', 'error');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save changes (HTTP ${response.status})`);
      }

      const updatedTodo = await response.json();
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
      setEditingId(null);
      addToast('Task updated successfully', 'success');
    } catch (err) {
      console.error(err);
      addToast('Could not save task updates.', 'error');
    }
  };

  // Delete a todo
  const handleDeleteTodo = async (id) => {
    try {
      const response = await fetch(`${apiBaseUrl}/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to delete task (HTTP ${response.status})`);
      }

      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      addToast('Task deleted successfully', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete task.', 'error');
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, completionRate };
  }, [todos]);

  // Filtered & Searched list
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Filter tab check
      if (activeFilter === 'active' && todo.completed) return false;
      if (activeFilter === 'completed' && !todo.completed) return false;
      
      // Search check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = todo.title.toLowerCase().includes(query);
        const matchesDesc = todo.description.toLowerCase().includes(query);
        return matchesTitle || matchesDesc;
      }
      
      return true;
    });
  }, [todos, activeFilter, searchQuery]);

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="app-title-container">
          <ListTodo className="logo-icon" size={32} />
          <h1 className="app-title">TaskFlow</h1>
        </div>
        <p className="app-subtitle">A modern, reactive task manager powered by DevOps pipeline</p>
        
        {/* API Base URL Setting Trigger */}
        <div style={{ marginTop: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.4rem', display: 'inline-flex' }}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Server size={14} />
            <span>API Source: {apiBaseUrl}</span>
          </button>
        </div>

        {/* API Config Dropdown Panel */}
        {showSettings && (
          <div className="glass-panel" style={{ marginTop: '1rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto', padding: '1rem', textAlign: 'left', animation: 'fadeIn 0.2s ease-out' }}>
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label" htmlFor="api-url-input">API Base URL</label>
                <input 
                  id="api-url-input"
                  className="input-field" 
                  value={customApiUrl} 
                  onChange={(e) => setCustomApiUrl(e.target.value)} 
                  placeholder="e.g. http://localhost:8000"
                  type="text"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  onClick={() => {
                    setCustomApiUrl(apiBaseUrl);
                    setShowSettings(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', boxShadow: 'none' }}
                >
                  Save URL
                </button>
              </div>
            </form>
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Quick presets:{' '}
              <button 
                className="filter-btn" 
                style={{ padding: '0.1rem 0.3rem', fontSize: '0.75rem' }} 
                onClick={() => { setCustomApiUrl('http://localhost:8000'); }}
              >
                Local API
              </button>
              {' '}|{' '}
              <button 
                className="filter-btn" 
                style={{ padding: '0.1rem 0.3rem', fontSize: '0.75rem' }} 
                onClick={() => { setCustomApiUrl('https://todo-app.onrender.com'); }}
              >
                Render Production API
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Stats Summary Dashboard */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper total">
            <ListTodo size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Tasks</h3>
            <div className="stat-number">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper active">
            <ChevronRight size={24} />
          </div>
          <div className="stat-details">
            <h3>Active</h3>
            <div className="stat-number">{stats.active}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper completed">
            <CheckSquare size={24} />
          </div>
          <div className="stat-details">
            <h3>Completed</h3>
            <div className="stat-number">{stats.completed}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <Sparkles size={24} />
          </div>
          <div className="stat-details">
            <h3>Completion</h3>
            <div className="stat-number">{stats.completionRate}%</div>
          </div>
        </div>
      </section>

      {/* Main glass-panel content container */}
      <main className="glass-panel">
        
        {/* Create Task Form */}
        <form onSubmit={handleCreateTodo} className="todo-form">
          <div className="form-inputs-row">
            <div className="input-group">
              <label className="input-label" htmlFor="new-todo-title">Task Title</label>
              <input 
                id="new-todo-title"
                type="text" 
                className="input-field" 
                placeholder="What needs to be done?" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="new-todo-desc">Description (Optional)</label>
              <input 
                id="new-todo-desc"
                type="text" 
                className="input-field" 
                placeholder="Add some details..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting || !title.trim()}>
              <Plus size={18} />
              <span>{submitting ? 'Creating...' : 'Create Task'}</span>
            </button>
          </div>
        </form>

        {/* Toolbar: Search & Filter tab */}
        <section className="toolbar">
          <div className="search-wrapper">
            <Search className="search-icon" size={16} />
            <input 
              aria-label="Search tasks"
              type="text" 
              className="input-field search-input" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filters-wrapper">
            <button 
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
              onClick={() => setActiveFilter('active')}
            >
              Active
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveFilter('completed')}
            >
              Completed
            </button>
          </div>
        </section>

        {/* To-Do List Area */}
        {loading ? (
          <div className="loading-skeleton-container">
            <div className="skeleton-item"></div>
            <div className="skeleton-item"></div>
            <div className="skeleton-item"></div>
          </div>
        ) : error ? (
          <div className="message-panel">
            <AlertCircle className="message-panel-icon" size={48} style={{ color: 'var(--danger)' }} />
            <h2 className="message-panel-title">Connection Error</h2>
            <p>{error}</p>
            <button 
              className="btn btn-secondary" 
              onClick={() => fetchTodos()} 
              style={{ marginTop: '0.5rem', gap: '0.5rem', display: 'flex', alignItems: 'center' }}
            >
              <RefreshCw size={16} />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="message-panel">
            <Info className="message-panel-icon" size={48} />
            <h2 className="message-panel-title">
              {searchQuery ? 'No matching tasks' : 'No tasks found'}
            </h2>
            <p>
              {searchQuery 
                ? 'Try adjusting your search criteria.' 
                : activeFilter === 'completed' 
                  ? 'Keep going! Complete a task to see it here.' 
                  : activeFilter === 'active' 
                    ? 'No active tasks! You are all caught up.' 
                    : 'Start by creating your first task above!'}
            </p>
            {!searchQuery && activeFilter === 'all' && (
              <button 
                className="btn btn-secondary" 
                onClick={() => fetchTodos(true)}
                style={{ marginTop: '0.5rem', gap: '0.5rem', display: 'flex', alignItems: 'center' }}
              >
                <RefreshCw size={16} />
                <span>Refresh List</span>
              </button>
            )}
          </div>
        ) : (
          <div className="todo-list-container">
            {filteredTodos.map((todo) => (
              <div 
                key={todo.id} 
                className={`todo-item ${todo.completed ? 'completed' : ''}`}
              >
                {editingId === todo.id ? (
                  /* Editing Mode */
                  <form 
                    onSubmit={(e) => handleUpdateTodo(e, todo.id)} 
                    className="edit-form-wrapper"
                  >
                    <div className="input-group">
                      <label className="input-label" htmlFor={`edit-title-${todo.id}`}>Title</label>
                      <input 
                        id={`edit-title-${todo.id}`}
                        type="text" 
                        className="input-field" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label" htmlFor={`edit-desc-${todo.id}`}>Description</label>
                      <input 
                        id={`edit-desc-${todo.id}`}
                        type="text" 
                        className="input-field" 
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div className="edit-actions-row">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => setEditingId(null)}
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', boxShadow: 'none' }}
                      >
                        <Check size={16} />
                        <span>Save</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Standard Mode */
                  <>
                    {/* Checkbox */}
                    <div className="todo-checkbox-wrapper">
                      <label className="custom-checkbox">
                        <input 
                          type="checkbox" 
                          checked={todo.completed} 
                          onChange={() => handleToggleCompleted(todo.id, todo.completed)}
                          aria-label={`Toggle task completion: ${todo.title}`}
                        />
                        <span className="checkbox-checkmark"></span>
                      </label>
                    </div>
                    
                    {/* Content */}
                    <div className="todo-content">
                      <div className="todo-title-row">
                        <span className="todo-title">{todo.title}</span>
                        {todo.completed && (
                          <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>
                            Completed
                          </span>
                        )}
                      </div>
                      {todo.description && (
                        <p className="todo-description">{todo.description}</p>
                      )}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="todo-actions">
                      <button 
                        className="action-btn edit" 
                        onClick={() => startEditing(todo)}
                        title="Edit Task"
                        aria-label="Edit Task"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDeleteTodo(todo.id)}
                        title="Delete Task"
                        aria-label="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Toast Notification Container */}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className={`toast-icon ${toast.type}`}>
              {toast.type === 'success' && <CheckCircle2 size={18} />}
              {toast.type === 'error' && <AlertCircle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button 
              className="toast-close" 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
