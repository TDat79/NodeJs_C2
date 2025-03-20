var express = require('express');
var router = express.Router();
let User = require('../models/users');

/* GET all users */
router.get('/', async function (req, res, next) {
  let queries = req.query;
  console.log("Nhận request GET /users với query:", queries);

  try {
    let query = { isDeleted: false };
    if (queries.username) query.username = { $regex: queries.username, $options: 'i' };
    if (queries.fullName) query.fullName = { $regex: queries.fullName, $options: 'i' };
    if (queries.loginCountGte || queries.loginCountLte) {
      query.loginCount = {};
      if (queries.loginCountGte) query.loginCount.$gte = Number(queries.loginCountGte);
      if (queries.loginCountLte) query.loginCount.$lte = Number(queries.loginCountLte);
    }

    let users = await User.find(query).populate('role');
    console.log("Dữ liệu trả về:", users);
    res.send(users);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

/* GET user by ID */
router.get('/:id', async function (req, res, next) {
  try {
    let user = await User.findOne({ _id: req.params.id, isDeleted: false }).populate('role');
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Người dùng không tồn tại hoặc đã bị xóa"
      });
    }
    res.status(200).send({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

/* GET user by username */
router.get('/username/:username', async function (req, res, next) {
  try {
    let user = await User.findOne({ username: req.params.username, isDeleted: false }).populate('role');
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Người dùng không tồn tại hoặc đã bị xóa"
      });
    }
    res.status(200).send({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

/* POST create new user */
router.post('/', async function (req, res, next) {
  let body = req.body;
  console.log(body);
  try {
    let newUser = new User({
      username: body.username,
      password: body.password,
      email: body.email,
      fullName: body.fullName || '',
      avatarUrl: body.avatarUrl || '',
      status: body.status || false,
      role: body.role || null,
      loginCount: body.loginCount || 0
    });
    await newUser.save();
    res.send(newUser);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

/* PUT update user */
router.put('/:id', async function (req, res, next) {
  try {
    let body = req.body;
    let user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      body,
      { new: true }
    ).populate('role');
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Người dùng không tồn tại hoặc đã bị xóa"
      });
    }
    res.status(200).send({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

/* DELETE soft delete user */
router.delete('/:id', async function (req, res, next) {
  try {
    let user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Người dùng không tồn tại"
      });
    }
    res.status(200).send({
      success: true,
      message: "Người dùng đã được đánh dấu là xóa",
      data: user
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

/* POST activate user */
router.post('/activate', async function (req, res, next) {
  try {
    let { email, username } = req.body;
    let user = await User.findOneAndUpdate(
      { email, username, isDeleted: false },
      { status: true },
      { new: true }
    ).populate('role');
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Người dùng không tồn tại hoặc đã bị xóa"
      });
    }
    res.status(200).send({
      success: true,
      message: "Người dùng đã được kích hoạt",
      data: user
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;