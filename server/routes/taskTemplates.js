const router = require('express').Router();
const taskTemplateController = require('../controllers/taskTemplateController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

router.get('/', auth, admin, taskTemplateController.getTemplates);
router.get('/:id', auth, admin, taskTemplateController.getTemplateById);
router.post('/', auth, admin, upload.array('attachments', 5), taskTemplateController.createTemplate);
router.put('/:id', auth, admin, upload.array('attachments', 5), taskTemplateController.updateTemplate);
router.delete('/:id', auth, admin, taskTemplateController.deleteTemplate);
router.post('/:id/duplicate', auth, admin, taskTemplateController.duplicateTemplate);

module.exports = router;
