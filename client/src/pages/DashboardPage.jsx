import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import api from '../services/api';
import CreateProjectModal from '../components/CreateProjectModal';

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading projects...</div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Your Workspaces</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Select a project or create a new one to get started.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No projects yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Create your first project board to start managing tasks.</p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div 
              key={project._id} 
              className="card project-card"
              onClick={() => navigate(`/board/${project._id}`)}
            >
              <div className="project-header">
                <h3 className="project-title">{project.name}</h3>
                <p className="project-desc">{project.description || 'No description provided.'}</p>
              </div>
              <div className="project-footer">
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                <span>{project.members?.length + 1} Member(s)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsModalOpen(false)} 
          onCreated={handleProjectCreated} 
        />
      )}
    </div>
  );
};

export default DashboardPage;
