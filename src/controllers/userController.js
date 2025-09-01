const User = require('../models/User');
const Post = require('../models/Post');
const { createError, asyncHandler } = require('../middleware/errorHandler');
const winston = require('winston');

// Get all users (Admin only)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || '-createdAt';

  // Build filter
  const filter = {};
  
  if (req.query.role) {
    filter.role = req.query.role;
  }
  
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  if (req.query.q) {
    filter.$or = [
      { username: { $regex: req.query.q, $options: 'i' } },
      { email: { $regex: req.query.q, $options: 'i' } },
      { 'profile.firstName': { $regex: req.query.q, $options: 'i' } },
      { 'profile.lastName': { $regex: req.query.q, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshTokens')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalUsers: total,
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination
    }
  });
});

// Get user by ID
exports.getUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select('-password -refreshTokens')
    .populate({
      path: 'posts',
      select: 'title status createdAt views',
      match: { status: 'published' },
      options: { limit: 5, sort: { createdAt: -1 } }
    });

  if (!user) {
    return next(createError(404, 'User not found'));
  }

  // Get additional user statistics
  const stats = await getUserStats(userId);

  res.status(200).json({
    success: true,
    data: {
      user: {
        ...user.toObject(),
        stats
      }
    }
  });
});

// Update user (Admin only)
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(createError(404, 'User not found'));
  }

  // Allowed updates for admin
  const allowedUpdates = ['role', 'isActive', 'profile'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Prevent self-demotion from admin
  if (updates.role && req.user._id.toString() === userId && req.user.role === 'admin' && updates.role !== 'admin') {
    return next(createError(400, 'Cannot change your own admin role'));
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updates,
    {
      new: true,
      runValidators: true
    }
  ).select('-password -refreshTokens');

  winston.info(`User updated by admin: ${updatedUser.username} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser
    }
  });
});

// Delete user (Admin only)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  // Prevent self-deletion
  if (req.user._id.toString() === userId) {
    return next(createError(400, 'Cannot delete your own account'));
  }

  const user = await User.findById(userId);
  
  if (!user) {
    return next(createError(404, 'User not found'));
  }

  // Archive user's posts instead of deleting them
  await Post.updateMany(
    { author: userId },
    { status: 'archived' }
  );

  await User.findByIdAndDelete(userId);

  winston.info(`User deleted by admin: ${user.username} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Get user dashboard stats (for authenticated user)
exports.getUserDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Get comprehensive user statistics
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews,
    totalLikes,
    recentPosts
  ] = await Promise.all([
    Post.countDocuments({ author: userId }),
    Post.countDocuments({ author: userId, status: 'published' }),
    Post.countDocuments({ author: userId, status: 'draft' }),
    Post.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]),
    Post.aggregate([
      { $match: { author: userId } },
      { $project: { likeCount: { $size: '$likes' } } },
      { $group: { _id: null, total: { $sum: '$likeCount' } } }
    ]),
    Post.find({ author: userId })
      .select('title status createdAt views')
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'username')
  ]);

  const stats = {
    posts: {
      total: totalPosts,
      published: publishedPosts,
      drafts: draftPosts,
      archived: totalPosts - publishedPosts - draftPosts
    },
    engagement: {
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      averageViews: publishedPosts > 0 ? Math.round((totalViews[0]?.total || 0) / publishedPosts) : 0
    },
    recentPosts
  };

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

// Follow/Unfollow user (if implementing social features)
exports.toggleFollow = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  
  if (req.user._id.toString() === userId) {
    return next(createError(400, 'Cannot follow yourself'));
  }

  const userToFollow = await User.findById(userId);
  
  if (!userToFollow) {
    return next(createError(404, 'User not found'));
  }

  // This would require adding followers/following fields to User model
  // Implementation depends on social feature requirements
  
  res.status(200).json({
    success: true,
    message: 'Follow feature would be implemented here'
  });
});

// Get user activity (for profile pages)
exports.getUserActivity = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const user = await User.findById(userId).select('username profile');
  
  if (!user) {
    return next(createError(404, 'User not found'));
  }

  // Get user's recent published posts
  const [posts, total] = await Promise.all([
    Post.find({ author: userId, status: 'published' })
      .select('title excerpt createdAt views tags')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments({ author: userId, status: 'published' })
  ]);

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalPosts: total,
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };

  res.status(200).json({
    success: true,
    data: {
      user,
      posts,
      pagination
    }
  });
});

// Helper function to get user statistics
const getUserStats = async (userId) => {
  const [
    totalPosts,
    publishedPosts,
    totalViews,
    totalLikes
  ] = await Promise.all([
    Post.countDocuments({ author: userId }),
    Post.countDocuments({ author: userId, status: 'published' }),
    Post.aggregate([
      { $match: { author: userId, status: 'published' } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]),
    Post.aggregate([
      { $match: { author: userId, status: 'published' } },
      { $project: { likeCount: { $size: '$likes' } } },
      { $group: { _id: null, total: { $sum: '$likeCount' } } }
    ])
  ]);

  return {
    totalPosts,
    publishedPosts,
    totalViews: totalViews[0]?.total || 0,
    totalLikes: totalLikes[0]?.total || 0
  };
};