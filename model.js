import { Sequelize, Model, DataTypes } from "sequelize";
import { user, password, host, database } from "./database.js";

const sequelize = new Sequelize(database, user, password, {
  host,
  dialect: "postgres", // can be other kinds of databases not justs postgres.
  logging: false, // verbose - set to true to debug.
});

// Create model for users table, describing its data and rules.

export class User extends Model {}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "user",
    timestamps: false, // Our app doesn't include createdAt or updatedAt fields.
  }
);


