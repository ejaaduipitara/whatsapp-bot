// interface iInBound  {
//     rawData: Object,
//     userName: String,
//     fromMobile: Number
// }

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
    }

    getInput(payload, inputType) {
        // for both text & button_reply(interactive)
        // console.log(this, payload);
        let inputObj = this.input;
        switch(inputType) {
            case "text":
                inputObj.text = payload.text;
                break;
            case "button_reply" :
                inputObj.text = payload.title;
                inputObj.context = {id: payload.postbackText};
                break;
            case "audio": 
                inputObj.audio = payload.url;
                inputObj.context = {format: payload.contentType};
                break;
            default: 
                inputObj.text = payload.text;
        }
        console.log("InBound converted object: ", inputObj);
        return inputObj;
    }
}

module.exports = { InBound, InBoundGupshup}