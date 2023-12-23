const express = require('express');
const router = express.Router();
const service = require("./service");

router.post('/webhook', (req, res) => {
    console.log("Gupshup: ", req.body);
    if(req.body.payload.type == "sandbox-start"){
      res.sendStatus(200);
    } else {
      // res.redirect("gupshup/webhook");
      service.webhook(req, res);
    }
  });
  
router.get('/test', service.test);
router.post('/testWebhook', service.testWebhook);

module.exports = router;