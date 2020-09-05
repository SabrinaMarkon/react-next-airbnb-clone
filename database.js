const user = 'DATABASE_USER';
const password = 'DATABASE_PASSWORD';
const host = 'localhost';
const database = 'DATABASE_NAME';

const Sequelize = require('sequelize');

const sequelize = new Sequelize(database, user, password, {
  host,
  dialect: "postgres", // can be other kinds of databases not just postgres.
  logging: false, // verbose - set to true to debug.
});

module.exports = sequelize;