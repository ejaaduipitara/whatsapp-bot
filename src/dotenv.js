const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
// console.log("envFile path", envFile);
const dotenv = require('dotenv').config({ path: envFile });

// Ensure required ENV vars are set
let requiredEnv = process.env.REQUIRED_PROPERTIES.split(", ");

console.log("REQUIRED_PROPERTIES: \n", requiredEnv);
let unsetEnv = requiredEnv.filter((env) => !(typeof process.env[env] !== 'undefined'));
// console.log(unsetEnv);
if (unsetEnv.length > 0) {
    let errMsg = "Required ENV variables are not set: [" + unsetEnv.join(', ') + "]";
    throw new Error(errMsg);
}
// console.log(dotenv);