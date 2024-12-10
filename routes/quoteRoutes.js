const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const themeControlle = require('../controllers/quoteThemesController');

const { upload } = require('../config/s3config');


router.post('/quotes/add', upload.fields([
    { name: 'languages.english.voiceOverFile', maxCount: 1 },
    { name: 'languages.hindi.voiceOverFile', maxCount: 1 },
    { name: 'languages.arabic.voiceOverFile', maxCount: 1 },
    { name: 'languages.urdu.voiceOverFile', maxCount: 1 }
]), quoteController.createQuote);
router.get('/quotes', quoteController.getQuotes);
router.post('/themes', themeControlle.addTheme);
router.get('/getThemes', themeControlle.getThemes);

router.post('/addTheme', themeControlle.upload,themeControlle.addTheme);



module.exports = router;
