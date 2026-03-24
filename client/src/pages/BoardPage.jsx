import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskModal from '../components/TaskModal';

const COLUMNS = {
  todo: { id: 'todo', title: 'To Do' },
  inprogress: { id: 'inprogress', title: 'In Progress' },
  done: { id: 'done', title: 'Done' }
};

const BoardPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState({ todo: [], inprogress: [], done: [] });
  const [loading, setLoading] = useState(true);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/tasks?projectId=${projectId}`)
      ]);
      
      setProject(projRes.data);
      
      // Group tasks by status
      const grouped = { todo: [], inprogress: [], done: [] };
      tasksRes.data.forEach(task => {
        if (grouped[task.status]) {
          grouped[task.status].push(task);
        }
      });
      setTasks(grouped);
      
    } catch (err) {
      console.error('Failed to fetch board data', err);
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    const sourceTasks = Array.from(tasks[sourceCol]);
    const destTasks = sourceCol === destCol ? sourceTasks : Array.from(tasks[destCol]);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    movedTask.status = destCol; // optimistically update
    
    destTasks.splice(destination.index, 0, movedTask);

    setTasks({
      ...tasks,
      [sourceCol]: sourceTasks,
      ...(sourceCol !== destCol ? { [destCol]: destTasks } : {})
    });

    // Send API update if column changed
    if (sourceCol !== destCol) {
      try {
        await api.put(`/tasks/${draggableId}`, { status: destCol });
      } catch (err) {
        console.error('Failed to update task status', err);
        // Revert on error could be implemented here
      }
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => ({
      ...prev,
      [newTask.status]: [...prev[newTask.status], newTask]
    }));
    setIsTaskModalOpen(false);
  };

  const handleTaskUpdated = (updatedTask) => {
    const newTasks = { todo: [...tasks.todo], inprogress: [...tasks.inprogress], done: [...tasks.done] };
    
    // Find where the task was and remove it
    let foundCol = null;
    let foundIndex = -1;
    for (const col of ['todo', 'inprogress', 'done']) {
      foundIndex = newTasks[col].findIndex(t => t._id === updatedTask._id);
      if (foundIndex !== -1) {
        foundCol = col;
        break;
      }
    }

    if (foundCol) {
      newTasks[foundCol].splice(foundIndex, 1);
      // Insert in new column (or same)
      newTasks[updatedTask.status].push(updatedTask);
      setTasks(newTasks);
      
      // Keep selected task updated
      setSelectedTask(updatedTask);
    }
  };

  const handleTaskDeleted = (taskId, status) => {
    setTasks(prev => ({
      ...prev,
      [status]: prev[status].filter(t => t._id !== taskId)
    }));
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading board...</div>;
  if (!project) return null;

  const projectMembers = [project.owner, ...project.members]; // Include owner in members list

  return (
    <div className="board-container">
      <div className="board-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem' }}>
            <FiArrowLeft />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{project.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Board View</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '-10px' }}>
          {/* Members Avatars */}
          {projectMembers.map((member, i) => (
            <div 
              key={member._id} 
              className="avatar" 
              title={member.username}
              style={{ 
                width: '32px', height: '32px', fontSize: '0.875rem',
                border: '2px solid var(--bg-primary)',
                marginLeft: i > 0 ? '-10px' : '0',
                zIndex: 10 - i 
              }}
            >
              {member.username.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-canvas">
          {Object.values(COLUMNS).map(column => (
            <div key={column.id} className="column">
              <div className="column-header">
                <span>{column.title}</span>
                <span style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem' 
                }}>
                  {tasks[column.id].length}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="column-tasks"
                    style={{
                      backgroundColor: snapshot.isDraggingOver ? 'var(--bg-hover)' : 'transparent',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {tasks[column.id].map((task, index) => (
                      <TaskCard 
                        key={task._id} 
                        task={task} 
                        index={index} 
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <button 
                className="add-task-btn"
                onClick={() => {
                  setSelectedColumn(column.id);
                  setIsTaskModalOpen(true);
                }}
              >
                <FiPlus /> Add Task
              </button>
            </div>
          ))}
        </div>
      </DragDropContext>

      {isTaskModalOpen && (
        <CreateTaskModal
          projectId={projectId}
          columnId={selectedColumn}
          onClose={() => setIsTaskModalOpen(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectMembers={projectMembers}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdated}
          onDelete={handleTaskDeleted}
        />
      )}
    </div>
  );
};

export default BoardPage;
