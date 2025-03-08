var express = require('express');
var router = express.Router();
let productSchema = require('../models/product')
let BuildQueies = require('../utils/buildQuery')


/* GET users listing. */
router.get('/', async function (req, res, next) {
  let queries = req.query;
  console.log("Nhận request GET /products với query:", queries);
  let products = await productSchema.find({
    isDeleted: false // sản phẩm chưa bị xóa
  });
  console.log("Dữ liệu trả về:", products);
  res.send(products);
});

router.get('/:id', async function (req, res, next) {
  try {
    let product = await productSchema.findOne({ _id: req.params.id, isDeleted: false }); // ✅ Lọc danh mục chưa bị xóa
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Sản phẩm không tồn tại hoặc đã bị xóa"
      });
    }
    res.status(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    })
  }
});
router.put('/:id', async function (req, res, next) {
  try {
    let body = req.body;
    let product = await productSchema.findOneAndUpdate({
      _id: req.params.id,
      isDeleted: false
    }, // ✅ Không cập nhật sản phẩm đã bị xóa
      body,
      { new: true }
    );
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Sản phẩm không tồn tại hoặc đã bị xóa"
      });
    }

    res.status(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    })
  }
});

router.post('/', async function (req, res, next) {
  let body = req.body;
  console.log(body);
  let newProduct = new productSchema({
    productName: body.productName,
    price: body.price,
    quantity: body.quantity,
    categoryID: body.category
  })
  await newProduct.save()
  res.send(newProduct);
});

router.delete('/:id', async function (req, res, next) {
  try {
    let product = await productSchema.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Sản phẩm không tồn tại"
      });
    }

    res.status(200).send({
      success: true,
      message: "Sản phẩm đã được đánh dấu là xóa",
      data: product
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;