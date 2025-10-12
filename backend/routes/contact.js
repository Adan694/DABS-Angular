const express = require('express');
const router = express.Router();
const { handleContactForm } = require('../Controllers/contact');

router.post('/contact', handleContactForm);

module.exports = router;
