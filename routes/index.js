var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send({
    "success": true,
    "data": "hello TD"
  });
});

module.exports = router;
