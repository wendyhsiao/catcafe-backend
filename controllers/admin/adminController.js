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
      const page = Number(req.query.page) || 1
      if (page !== 1) {
        offset = (page - 1) * pageLimit
      }

      const searchQuery = req.query.search
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
      const pages = Math.ceil(cafes.count / pageLimit) || 1 // 總頁
      const totalPages = Array.from({ length: pages }).map((item, index) => index + 1)
      const previousPage = page - 1 < 1 ? 1 : page - 1
      const nextPage = page + 1 > pages ? pages : page + 1

      const pagination = {
        page,
        pages,
        totalPages,
        previousPage,
        nextPage
      }
      return res.json({ cafes, pagination })
    } catch (error) {
      console.error(error)
    }
  },
  getCafe: async (req, res) => {
    try {
      const cafe = await Cafe.findByPk(req.params.id, { include: [Image] })
      // 設定 textarea 換行
      const { consumption_patterns, rule, other } = cafe.dataValues
      const reg = new RegExp('<br>', 'g')
      cafe.dataValues.consumption_patterns = consumption_patterns.replace(reg, '\n')
      cafe.dataValues.rule = rule.replace(reg, '\n')
      cafe.dataValues.other = other.replace(reg, '\n')

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
      // 設定 textarea 換行
      const consumptionPatterns2 = consumptionPatterns.replace(/\n|\r\n/g, '<br>')
      const rule2 = rule.replace(/\n|\r\n/g, '<br>')
      const other2 = other.replace(/\n|\r\n/g, '<br>')

      const cafe = await Cafe.findByPk(req.params.id, { include: [Image] })
      await cafe.update({
        name,
        address_city: addressCity,
        address_dist: addressDist,
        address_other: addressOther,
        opening_hour: openingHour,
        tel,
        consumption_patterns: consumptionPatterns2,
        rule: rule2,
        other: other2,
        minimum_charge: minimumCharge,
        facebook,
        instagram
      })

      const imgs = await Image.findAll({ where: { cafeId: cafe.id } })
      let imageId = req.body.imageId || []
      // 修改後，剩餘的照片 id
      // 如 imageId 只有一個會是 String，需轉為 Array
      if (!Array.isArray(imageId)) { imageId = [imageId] }
      const modifiedImagesId = imageId.map(id => id++)
      // 預期刪除的照片
      const deleteImages = []
      for (const img of imgs) {
        if (!modifiedImagesId.includes(img.dataValues.id)) {
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
  },
  deleteCafe: async (req, res) => {
    try {
      const cafe = await Cafe.findByPk(req.params.id)
      cafe.destroy()

      res.json({ status: 'success', message: '成功刪除 cafe！' })
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = adminController
