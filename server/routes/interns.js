const router = require('express').Router();
const internController = require('../controllers/internController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All intern routes require admin access
router.get('/search', auth, admin, internController.searchInterns);
router.get('/export/csv', auth, admin, internController.exportCSV);
router.get('/export/excel', auth, admin, internController.exportExcel);
router.get('/', auth, admin, internController.getInterns);
router.get('/:id', auth, admin, internController.getInternById);
router.put('/:id', auth, admin, internController.updateIntern);
router.delete('/:id', auth, admin, internController.deleteIntern);

module.exports = router;
