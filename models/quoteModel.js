const mongoose = require('mongoose');

const LanguageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  voiceOverUrl: {
    type: String,
  },
});

const AuthorSchema = new mongoose.Schema({
  english: {
    type: String,
    required: true,
  },
  hindi: {
    type: String,
  },
  arabic: {
    type: String,
  },
  urdu: {
    type: String,
  },
});

const QuoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  categories: {
    type: [String], // Categories as a list of strings
  },
  author: {
    type: AuthorSchema, // Updated to use the AuthorSchema
  },
  isFromUser: {
    type: Boolean,
    default: true,
  },
  languages: {
    english: LanguageSchema,
    hindi: LanguageSchema,
    arabic: LanguageSchema,
    urdu: LanguageSchema,
  },
});

module.exports = mongoose.model('Quote', QuoteSchema);
