const db = require('../../models')
const { Cafe, Image } = db
const { Op } = require('sequelize')

const adminController = {
  getCafes: async (req, res) => {
    try {
      const pageLimit = 15 // 每頁 15 筆
      let offset = 0 // 偏移數
      if (req.query.page) {
        offset = (req.query.page - 1) * pageLimit
      }

      const searchQuery = req.query.q
      let where = {}
      if (searchQuery !== undefined) {
        where = {
          [Op.or]: [ // 搜尋時查找店名
            {
              name: {
                [Op.like]: `%${searchQuery}%`
              }
            }
          ]
        }
      }

      const cafes = await Cafe.findAndCountAll({
        order: [['id', 'DESC']], // 預設排序新至舊
        limit: pageLimit,
        offset,
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
      res.json({ cafe })
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = adminController
