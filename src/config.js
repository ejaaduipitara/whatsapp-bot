const packageJson = require('../package.json')
const appConfig = {
    version: packageJson?.version || "1.0.0",
    name: packageJson?.name || "eJP Whatsapp Bot",
    isLocalMode: false
}

appConfig.version = packageJson.version;

if(process.env.NODE_ENV === 'local')
    appConfig.isLocalMode = true;


module.exports = appConfig