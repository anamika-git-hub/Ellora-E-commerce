const mongoose=require('mongoose');
const dotenv = require('dotenv').config();
mongoose.connect(process.env.MONGODB_URL).then(()=>console.log("connect")).catch((err)=>console.log(err))

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('express-flash');
const session = require('express-session');
const config = require('./config/config');
const nocache = require('nocache');
// const morgan = require('morgan')
const adminRouter = require('./routes/adminRouter');
const usersRouter = require('./routes/usersRouter');


const app = express();
app.use(nocache());
// app.use(morgan('tiny'))
app.use(session({secret:"abc",resave:false,saveUninitialized:true}));
app.use(flash());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  



  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(process.env.PORT,()=>{
  console.log(`server is running on ${process.env.PORT}`)
})
