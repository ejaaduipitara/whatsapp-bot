const newman = require('newman'); // require newman in your project
const dotenv = require('../../src/dotenv');

// call newman.run to pass `options` object and wait for callback
newman.run({
    collection: require('./test.postman_collection.json'),
    envVar: [
		{
			"key": "TELEMETRY_SERVICE_URL",
			"value": `${process.env.TELEMETRY_SERVICE_URL}`,
			"type": "string"
		},
		{
			"key": "STORY_SAKHI_URL",
			"value": `${process.env.STORY_SAKHI_URL}`,
			"type": "string"
		},
		{
			"key": "ACTIVITY_SAKHI_URL",
			"value": `${process.env.ACTIVITY_SAKHI_URL}`,
			"type": "string"
		}
	],
    reporters: 'cli'
}, function (err) {
	if (err) { throw err; }
    console.log('collection run complete!');
}).on('start', function (err, args) { // on start of run, log to console
    console.log('running a collection...');
}).on('done', function (err, summary) {
    if (err || summary.error) {
        console.error('collection run encountered an error.');
    }
    else {
        console.log('collection run completed.');
    }
});;