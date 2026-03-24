const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.get('/', auth, commentController.getComments);
router.post('/', auth, commentController.createComment);

module.exports = router;
