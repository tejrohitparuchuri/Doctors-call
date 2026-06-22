const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
    registerController,
    loginController,
    authController,
    docController,
    getallnotificationController,
    deleteallnotificationController,
    getAllDoctorsControllers,
    appointmentController,
    getAllUserAppointments,
    getDocsforuser
} = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware');

// Configure Multer for File Uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// User routes
router.post('/register', registerController);
router.post('/login', loginController);
router.post('/getuserdata', authMiddleware, authController);
router.post('/registerdoc', authMiddleware, docController);
router.get('/getalldoctorsu', authMiddleware, getAllDoctorsControllers);
router.post('/getappointment', authMiddleware, upload.single('image'), appointmentController);
router.post('/getallnotification', authMiddleware, getallnotificationController);
router.post('/deleteallnotification', authMiddleware, deleteallnotificationController);
router.get('/getuserappointments', authMiddleware, getAllUserAppointments);
router.get('/getDocsforuser', authMiddleware, getDocsforuser);

module.exports = router;
