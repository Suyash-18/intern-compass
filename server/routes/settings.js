const router = require('express').Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');

router.get('/', auth, settingsController.getSettings);
router.put('/', auth, settingsController.updateSettings);
router.put('/password', auth, settingsController.changePassword);
router.put('/notifications', auth, settingsController.updateNotifications);

module.exports = router;
