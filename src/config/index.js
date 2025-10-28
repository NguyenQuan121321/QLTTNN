require("dotenv").config();

module.exports = {
  db: require("./database"),
  jwtSecret: process.env.JWT_SECRET || "supersecret",
  jwtExpire: process.env.JWT_EXPIRE || "12h"
};
