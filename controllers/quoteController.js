// const { s3 } = require('../config/s3config');
// const Quote = require('../models/quoteModel');

// // Delete a file from S3
// const deleteFileFromS3 = async (fileUrl) => {
//   const fileKey = new URL(fileUrl).pathname.substring(1); // Extract the key from the URL
//   const params = {
//     Bucket: 'themesbucket',
//     Key: fileKey,
//   };

//   try {
//     await s3.deleteObject(params).promise();
//   } catch (err) {
//     console.error('Error deleting file:', err);
//     throw new Error('Failed to delete file');
//   }
// };

// // Upload a file to S3
// const uploadFileToS3 = async (file, fileName) => {
//   const params = {
//     Bucket: 'themesbucket',
//     Key: fileName,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//   };

//   try {
//     const data = await s3.upload(params).promise();
//     return data.Location;
//   } catch (err) {
//     console.error('Error uploading file:', err);
//     throw new Error('Failed to upload file');
//   }
// };
// // Get quotes with pagination and optional multiple category filtering
// exports.getQuotes = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, categories } = req.query;

//     // Prepare the filter object
//     const filter = {};
//     if (categories) {
    
//       const categoryArray = Array.isArray(categories) ? categories : categories.split(',');
//       filter.categories = { $in: categoryArray }; // Filter if categories are provided
//     }

//     // Fetch quotes with pagination and category filtering
//     const quotes = await Quote.find(filter)
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .exec();

//     const count = await Quote.countDocuments(filter); // Count total filtered documents

//     res.json({
//       data: quotes, // Use "data" as the key for your response
//       totalPages: Math.ceil(count / limit),
//       currentPage: page,
//     });
//   } catch (error) {
//     console.error('Error:', error); // Log the error
//     res.status(500).json({ message: 'Server Error' });
//   }
// };


// // Create a new quote
// exports.createQuote = async (req, res) => {
//   try {
//     const {
//       text,
//       categories, // Accept `categories` as an array of strings
//       author,
//       isFromUser,
//       languages: languagesString,
//     } = req.body;

//     if (!text) {
//       return res.status(400).json({ message: 'Text is required' });
//     }

//     // Parse the languages string to an object
//     const languages = JSON.parse(languagesString || '{}');

//     const uploadedLanguages = {};

//     // Process file for each language
//     for (const [lang, data] of Object.entries(languages)) {
//       const fileField = `languages.${lang}.voiceOverFile`;
//       const file = req.files[fileField] ? req.files[fileField][0] : null;

//       let voiceOverUrl = null;
//       if (file) {
//         voiceOverUrl = await uploadFileToS3(file, `${lang}/${Date.now()}_${file.originalname}`);
//       }

//       uploadedLanguages[lang] = {
//         text: data.text,
//         voiceOverUrl: voiceOverUrl,
//       };
//     }

//     const newQuote = new Quote({
//       text,
//       categories, // Store the array of categories
//       author,
//       isFromUser,
//       languages: uploadedLanguages,
//     });

//     const savedQuote = await newQuote.save();
//     res.status(201).json({ data: savedQuote }); // Use "data" as the key for your response
//   } catch (error) {
//     console.error('Error creating quote:', error);
//     res.status(500).json({ message: 'Server Error', err: error.message });
//   }
// };

// // Delete a quote
// exports.deleteQuote = async (req, res) => {
//   try {
//     const quoteId = req.params.id;
//     const quote = await Quote.findById(quoteId);

//     if (!quote) {
//       return res.status(404).json({ message: 'Quote not found' });
//     }

//     // Delete voice-over files from S3
//     const deletePromises = [];
//     for (const data of Object.values(quote.languages)) {
//       if (data.voiceOverUrl) {
//         deletePromises.push(deleteFileFromS3(data.voiceOverUrl));
//       }
//     }

//     await Promise.all(deletePromises); // Ensure all deletions are completed
//     await Quote.findByIdAndDelete(quoteId);
//     res.status(200).json({ message: 'Quote deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting quote:', error);
//     res.status(500).json({ message: 'Server Error', err: error.message });
//   }
// };
// const { s3 } = require('../config/s3config');
const Quote = require('../models/quoteModel');

// Delete a file from S3
const deleteFileFromS3 = async (fileUrl) => {
  const fileKey = new URL(fileUrl).pathname.substring(1);
  const params = {
    Bucket: 'themesbucket',
    Key: fileKey,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (err) {
    console.error('Error deleting file:', err);
    throw new Error('Failed to delete file');
  }
};

// Upload a file to S3
const uploadFileToS3 = async (file, fileName) => {
  const params = {
    Bucket: 'themesbucket',
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (err) {
    console.error('Error uploading file:', err);
    throw new Error('Failed to upload file');
  }
};

// Enhanced get quotes with pagination and metadata
exports.getQuotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const categories = req.query.categories;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        message: 'Invalid pagination parameters. Page and limit must be positive numbers.',
      });
    }

    const filter = {};
    if (categories) {
      const categoryArray = Array.isArray(categories) ? categories : categories.split(',');
      filter.categories = { $in: categoryArray };
    }

    const [quotes, totalDocs] = await Promise.all([
      Quote.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .exec(),
      Quote.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalDocs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const formattedQuotes = quotes.map((quote) => ({
      text: quote.text,
      categories: quote.categories,
      author: quote.author,
      isFromUser: quote.isFromUser,
      createdAt: quote.createdAt,
      languages: quote.languages
    }));

    res.json({
      status: 'success',
      data: {
        quotes: formattedQuotes,
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
    console.error('Error fetching quotes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch quotes',
      error: error.message
    });
  }
};

// Create a new quote
exports.createQuote = async (req, res) => {
  try {
    const {
      text,
      categories,
      author,
      isFromUser,
      languages: languagesString,
    } = req.body;

    if (!text) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Text is required'
      });
    }

    const languages = JSON.parse(languagesString || '{}');
    const uploadedLanguages = {};

    for (const [lang, data] of Object.entries(languages)) {
      const fileField = `languages.${lang}.voiceOverFile`;
      const file = req.files[fileField] ? req.files[fileField][0] : null;

      let voiceOverUrl = null;
      if (file) {
        voiceOverUrl = await uploadFileToS3(file, `${lang}/${Date.now()}_${file.originalname}`);
      }

      uploadedLanguages[lang] = {
        text: data.text,
        voiceOverUrl: voiceOverUrl,
      };
    }

    const newQuote = new Quote({
      text,
      categories,
      author,
      isFromUser,
      languages: uploadedLanguages,
    });

    const savedQuote = await newQuote.save();
    res.status(201).json({
      status: 'success',
      data: {
        text: savedQuote.text,
        categories: savedQuote.categories,
        author: savedQuote.author,
        isFromUser: savedQuote.isFromUser,
        createdAt: savedQuote.createdAt,
        languages: uploadedLanguages,
      }
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create quote',
      error: error.message
    });
  }
};


// Delete a quote
exports.deleteQuote = async (req, res) => {
  try {
    const quoteId = req.params.id;
    const quote = await Quote.findById(quoteId);

    if (!quote) {
      return res.status(404).json({
        status: 'error',
        message: 'Quote not found'
      });
    }

    const deletePromises = [];
    for (const data of Object.values(quote.languages || {})) {
      if (data.voiceOverUrl) {
        deletePromises.push(deleteFileFromS3(data.voiceOverUrl));
      }
    }

    await Promise.all(deletePromises);
    await Quote.findByIdAndDelete(quoteId);
    
    res.status(200).json({
      status: 'success',
      message: 'Quote deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete quote',
      error: error.message
    });
  }
};
