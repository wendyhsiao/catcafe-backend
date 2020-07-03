const cafeController = {
  getCafes: (req, res) => {
    const cafes = 'cat'
    console.log(cafes)
    return res.json({ cafes })
  }
}

module.exports = cafeController
