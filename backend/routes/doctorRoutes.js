const express = require('express');
const router = express.Router();

const {
    updateDoctorProfileController,
    getAllDoctorAppointmentsController,
    handleStatusController,
    documentDownloadController
} = require('../controllers/DoctorController');
const authMiddleware = require('../middleware/authMiddleware');

// Doctor routes
router.post('/updateprofile', authMiddleware, updateDoctorProfileController);
router.get('/getdoctorappointments', authMiddleware, getAllDoctorAppointmentsController);
router.post('/handlestatus', authMiddleware, handleStatusController);
router.get('/getdocumentdownload', authMiddleware, documentDownloadController);

module.exports = router;
