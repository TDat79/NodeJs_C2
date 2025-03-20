var express = require('express');
var router = express.Router();
let Role = require('../models/roles');

/* GET all roles */
router.get('/', async function (req, res, next) {
  let queries = req.query;
  console.log("Nhận request GET /roles với query:", queries);
  try {
    let roles = await Role.find({ isDeleted: false });
    console.log("Dữ liệu trả về:", roles);
    res.send(roles);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

/* GET role by ID */
router.get('/:id', async function (req, res, next) {
  try {
    let role = await Role.findOne({ _id: req.params.id, isDeleted: false });
    if (!role) {
      return res.status(404).send({
        success: false,
        message: "Role không tồn tại hoặc đã bị xóa"
      });
    }
    res.status(200).send({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

/* POST create new role */
router.post('/', async function (req, res, next) {
  let body = req.body;
  console.log(body);
  try {
    let newRole = new Role({
      roleName: body.roleName,
      description: body.description || ''
    });
    await newRole.save();
    res.send(newRole);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

/* PUT update role */
router.put('/:id', async function (req, res, next) {
  try {
    let body = req.body;
    let role = await Role.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      body,
      { new: true }
    );
    if (!role) {
      return res.status(404).send({
        success: false,
        message: "Role không tồn tại hoặc đã bị xóa"
      });
    }
    res.status(200).send({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

/* DELETE soft delete role */
router.delete('/:id', async function (req, res, next) {
  try {
    let role = await Role.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!role) {
      return res.status(404).send({
        success: false,
        message: "Role không tồn tại"
      });
    }
    res.status(200).send({
      success: true,
      message: "Role đã được đánh dấu là xóa",
      data: role
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;