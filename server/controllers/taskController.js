const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId query param is required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Ensure user has access to project
    const isMember = project.owner.toString() === req.user || project.members.some(m => m.toString() === req.user);
    if (!isMember) return res.status(403).json({ error: 'Not authorized' });

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'username email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { projectId, title, description, status, assignedTo } = req.body;
    if (!projectId || !title) return res.status(400).json({ error: 'projectId and title are required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isMember = project.owner.toString() === req.user || project.members.some(m => m.toString() === req.user);
    if (!isMember) return res.status(403).json({ error: 'Not authorized' });

    const newTask = new Task({
      project: projectId,
      title,
      description,
      status: status || 'todo',
      assignedTo: assignedTo || null,
    });

    const savedTask = await newTask.save();
    
    // Populate before returning
    await savedTask.populate('assignedTo', 'username email');
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Validate project access
    const project = await Project.findById(task.project);
    const isMember = project.owner.toString() === req.user || project.members.some(m => m.toString() === req.user);
    if (!isMember) return res.status(403).json({ error: 'Not authorized' });

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    const updatedTask = await task.save();
    await updatedTask.populate('assignedTo', 'username email');
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const project = await Project.findById(task.project);
    const isMember = project.owner.toString() === req.user || project.members.some(m => m.toString() === req.user);
    if (!isMember) return res.status(403).json({ error: 'Not authorized' });

    await Task.deleteOne({ _id: req.params.id });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
