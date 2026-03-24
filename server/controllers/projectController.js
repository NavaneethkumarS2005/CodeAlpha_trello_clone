const Project = require('../models/Project');

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user }, { members: req.user }]
    }).populate('owner', 'username email').populate('members', 'username email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('members', 'username email');
    
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Check if user is owner or member
    const isMember = project.owner._id.toString() === req.user || project.members.some(m => m._id.toString() === req.user);
    if (!isMember) {
      return res.status(403).json({ error: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const newProject = new Project({
      name,
      description,
      owner: req.user,
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner.toString() !== req.user) {
      return res.status(403).json({ error: 'Only owner can update project' });
    }

    // Merge new members without duplicates
    if (members && Array.isArray(members)) {
      project.members = [...new Set([...project.members.map(m => m.toString()), ...members])];
    }
    if (name) project.name = name;
    if (description !== undefined) project.description = description;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.owner.toString() !== req.user) {
      return res.status(403).json({ error: 'Only owner can delete project' });
    }

    await Project.deleteOne({ _id: req.params.id });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
