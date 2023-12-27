const express = require('express');
const router = express.Router();
const service = require("./service");
const { logger } = require('../logger');


router.post('/webhook', (req, res) => {
    if(req.body.type === "message"){
        logger.debug("Gupshup/webhook: ", JSON.stringify(req.body));
        service.webhook(req, res);
    } else {
      // res.redirect("gupshup/webhook");
      res.sendStatus(200);
    }
  });
  
router.get('/test', service.test);
router.post('/testWebhook', service.testWebhook);

module.exports = router;