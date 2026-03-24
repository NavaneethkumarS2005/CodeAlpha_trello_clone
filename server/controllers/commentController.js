const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getComments = async (req, res) => {
  try {
    const { taskId } = req.query;
    if (!taskId) return res.status(400).json({ error: 'taskId requires' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const project = await Project.findById(task.project);
    const isMember = project.owner.toString() === req.user || project.members.some(m => m.toString() === req.user);
    if (!isMember) return res.status(403).json({ error: 'Not authorized' });

    const comments = await Comment.find({ task: taskId })
      .populate('user', 'username email')
      .sort({ createdAt: 1 });
      
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { taskId, text } = req.body;
    if (!taskId || !text) return res.status(400).json({ error: 'taskId and text required' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const project = await Project.findById(task.project);
    const isMember = project.owner.toString() === req.user || project.members.some(m => m.toString() === req.user);
    if (!isMember) return res.status(403).json({ error: 'Not authorized' });

    const newComment = new Comment({
      task: taskId,
      user: req.user,
      text
    });

    let savedComment = await newComment.save();
    savedComment = await savedComment.populate('user', 'username email');
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
