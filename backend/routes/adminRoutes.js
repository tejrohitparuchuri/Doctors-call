const express = require('express');
const router = express.Router();

const {
    getAllUsersControllers,
    getAllDoctorsControllers,
    getStatusApproveController,
    getStatusRejectController,
    displayAllAppointmentController
} = require('../controllers/AdminController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin protected routes
router.get('/getallusers', authMiddleware, getAllUsersControllers);
router.get('/getalldoctors', authMiddleware, getAllDoctorsControllers);
router.post('/getapprove', authMiddleware, getStatusApproveController);
router.post('/getreject', authMiddleware, getStatusRejectController);
router.get('/getallAppointmentsAdmin', authMiddleware, displayAllAppointmentController);

module.exports = router;
