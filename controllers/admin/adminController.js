const db = require('../../models')
const { Cafe, Image, ImgurImage } = db
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

          await ImgurImage.create({
            url: result.data.link,
            deletehash: result.data.deletehash,
            deleteUrl: `imgur.com/delete/${result.data.deletehash}`,
            CafeId: newCafe.id
          })
        })
      })

      res.json({ status: 'success', message: '成功新增 cafe！' })
    } catch (error) {
      console.error(error)
    }
  },
  putCafe: async (req, res) => {
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

      const cafe = await Cafe.findByPk(req.params.id, { include: [Image] })
      await cafe.update({
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

      const imgs = await Image.findAll({ where: { cafeId: cafe.id } })
      const newImagesId = req.body.imageId
      // 預期刪除的照片
      const deleteImages = []
      for (const img of imgs) {
        if (!newImagesId.includes(img.dataValues.id)) {
          deleteImages.push(img)
        }
      }

      // 確認修改後照片總數維持在 1-20 之間
      // imgCount = 現有照片數 - 預期刪除的照片數 + 預期新增的照片數
      const imgCount = imgs.length - deleteImages.length + files.length
      if (imgCount > 20 || imgCount < 1) {
        return res.json({ status: 'error', message: '照片總數最少為 1 張，最多為 20 張' })
      }
      // 刪除 cafe 照片
      for (const img of deleteImages) {
        console.log('img delete', img)
        img.destroy()
      }
      // 新增 cafe 照片
      if (files) {
        for (const file of files) {
          imgur.upload(file.path, async (_err, result) => {
            await Image.create({
              url: result.data.link,
              CafeId: cafe.id
            })

            await ImgurImage.create({
              url: result.data.link,
              deletehash: result.data.deletehash,
              deleteUrl: `imgur.com/delete/${result.data.deletehash}`,
              CafeId: cafe.id
            })
          })
        }
      }

      res.json({ status: 'success', message: '成功修改 cafe！' })
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = adminController
