const router = require('express').Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

// Intern task routes
router.get('/', auth, taskController.getTasks);
router.get('/:id', auth, taskController.getTaskById);

// Admin task management
router.post('/', auth, admin, taskController.createTask);
router.put('/:id', auth, admin, taskController.updateTask);
router.delete('/:id', auth, admin, taskController.deleteTask);

// Task submission (intern)
router.post('/:id/submit', auth, taskController.submitTask);

// Task review (admin)
router.post('/:id/review', auth, admin, taskController.reviewTask);

// Attachments
router.post('/:id/attachments', auth, upload.single('attachment'), taskController.uploadAttachment);
router.delete('/:taskId/attachments/:attachmentId', auth, taskController.deleteAttachment);
router.get('/:taskId/attachments/:attachmentId/download', auth, taskController.downloadAttachment);

// Assignment (admin)
router.post('/assign', auth, admin, taskController.assignTask);
router.post('/bulk-assign', auth, admin, taskController.bulkAssign);

module.exports = router;
