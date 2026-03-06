const router = require('express').Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.patch('/registration-step', auth, userController.updateRegistrationStep);
router.post('/avatar', auth, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
