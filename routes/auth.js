var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
const { check_authentication } = require('../Utils/check_auth');
const check_auth = require('../Utils/check_auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', async function (req, res, next) {
  try {
    let body = req.body;
    let result = await userController.createUser(
      body.username,
      body.password,
      body.email,
      'ADMIN'
    )
    res.status(200).send({
      success: true,
      data: result
    })
  } catch (error) {
    next(error);
  }

})
router.post('/login', async function (req, res, next) {
  try {
    let username = req.body.username;
    let password = req.body.password;
    let result = await userController.checkLogin(username, password);
    res.status(200).send({
      success: true,
      data: result
    })
  } catch (error) {
    next(error);
  }

})
router.get('/me', check_authentication, async function (req, res, next) {
  try {
    res.status(200).send({
      success: true,
      data: req.user
    })
  } catch (error) {
    next();
  }
})

// Route reset password (chỉ admin mới có thể thực hiện)
router.get('/resetPassword/:id', check_authentication, check_auth.isAdmin, async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await userController.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Reset password về '123456'
    const hashedPassword = bcrypt.hashSync('123456', 10);
    await userController.updateUserPassword(userId, hashedPassword);

    res.json({ message: "Reset mật khẩu thành công" });
  } catch (error) {
    next(error);
  }
});
// Đổi mật khẩu
router.post('/changePassword', check_authentication, async function (req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Mật khẩu hiện tại không đúng");
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    await userController.updateUserPassword(user.id, hashedNewPassword);

    res.status(200).send({
      success: true,
      message: "Đổi mật khẩu thành công"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router