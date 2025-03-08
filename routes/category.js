var express = require('express');
var router = express.Router();
let categorySchema = require('../models/category');


/* GET users listing. */
router.get('/', async function (req, res, next) {
    let categories = await categorySchema.find({ isDeleted: false });
    res.send(categories);
});

router.get('/:id', async function (req, res, next) {
    try {
        let category = await categorySchema.findOne({ _id: req.params.id, isDeleted: false }); // ✅ Lọc danh mục chưa bị xóa
        if (!category) {
            return res.status(404).send({ success: false, message: "Danh mục không tồn tại hoặc đã bị xóa" });
        }
        res.status(200).send({ success: true, data: category });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});
router.post('/', async function (req, res, next) {
    let body = req.body;
    console.log(body);
    let newCategory = new categorySchema({
        categoryName: body.categoryName,
        description: body.description,
    });

    await newCategory.save();
    res.send(newCategory);
});

router.put('/:id', async function (req, res, next) {
    try {
      let category = await categorySchema.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false }, // ✅ Không cho phép cập nhật danh mục đã bị xóa
        req.body,
        { new: true }
      );
  
      if (!category) {
        return res.status(404).send({ success: false, message: "Danh mục không tồn tại hoặc đã bị xóa" });
      }
  
      res.status(200).send({ success: true, data: category });
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  });
  

  router.delete('/:id', async function (req, res, next) {
    try {
      let category = await categorySchema.findOne({ _id: req.params.id });
  
      if (!category) {
        return res.status(404).send({
          success: false,
          message: "Danh mục không tồn tại"
        });
      }
  
      if (category.isDeleted) {
        return res.status(400).send({
          success: false,
          message: "Danh mục đã bị xóa trước đó"
        });
      }
  
      category.isDeleted = true;
      await category.save();
  
      res.status(200).send({
        success: true,
        message: "Danh mục đã được đánh dấu là xóa",
        data: category
      });
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  });
  

module.exports = router;