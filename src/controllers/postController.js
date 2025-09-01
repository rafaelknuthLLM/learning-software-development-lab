const Post = require('../models/Post');
const User = require('../models/User');
const { createError, asyncHandler } = require('../middleware/errorHandler');
const winston = require('winston');

// Get all posts with filtering and pagination
exports.getAllPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || '-publishedAt';
  
  // Build filter object
  const filter = {};
  
  if (req.query.status) {
    filter.status = req.query.status;
  } else {
    // Default to published posts for public access
    filter.status = 'published';
  }
  
  if (req.query.author) {
    filter.author = req.query.author;
  }
  
  if (req.query.tags) {
    const tags = req.query.tags.split(',').map(tag => tag.trim());
    filter.tags = { $in: tags };
  }
  
  if (req.query.q) {
    filter.$text = { $search: req.query.q };
  }

  // Execute query with pagination
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('categories', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v'),
    Post.countDocuments(filter)
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
      posts,
      pagination
    }
  });
});

// Get single post by ID or slug
exports.getPost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  // Try to find by ID first, then by slug
  let post = await Post.findById(id)
    .populate('author', 'username profile.firstName profile.lastName profile.avatar')
    .populate('categories', 'name slug');
  
  if (!post) {
    post = await Post.findOne({ 'seo.slug': id })
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('categories', 'name slug');
  }
  
  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  // Check if user can view this post
  if (post.status !== 'published' && (!req.user || (req.user._id.toString() !== post.author._id.toString() && req.user.role !== 'admin'))) {
    return next(createError(403, 'Access denied'));
  }

  // Increment views for published posts (but not for authors/admins)
  if (post.status === 'published' && (!req.user || (req.user._id.toString() !== post.author._id.toString() && req.user.role !== 'admin'))) {
    await post.incrementViews();
  }

  res.status(200).json({
    success: true,
    data: {
      post
    }
  });
});

// Create new post
exports.createPost = asyncHandler(async (req, res, next) => {
  const postData = {
    ...req.body,
    author: req.user._id
  };

  const post = await Post.create(postData);
  
  await post.populate('author', 'username profile.firstName profile.lastName profile.avatar');

  winston.info(`New post created: ${post.title} by ${req.user.username}`);

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: {
      post
    }
  });
});

// Update post
exports.updatePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const post = await Post.findById(id);
  
  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  // Check ownership or admin role
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(createError(403, 'Access denied. You can only update your own posts.'));
  }

  // Update allowed fields
  const allowedUpdates = ['title', 'content', 'excerpt', 'status', 'tags', 'categories', 'featuredImage', 'seo'];
  const updates = {};
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedPost = await Post.findByIdAndUpdate(
    id,
    updates,
    {
      new: true,
      runValidators: true
    }
  ).populate('author', 'username profile.firstName profile.lastName profile.avatar')
   .populate('categories', 'name slug');

  winston.info(`Post updated: ${updatedPost.title} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    data: {
      post: updatedPost
    }
  });
});

// Delete post
exports.deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const post = await Post.findById(id);
  
  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  // Check ownership or admin role
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(createError(403, 'Access denied. You can only delete your own posts.'));
  }

  await Post.findByIdAndDelete(id);

  winston.info(`Post deleted: ${post.title} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully'
  });
});

// Get user's posts
exports.getUserPosts = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || '-createdAt';

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(createError(404, 'User not found'));
  }

  const filter = { author: userId };
  
  // If not the author or admin, only show published posts
  if (!req.user || (req.user._id.toString() !== userId && req.user.role !== 'admin')) {
    filter.status = 'published';
  } else if (req.query.status) {
    filter.status = req.query.status;
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('categories', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v'),
    Post.countDocuments(filter)
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
      posts,
      pagination,
      user: {
        _id: user._id,
        username: user.username,
        profile: user.profile
      }
    }
  });
});

// Like/Unlike post
exports.toggleLike = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const post = await Post.findById(id);
  
  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  if (post.status !== 'published') {
    return next(createError(403, 'Cannot like unpublished posts'));
  }

  await post.toggleLike(req.user._id);

  const action = post.likes.some(like => like.user.toString() === req.user._id.toString()) ? 'liked' : 'unliked';

  res.status(200).json({
    success: true,
    message: `Post ${action} successfully`,
    data: {
      likeCount: post.likeCount,
      isLiked: action === 'liked'
    }
  });
});

// Get post statistics (for authors and admins)
exports.getPostStats = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const post = await Post.findById(id).populate('author', 'username');
  
  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  // Check ownership or admin role
  if (post.author._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(createError(403, 'Access denied'));
  }

  const stats = {
    views: post.views,
    likes: post.likeCount,
    readingTime: post.readingTime,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    publishedAt: post.publishedAt,
    status: post.status
  };

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

// Search posts
exports.searchPosts = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  
  if (!q || q.trim().length === 0) {
    return next(createError(400, 'Search query is required'));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const searchFilter = {
    $text: { $search: q },
    status: 'published'
  };

  const [posts, total] = await Promise.all([
    Post.find(searchFilter, { score: { $meta: 'textScore' } })
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('categories', 'name slug')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .select('-__v'),
    Post.countDocuments(searchFilter)
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
      posts,
      pagination,
      query: q
    }
  });
});