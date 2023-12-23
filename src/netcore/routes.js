const express = require('express');
const router = express.Router();
const service = require("./service");

router.post('/webhook', service.webhook);
router.get('/test', service.test);
router.post('/testWebhook', service.testWebhook);

module.exports = router;