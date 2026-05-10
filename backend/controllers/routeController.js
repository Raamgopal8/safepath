const RouteHistory = require('../models/RouteHistory');

// @desc    Save route history
// @route   POST /api/routes/save
// @access  Private
const saveRoute = async (req, res) => {
  try {
    const { origin, destination, selectedRoute, environmentalScore } = req.body;

    // Validation
    if (!origin || !destination || !selectedRoute || environmentalScore === undefined) {
      return res.status(400).json({
        message: 'Please provide all required fields',
      });
    }

    // Create route history
    const routeHistory = await RouteHistory.create({
      user: req.user._id,
      origin,
      destination,
      selectedRoute,
      environmentalScore,
    });

    res.status(201).json({
      message: 'Route saved successfully',
      routeHistory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error while saving route',
    });
  }
};

// @desc    Get user's route history
// @route   GET /api/routes/history
// @access  Private
const getRouteHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get route history for the user
    const routeHistory = await RouteHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username');

    // Get total count for pagination
    const total = await RouteHistory.countDocuments({ user: req.user._id });

    res.status(200).json({
      routeHistory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error while fetching route history',
    });
  }
};

// @desc    Get route statistics
// @route   GET /api/routes/stats
// @access  Private
const getRouteStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get average environmental score
    const avgScore = await RouteHistory.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$environmentalScore' },
          totalRoutes: { $sum: 1 },
          bestScore: { $max: '$environmentalScore' },
          worstScore: { $min: '$environmentalScore' },
        },
      },
    ]);

    // Get routes by month
    const monthlyStats = await RouteHistory.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$environmentalScore' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      stats: avgScore[0] || {
        averageScore: 0,
        totalRoutes: 0,
        bestScore: 0,
        worstScore: 0,
      },
      monthlyStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error while fetching route statistics',
    });
  }
};

module.exports = {
  saveRoute,
  getRouteHistory,
  getRouteStats,
};