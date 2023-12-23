const Telemetry = require('@project-sunbird/telemetry-sdk');
const axios = require('axios');
const dateFormat = require('dateformat');
const uuidv1 = require('uuid/v1');
const _ = require('lodash');
const session = require('./session');

let TELEMETRY_URL = process.env.TELEMETRY_SERVICE_URL;
let TELEMETRY_AUTH_TOKEN = process.env.API_TOKEN;
let APP_ENV = process.env.APP_ENV;
let APP_NAME = process.env.APP_NAME;

var default_config = {
  'runningEnv': 'server',
  'dispatcher': function (event) {},
  'batchsize': 10
};

function telemetryService() {}

/**
 * @description Default configuration for telemetry service.
 * @description Context for telemetry service.
 */
telemetryService.prototype.config = {}
telemetryService.prototype.context = []
let telemetry = new telemetryService();


/**
 * @description Creates telemetry data based on the message and event type.
 * @param {object} msg - The message object containing specific information.
 * @param {string} eventType - The type of event ('session' or 'api_call').
 * @returns {object} - Telemetry data object containing context, object, and edata.
 */

telemetryService.prototype.createData  = (req,eventType, msg) => {
  let isLangSelection = session.getUserLanguage(req, msg);
  let isBotSelection = session.getUserBot(req, msg);
  console.log('checkSessionData',isLangSelection,isBotSelection)
  const context = {
    env: 'dev',
    cdata: [ {id: isLangSelection || 'en', type:'Language' },{id: isBotSelection || 'bot_1', type: 'Bot' }], //currently hardcoded
    sid: (msg?.fromMobile) * 12345,
    did: (msg?.fromMobile) * 12345,
    pdata: {id:`${APP_ENV}.${APP_NAME}.whatsapp`,pid:"whatsapp-bot",ver:"1.0"}
  };
  const actor = { 
    id: (msg?.fromMobile) * 12345,
     type: 'User'
     };

  const object =  {
    id: (msg?.fromMobile) * 12345,
    type: 'Whatsapp',
    ver: '1.0',
    rollup: {},
  };

  const edata = {};

  if (eventType === 'log') {
    edata.type = 'api_call';
    edata.level = 'INFO';
    edata.message = msg?.input?.text || '';
    edata.params = [{ message_id: msg?.id }, { message_type:msg?.type }];
  }
  else if(eventType === 'start') {
    edata.type = 'session'
    edata.mode =  "preview"
    edata.duration = 1;
  }

  return { context, object, edata, actor};
};

/**
 * Initializes telemetry event.
 * @description Initializes telemetry event based on telemetry configuration.
 */
telemetryService.prototype.initEvent = function() {
  telemetry.init(telemetry.config);
}

/**
 * Starts telemetry event.
 * @description Starts telemetry event with the given request and message data.
 * @param {Object} req - The request object.
 * @param {Object} msg - The message object.
 */
telemetryService.prototype.startEvent = function(req,msg) {
  let StartData = telemetry.createData(req, 'start',msg);
  telemetry.start(StartData);
}

/**
 * Logs telemetry event.
 * @description Logs telemetry event with the given request and message data.
 * @param {Object} req - The request object.
 * @param {Object} msg - The message object.
 */
telemetryService.prototype.logEvent = function(req,msg) {
  let logData = telemetry.createData(req, 'log',msg);
  telemetry.log(logData);
}

/**
 * @description Handles the synchronization manager for telemetry service.
 */
function SyncManager() {
  /**
   * @description Initializes the synchronization manager.
   * @param {any} event - Event data for initialization.
   */
  this.init = function (event) {
  };

  /**
   * @description Dispatches events for telemetry service.
   * @param {any} event - Event data to dispatch.
   */
  this.dispatch = function (event) {
    console.log('dispacher', JSON.stringify(event));
    // sendTelemetry('req', [event], ''); // Dispatch telemetry event
  };
}


/**
 * @description Initiates synchronization on exit for telemetry service.
 * @param {function} cb - Callback function to execute on synchronization completion.
 */
telemetryService.prototype.syncOnExit = function (cb) {
  default_config.dispatcher.sync(cb)
}

/**
 * @description Initializes telemetry service configuration.
 * @param {object} config - Configuration object for telemetry service.
 */
telemetryService.prototype.init = function (config) {
  default_config.dispatcher = new SyncManager()
  config['host'] = config['host'] || process.env.sunbird_telemetry_service_local_url;
  default_config.dispatcher.init(config)
  this.config = Object.assign({}, config, default_config)
  Telemetry.initialize(this.config)
}

/**
 * @description Initiates telemetry data for tracking an event.
 * @param {object} StartData - Object containing telemetry data.
 *                        Required properties: contentId, contentVer, edata.
 *                        Optional properties: context, object, actor, tags.
 */
telemetryService.prototype.start = function (StartData) {
  if (StartData.context) { this.context.push(StartData.context) }
  Telemetry.start(this.config, StartData.contentId, StartData.contentVer, StartData.edata, {
    context: StartData.context,
    object: StartData.object,
    actor: StartData.actor,
    tags: StartData.tags,
    sid: this.config.sid
  })
}

/**
 * for log event
 * data object have these properties {'edata', context', 'object', 'tags'}
 */
telemetryService.prototype.log = function (logData) {
  Telemetry.log(logData.edata, {
    context: logData.context,
    object: logData.object,
    actor: logData.actor,
    tags: logData.tags,
    duration: logData.duration

  })
}

/**
 * Sends telemetry data to a specified endpoint using Axios POST request.
 * @param {Object} req - The request object.
 * @param {Array} eventsData - The array containing telemetry events data.
 * @param {Function} callback - The callback function to handle the response.
 */
function sendTelemetry(req, eventsData, callback) {
  // Check if eventsData is empty or not provided
  if (!eventsData || eventsData.length === 0) {
    // Invoke the callback if it exists with a success status
    if (_.isFunction(callback)) {
      callback(null, true);
    }
    return; // Exit the function early if eventsData is empty
  }

  // Prepare telemetry data request body
  var data = prepareTelemetryRequestBody(req, eventsData);
  console.log('TELEMETRY_URL',TELEMETRY_URL,TELEMETRY_AUTH_TOKEN)
  // Set up the configuration for the axios request
  var axiosConfig = {
    method: 'POST',
    url: TELEMETRY_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ TELEMETRY_AUTH_TOKEN}`
    },
    data: data // The telemetry data to send
  };
  console.log('response', axiosConfig)
  // Perform the telemetry POST request using axios
  axios(axiosConfig)
    .then(response => {
      // Log the response data if successful
      console.log('Telemetry request successful:', response.data);
    })
    .catch(error => {
      // Log an error if the request fails
      console.error('Telemetry request failed:', error);
    });
}


/**
 * Prepares telemetry request body based on provided events data.
 * @param {Object} req - The request object.
 * @param {Array} eventsData - Array of telemetry events data.
 * @returns {Object} - The telemetry request body.
 */

 function prepareTelemetryRequestBody (req, eventsData) {
  var data = {
    'id': 'ekstep.telemetry',
    'ver': '3.0',
    'ts': dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss:lo'),
    'params': {
      'requesterId': 'req.session.userId',
      'did': 'sunbird-portal',
      'msgid': uuidv1()
    },
    'events': eventsData
  }
  return data
}

module.exports =  telemetryService