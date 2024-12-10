const mongoose = require('mongoose');

const QuoteThemeSchema = new mongoose.Schema({
  category: {
    type: String,
  },
  colors: {
    type: [String],
    validate: {
      validator: function (colors) {
        return colors.every(color => {
          const colorRegex = /^[#a-fA-F0-9]{6,8}$/;
          return colorRegex.test(color);
        });
      },
      message: 'Colors must be valid hex codes.',
    },
  },
fontFamily:{

  type:String,
  required:true,
},
textColor:String,
  url: {
    type: String,
  },
  isFree: {
    type: Boolean,
    default: true,
  },
  themeType: {
    type: String,
    required: true,
    enum: {
      values: ['colors', 'image', 'gif','video'],
      message: 'themeType must be either "colors", "image", or "gif".',
    },
  },
});

module.exports = mongoose.model('ThemeModel', QuoteThemeSchema);
