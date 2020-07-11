const db = require('../../models')
const { Cafe, Image } = db
const { Op } = require('sequelize')

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
imgur.setClientID(IMGUR_CLIENT_ID)

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
  },
  postCafe: async (req, res) => {
    try {
      const {
        name, addressCity, addressDist, addressOther, openingHour,
        tel, consumptionPatterns, rule, other, minimumCharge, facebook, instagram
      } = req.body
      const { files } = req
      // 確認必填資訊
      if (!name || !addressCity || !addressDist || !addressOther || !openingHour) {
        return res.json({ stats: 'error', message: 'name, addressCity, addressDist, addressOther, openingHour 為必填項目' })
      }
      // 確認最少一張照片
      if (files.length === 0) {
        return res.json({ stats: 'error', message: '只少需要一張照片' })
      }

      // 新增 cafe
      const newCafe = await Cafe.create({
        name,
        address_city: addressCity,
        address_dist: addressDist,
        address_other: addressOther,
        opening_hour: openingHour,
        tel,
        consumption_patterns: consumptionPatterns,
        rule,
        other,
        minimum_charge: minimumCharge,
        facebook,
        instagram
      })
      // 新增 cafe 照片
      files.map(file => {
        imgur.upload(file.path, async (_err, result) => {
          await Image.create({
            url: result.data.link,
            CafeId: newCafe.id
          })
        })
      })

      res.json({ status: 'success', message: '成功新增 cafe！' })
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = adminController
