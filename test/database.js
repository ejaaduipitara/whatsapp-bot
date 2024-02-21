const { Sequelize } = require('sequelize');
const POSTGRES_URL = process.env.POSTGRES_URL;

function getConnection() {
    console.log('Creating a new connection to POSTGRES_URL:', POSTGRES_URL);
    return new Sequelize(POSTGRES_URL);
  }
  
function authenticate() {
    sequelize.authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch(err => {
    //   let errorObj = new Error('Config error POSTGRES_URL= '+POSTGRES_URL);
      console.error(`Config error POSTGRES_URL= ${POSTGRES_URL} \n`, err);
    });
  }

const sequelize = getConnection();
authenticate();

// module.exports = {sequelize}