var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
let cors = require('cors')

// Import các routes có sẵn
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Import các routes mới
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const reviewRoutes = require('./routes/reviews');
const couponRoutes = require('./routes/coupons');
const paymentRoutes = require('./routes/payments');

var app = express();

// Cấu hình CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'] // Thêm các methods cần thiết cho CRUD
}))

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/C2");
mongoose.connection.on("connected", () => {
  console.log("connected");
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('NNPTUD'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes có sẵn
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/menus', require('./routes/menus'));
app.use('/roles', require('./routes/roles'));
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/categories', require('./routes/categories'));

// Thêm các routes mới
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.send({
    success: false,
    message: err.message
  });
});

module.exports = app;