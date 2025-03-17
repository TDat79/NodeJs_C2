let jwt = require('jsonwebtoken')
let constants = require('../Utils/constants')
let userController = require('../controllers/users')
module.exports = {
  check_authentication: async function (req, res, next) {
    if (req.headers.authorization) {
      let token_authorization = req.headers.authorization;
      if (token_authorization.startsWith("Bearer")) {
        let token = token_authorization.split(" ")[1];
        let verifiedToken = jwt.verify(token, constants.SECRET_KEY);
        if (verifiedToken) {
          console.log(verifiedToken);
          let user = await userController.getUserById(verifiedToken.id)
          req.user = user;
          next()
        }
      } else {
        throw new Error("ban chua dang nhap")
      }
    } else {
      throw new Error("ban chua dang nhap")
    }
  },
  isAdmin: function (req, res, next) {
    if (req.user && req.user.role.roleName == 'ADMIN') {
      next();
    } else {
      res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
  }
};
