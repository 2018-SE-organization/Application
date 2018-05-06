var express = require('express');
var router = express.Router();

var mongo = require('mongodb');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* simple database sample page */
router.get('/test.html', function (req, res) {
  //console.log(req);
  //console.log(res);
  res.render('test', { title: 'Express' });
  //res.send('Fuck World!');
});

module.exports = router;
