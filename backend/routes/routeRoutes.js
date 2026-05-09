const express = require('express');
const router = express.Router();
const { saveRoute, getRouteHistory, getRouteStats } = require('../controllers/routeController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.post('/save', protect, saveRoute);
router.get('/history', protect, getRouteHistory);
router.get('/stats', protect, getRouteStats);

module.exports = router;