const db = require('../models')
const { Op } = require('sequelize')
const { Cafe, Image } = db

const cafeController = {
  getCafes: async (req, res) => {
    try {
      const searchQuery = req.query.search
      let where = {}
      if (searchQuery !== 'undefined') {
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

      const pageLimit = 15 // 每頁 15 筆
      let offset = 0 // 偏移數
      const page = Number(req.query.page) || 1
      if (page !== 1) {
        offset = (page - 1) * pageLimit
      }

      const cafes = await Cafe.findAndCountAll({
        order: [['id', 'DESC']], // 預設排序新至舊
        limit: pageLimit,
        offset,
        include: [Image],
        distinct: true, // include 去重
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
