const session = require('express-session');
// const pgSession = require('connect-pg-simple')(session);
var SequelizeStore = require("connect-session-sequelize")(session.Store);
// const { Client } = require('pg');
const { logger } = require('./logger');
const { Sequelize, DataTypes, Model } = require('sequelize');
const POSTGRES_URL = process.env.POSTGRES_URL;
const oneDay = 1000 * 60 * 60 * 24;
const sequelize = new Sequelize(POSTGRES_URL);
// class Session extends Model {}

const Session = sequelize.define("Session", {
  sid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  userId: Sequelize.STRING,
  expires: Sequelize.DATE,
  data: Sequelize.TEXT,
});

function extendDefaultFields(defaults, session) {
  console.log(defaults, session);
  return {
    data: defaults.data,
    expires: defaults.expires,
    userId: session.userId,
  };
}

const store = new SequelizeStore({
  db: sequelize,
  table: "Session",
  extendDefaultFields,
});

const init = () => {
  logger.info("⭆ Database init!");
  return session({
      secret: "ABEGkZlkMAYjAgs-sJSPdqSRIMDoHg",
      saveUninitialized: true,
      resave: true,
      store,
      cookie: { maxAge: oneDay }
  })
}

store.sync();

/**
 * 
 * @param {text: "sql query $1", values: ["value1"]} queryObj 
 * @returns 
 */
const getData = async (userId) => {
  try {
    let userSess = Session.findOne({where: {userId: userId} });
    return userSess;
  } catch (error) {
    logger.error(error, "Database query - Get user session failed %s", userId);
  }
}

module.exports = {init, getData}

