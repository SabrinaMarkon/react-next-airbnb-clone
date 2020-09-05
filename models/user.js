const bcrypt = require("bcrypt");
const Sequelize = require("sequelize"); // To access Sequelize DataTypes and Sequelize.Model.
const sequelize = require("../database.js"); // Instance of db connection.
const DataTypes = Sequelize.DataTypes;

class User extends Sequelize.Model {}

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

module.exports = User;
