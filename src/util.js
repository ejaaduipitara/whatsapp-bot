const fs = require('fs');
const bots = JSON.parse(fs.readFileSync('assets/bots.json', 'utf-8'));
const axios = require("axios");

const setUserSelection = (req, id, userSelection) => {
    if (!userSelection) {
        // If not present, set the default value from the incoming message
        userSelection = id;
        req.session.userSelection = userSelection;
        console.log('Value not present. Setting userSelection:', userSelection);
        return userSelection;
    } else {
        console.log('Existing userSelection:', userSelection);
        if (id && userSelection !== id) {
            req.session.userSelection = id;
            console.log('Updated userSelection:', id);
        }
        return userSelection;
    }

}




module.exports = { setUserSelection }