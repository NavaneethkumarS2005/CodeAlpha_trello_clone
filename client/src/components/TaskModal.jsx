import React, { useState, useEffect, useContext } from 'react';
import { FiX, FiSend, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const TaskModal = ({ task, projectMembers, onClose, onUpdate, onDelete }) => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo?._id || '');
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [task._id]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments?taskId=${task._id}`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const payload = { title, description, status };
      if (assignedTo) payload.assignedTo = assignedTo;
      else payload.assignedTo = null; // Unassign it
      
      const res = await api.put(`/tasks/${task._id}`, payload);
      onUpdate(res.data);
    } catch (err) {
      console.error('Failed to update task', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${task._id}`);
        onDelete(task._id, task.status);
        onClose();
      } catch (err) {
        console.error('Failed to delete task', err);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post('/comments', {
        taskId: task._id,
        text: newComment
      });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <input 
            className="modal-title" 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-primary)', 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              width: '80%' 
            }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdate}
          />
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        
        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          <div className="task-main-info">
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleUpdate}
                placeholder="Add a more detailed description..."
              />
            </div>

            <div className="comments-section">
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Activity
              </h4>
              
              <div className="comment-list">
                {loadingComments ? <div>Loading comments...</div> : comments.length === 0 ? <div style={{color:'var(--text-muted)'}}>No comments yet.</div> : comments.map(comment => (
                  <div key={comment._id} className="comment-item">
                    <div className="avatar" style={{ flexShrink: 0 }}>
                      {comment.user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.user?.username}</span>
                        <span className="comment-time">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="comment-text">{comment.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
                  <FiSend />
                </button>
              </form>
            </div>
          </div>

          <div className="task-sidebar">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-control" 
                value={status} 
                onChange={(e) => {
                  setStatus(e.target.value);
                  // Immediate save requires manual trigger
                  setTimeout(() => handleUpdate(), 0);
                }}
              >
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <select 
                className="form-control" 
                value={assignedTo} 
                onChange={(e) => setAssignedTo(e.target.value)}
                onBlur={handleUpdate}
              >
                <option value="">Unassigned</option>
                {projectMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.username}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button className="btn btn-outline text-danger" onClick={handleDelete} style={{ width: '100%' }}>
                <FiTrash2 /> Delete Task
              </button>
              {saving && <p style={{ fontSize: '0.75rem', color: 'var(--success)', textAlign: 'center', marginTop: '0.5rem' }}>Saved Changes</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaskModal;
