import { Sequelize, Model, DataTypes } from "sequelize";
import { user, password, host, database } from "./database.js";
import bcrypt from "bcrypt";

const sequelize = new Sequelize(database, user, password, {
  host,
  dialect: "postgres", // can be other kinds of databases not just postgres.
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
    hooks: {
      // Automatically encrypt passwords.
      beforeCreate: async (user) => {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        user.password = await bcrypt.hash(user.password, salt);
      },
    },
  }
);

// Add isPasswordValid new method to User object prototype so we can compare passwords when users login.
User.prototype.isPasswordValid = async function (password) {
  return await bcrypt.compare(password, this.password);
};
