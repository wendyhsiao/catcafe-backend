const db = require('../models')
const { Op } = require('sequelize')
const { Cafe, Image } = db

const cafeController = {
  getCafes: async (req, res) => {
    try {
      const searchQuery = req.query.search
      let where = {}
      if (searchQuery !== undefined) {
        where = {
          [Op.or]: [ // 搜尋時查找縣市、區、店名
            {
              address_city: {
                [Op.like]: `%${searchQuery}%`
              }
            },
            {
              address_dist: {
                [Op.like]: `%${searchQuery}%`
              }
            },
            {
              name: {
                [Op.like]: `%${searchQuery}%`
              }
            }
          ]
        }
      }

      const cafes = await Cafe.findAll({
        raw: false,
        nest: true,
        include: [Image],
        where
      })

      return res.json({ cafes })
    } catch (error) {
      console.error(error)
    }
  },
  getCafe: async (req, res) => {
    try {
      const cafe = await Cafe.findByPk(req.params.id, { include: [Image] })

      return res.json({ cafe })
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = cafeController
