const router = require('express').Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/summary', auth, admin, reportController.summary);
router.get('/intern-progress', auth, admin, reportController.internProgress);
router.get('/task-completion', auth, admin, reportController.taskCompletion);
router.get('/domain-distribution', auth, admin, reportController.domainDistribution);
router.get('/export/pdf', auth, admin, reportController.exportPDF);

module.exports = router;
