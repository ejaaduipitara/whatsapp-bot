const { Sequelize } = require("sequelize");
const { logger } = require("../logger");
const { sequelize } = require("./database");

const UserModel = {
    userId: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    lang: Sequelize.STRING,
    bot: Sequelize.STRING,
    lastestMsgTimestamp: Sequelize.STRING,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
}

// const SessionModel = {
//     sid: {
//         type: Sequelize.STRING,
//         primaryKey: true,
//     },
//     userId: Sequelize.STRING,
//     expires: Sequelize.DATE,
//     data: Sequelize.TEXT
// }

// const SessionSeq = sequelize.define("Session", SessionModel);
const UserSqr = sequelize.define("User", UserModel);
UserSqr.sync();

module.exports = { UserSqr }