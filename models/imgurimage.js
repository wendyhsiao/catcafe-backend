// 記錄 Imgur 刪除圖片的網址，需手動刪除。
'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ImgurImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      this.belongsTo(models.Cafe)
    }
  };
  ImgurImage.init({
    url: DataTypes.STRING,
    deletehash: DataTypes.STRING,
    deleteUrl: DataTypes.STRING,
    CafeId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ImgurImage'
  })
  return ImgurImage
}
