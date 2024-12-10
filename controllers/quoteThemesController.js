const ThemeModel = require('../models/themeModel');
const { upload, s3 } = require('../config/s3config');

exports.upload = upload.single('image'); // 'image' is the field name in the form

// Add a new theme
exports.addTheme = async (req, res) => {
  try {
    const { category, colors, themeType, isFree, fontFamily } = req.body;

    console.log(req.body);

    if (themeType === 'colors' && !colors) {
      return res.status(400).json({ message: 'Please add colors or select any other theme type' });
    }

    let imageUrl = '';
    if (req.file && (themeType === 'image' || themeType === 'gif' || themeType === 'video')) {
      // Upload image to S3
      const params = {
        Bucket: 'themesbucket',
        Key: `themes/${Date.now()}_${req.file.originalname}`, // File name
        Body: req.file.buffer,
        ContentType: req.file.mimetype, // Set content type
      };

      const uploadResult = await s3.upload(params).promise();
      imageUrl = uploadResult.Location; // Get the uploaded file URL

      console.log("Image URL:");
      console.log(imageUrl);
      console.log(uploadResult);
    }

    const newTheme = new ThemeModel({
      category,
      colors,
      url: imageUrl,
      fontFamily,
      themeType,
      isFree,
    });

    const savedTheme = await newTheme.save();
    res.status(201).json({ data: savedTheme }); // Use "data" as the key for your response

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    } else {
      console.error('Error:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
};

// Get all themes with pagination
// Enhanced get themes with pagination and metadata
// Get all themes with pagination and filter by category
exports.getThemes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const category = req.query.category || ''; // Check for category filter

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid pagination parameters. Page and limit must be positive numbers.',
      });
    }

    // Build the filter object based on the category
    const filter = category ? { category } : {};

    const [themes, totalDocs] = await Promise.all([
      ThemeModel.find(filter)  // Apply the category filter here
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .exec(),
      ThemeModel.countDocuments(filter)  // Count with the category filter
    ]);

    const totalPages = Math.ceil(totalDocs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const formattedThemes = themes.map((theme) => ({
      category: theme.category,
      colors: theme.colors,
      url: theme.url,
      fontFamily: theme.fontFamily,
      themeType: theme.themeType,
      isFree: theme.isFree,
      createdAt: theme.createdAt,
      textColor:theme.textColor
    }));

    res.json({
      status: 'success',
      data: {
        themes: formattedThemes,
        totalDocs,
        limit,
        totalPages,
        currentPage: page,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      }
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch themes',
      error: error.message
    });
  }
};


