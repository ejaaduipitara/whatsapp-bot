const { Sequelize } = require('sequelize');
const { logger } = require('../logger');
const POSTGRES_URL = process.env.POSTGRES_URL;

function getConnection() {
    logger.info('Creating a new connection to POSTGRES_URL: %s', POSTGRES_URL);
    return new Sequelize(POSTGRES_URL);
  }
  
function checkAuthenticate() {
    sequelize.authenticate()
    .then(() => {
      logger.info('Connection has been established successfully.');
    })
    .catch(err => {
      let errorObj = new Error('Config POSTGRES_URL= '+POSTGRES_URL);
      logger.error(errorObj, 'Configuration error');
    });
  }

const sequelize = getConnection();
checkAuthenticate();

module.exports = {sequelize}