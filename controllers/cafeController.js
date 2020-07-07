const db = require('../models')
const { Op } = require('sequelize')
const Cafe = db.Cafe

const cafeController = {
  getCafes: async (req, res) => {
    try {
      const searchQuery = '%' + req.query.q + '%'

      console.log('searchQuery', searchQuery)
      const cafes = await Cafe.findAll({
        raw: true,
        where: {
          [Op.or]: [
            {
              address_city: {
                [Op.like]: searchQuery
              }
            },
            {
              address_dist: {
                [Op.like]: searchQuery
              }
            },
            {
              name: {
                [Op.like]: searchQuery
              }
            }
          ]
        }
      })
      console.log(cafes)
      return res.json({ cafes })
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = cafeController
