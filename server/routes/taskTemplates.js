const router = require('express').Router();
const taskTemplateController = require('../controllers/taskTemplateController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', auth, admin, taskTemplateController.getTemplates);
router.get('/:id', auth, admin, taskTemplateController.getTemplateById);
router.post('/', auth, admin, taskTemplateController.createTemplate);
router.put('/:id', auth, admin, taskTemplateController.updateTemplate);
router.delete('/:id', auth, admin, taskTemplateController.deleteTemplate);
router.post('/:id/duplicate', auth, admin, taskTemplateController.duplicateTemplate);

module.exports = router;
