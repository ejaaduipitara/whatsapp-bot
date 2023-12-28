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
        let payload = reqBody?.payload;
        this.id = payload.id;
        this.timestamp = reqBody.timestamp,
        this.fromMobile = payload?.sender?.phone;
        this.userName = payload?.sender?.name
        this.type = payload?.type;
        this.input = this.getInput(reqBody?.payload?.payload, payload.type);
        logger.debug("InBound converted object: %o", this);
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
                inputObj.text = payload.text;
        }
        return inputObj;
    }
}

module.exports = { InBound, InBoundGupshup}