const Sequelize = require("sequelize");
const sequelize = require("../database.js");
const DataTypes = Sequelize.DataTypes;

class Review extends Sequelize.Model {}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    houseId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    modelName: "review",
    timestamps: true,
  }
);

module.exports = Review;
