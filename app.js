
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Bear = require('./models/urls');
var index = require('./routes/index');
var users = require('./routes/users');
var app = express();
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var request = require('request');
mongoose.connect('mongodb://localhost:27017/microservice');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);




app.get('/:orig_url',function (req,res) {
    var userUrl = req.params.orig_url;
    if (userUrl.substring(0,4) !== 'http'){
        userUrl = 'http://'+ userUrl;
        console.log(userUrl)
    }
    var request = require('request');
    request(userUrl, function (error, response, body) {
        if ( response.statusCode < 400) {
            console.log('is uri'); // Show the HTML for the Google homepage.
        }
        else{ response.json({message: 'this is not a valid url. Make sure it is either in https://something.com or something.com'})}
    })

    var urlStamp = new Bear();
    urlStamp.originalUrl = userUrl;
    urlStamp.shortened = urlStamp.id.substring((urlStamp.id).length -4) + urlStamp.originalUrl.substring((urlStamp.originalUrl.length) -8,(urlStamp.originalUrl.length) -4);
    urlStamp.useableURL =  req.headers.host +'/go/' +  urlStamp.shortened;
    urlStamp.save(function (err) {
        if (err){res.send(err)}
        res.json({message:'URL will be shortened'});
        console.log(urlStamp)
    })
});



app.get('/api/list',function (req,res, urlStamps) {
    Bear.find(function (err,urlStamps) {
        res.json(urlStamps)
    })
});
app.get('/go/:newUrl', function (req,res) {
    var shortUrl ={shortened: req.params.newUrl};
    Bear.find(shortUrl ,function (err,urlStamp) {
        //res.json(shortUrl);
       res.redirect('https://' +urlStamp[0].originalUrl) ;

    });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
