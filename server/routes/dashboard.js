const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/intern-stats', auth, dashboardController.internStats);
router.get('/admin-stats', auth, admin, dashboardController.adminStats);
router.get('/progress', auth, admin, dashboardController.progressOverview);

module.exports = router;
