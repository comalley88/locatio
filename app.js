var fileUpload = require('express-fileupload');

var documentModel = require('./models/documents')
var financeModel = require('./models/finances')


var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(fileUpload());



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'reactapp/build')));

//Fix Heroku Router
app.use(express.static(path.resolve(__dirname, 'reactapp/build')));

//  __________ Route qui gère l'affichage des documents -- Alex __________ \\
app.get('/document', async function (req, res) {

  var documents = await documentModel.find();
  console.log(documents)
  res.json(documents)
})

//  __________ Route qui gère le download de fichier vers le front-end -- Alex __________ \\
app.get('/download-file', async function (req, res) {
  
  var filePath = await documentModel.findById(idDocument);
  console.log("-----------------  " + filePath.url + " -----------------")

  fs.readFile(filePath.url, function (err, data) {
    if (err) {
      console.log(err)
    } else {
      console.log(data)
      res.contentType("application/pdf");
      res.send(data);
    }
  });
});

app.get('/finance', async function (req, res) {

  var financeListCharges = await financeModel.find()

  res.json(financeListCharges)

})

app.get('/*', function (req, res) {
  res.sendFile(path.resolve(__dirname, 'reactapp/build','index.html'));
});



app.use('/', indexRouter);
app.use('/users', usersRouter);

// DB connection
require('./models/connection')

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
