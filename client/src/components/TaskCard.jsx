import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

const TaskCard = ({ task, index, onClick }) => {
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
          onClick={onClick}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          <div className="task-title">{task.title}</div>
          
          <div className="task-footer">
            <span style={{ 
              display: 'inline-block', 
              padding: '2px 8px', 
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              fontSize: '0.70rem'
            }}>
              {task.description ? 'Description' : 'No Details'}
            </span>

            {task.assignedTo ? (
              <div className="avatar" title={`Assigned to ${task.assignedTo.username}`}>
                {task.assignedTo.username.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="avatar" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }} title="Unassigned">
                ?
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
