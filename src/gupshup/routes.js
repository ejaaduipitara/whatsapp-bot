const express = require('express');
const router = express.Router();
const service = require("./service");

router.post('/webhook', (req, res) => {
    if(req.body.type === "message"){
        console.log("Gupshup/webhook: ", JSON.stringify(req.body));
        service.webhook(req, res);
    } else {
      // res.redirect("gupshup/webhook");
      res.sendStatus(200);
    }
  });
  
router.get('/test', service.test);
router.post('/testWebhook', service.testWebhook);

module.exports = router;