// interface iInBound  {
//     rawData: Object,
//     userName: String,
//     fromMobile: Number
// }

const { logger } = require("../logger");

var InBountInput = {
    context: undefined,
    text: undefined,
    audio: undefined
}
class InBound {
    id;
    timestamp;
    rawData;
    userName;
    fromMobile;
    type;
    input = InBountInput;

    constructor(reqBody) {
        this.rawData = reqBody;
    }
}

class InBoundGupshup extends InBound {

    constructor(reqBody) {
        super(reqBody);
        logger.debug("InBoundGupshup - input reqBody: %o", reqBody);
        let payload = reqBody?.payload;
        this.userName = payload?.sender?.name
        if(!this.userName) return; 
        this.id = payload.id;
        this.timestamp = reqBody.timestamp,
        this.fromMobile = payload?.sender?.phone;
        this.type = payload?.type;
        this.input = this.getInput(reqBody?.payload?.payload, payload.type);
        this.userId = this.getUseruid();
        logger.info("InBound converted object: \n%o", this);
    }

    getInput(payload, inputType) {
        // for both text & button_reply(interactive)
        // logger.info(this, payload);
        let inputObj = JSON.parse(JSON.stringify(this.input));
        switch(inputType) {
            case "text":
                inputObj.text = payload.text;
                break;
            case "button_reply" :
                inputObj.text = payload.title;
                inputObj.context = {id: payload.postbackText, type: payload.id};
                break;
            case "audio": 
                inputObj.audio = payload.url;
                inputObj.context = {format: payload.contentType};
                break;
            default: 
                inputObj.text = payload?.text;
        }
        return inputObj;
    }

    /**
     * Returns user session id based of incoming message data
     * @param {*} incomingMsg 
     * @returns 
     */
    getUseruid = () => {
        let incomingMsg = this;
        const mobileMult = 2013;
        var sampleMobile = "910000000000";
        var sampleUserName= "ejpu";// ejp user
        let shortUserName, shortRandMobile;
        
        try {
            logger.debug("getUseruId -  UserName: %s Mobile: %s", incomingMsg.userName, incomingMsg.fromMobile);
            shortUserName = incomingMsg.userName.replace(/ /g, '').toLowerCase().substr(0,4);
            let randMobile = (Number(incomingMsg.fromMobile)*mobileMult).toString(); 
            shortRandMobile = randMobile.substring(randMobile.length-4, randMobile.length);
            return shortUserName+shortRandMobile;
        } catch (err) {
            logger.warn(err, `Generating default userId: `);
            shortUserName = sampleUserName.replace(/ /g, '').toLowerCase().substr(0,4);
            let randMobile = (Number(sampleMobile)*mobileMult).toString(); 
            shortRandMobile = randMobile.substring(randMobile.length-4, randMobile.length);
            return shortUserName+shortRandMobile;
        }
    }
}

module.exports = { InBound, InBoundGupshup}