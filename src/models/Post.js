const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  publishedAt: Date,
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
postSchema.index({ author: 1, status: 1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ 'seo.slug': 1 });
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for reading time (words per minute: 200)
postSchema.virtual('readingTime').get(function() {
  if (!this.content) return 0;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
});

// Generate slug from title before saving
postSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.seo.slug) {
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  
  // Auto-generate excerpt if not provided
  if (this.isModified('content') && !this.excerpt) {
    this.excerpt = this.content.substring(0, 300) + '...';
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Static method to find published posts
postSchema.statics.findPublished = function(options = {}) {
  const { limit = 10, skip = 0, sort = { publishedAt: -1 } } = options;
  
  return this.find({ status: 'published' })
    .populate('author', 'username profile.firstName profile.lastName profile.avatar')
    .populate('categories', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('-__v');
};

// Instance method to increment views
postSchema.methods.incrementViews = function() {
  this.views = (this.views || 0) + 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to toggle like
postSchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    this.likes.pull(existingLike._id);
  } else {
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

module.exports = mongoose.model('Post', postSchema);