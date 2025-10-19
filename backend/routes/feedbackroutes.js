const express = require('express');
const {
    submitFeedback,
    getFeedbackByDoctor,
    updateFeedback,
    deleteFeedback,
    getAllFeedback,
    getFeedbackByPatient,
} = require('../Controllers/feedbackcontroller');
const { authenticateToken } = require('../middlewares/auth'); 
const router = express.Router();

router.post('/', authenticateToken, submitFeedback);
router.get('/doctor/:doctorId', getFeedbackByDoctor);
router.put('/:id', authenticateToken, updateFeedback);
router.delete('/:id', authenticateToken, deleteFeedback);
router.get('/admin/all', authenticateToken, getAllFeedback);
router.get('/patient/:patientId', authenticateToken, getFeedbackByPatient);


module.exports = router;
