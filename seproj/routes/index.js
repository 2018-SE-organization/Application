var express = require('express');
var router = express.Router();

var mongo = require('mongodb');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* simple database sample page */
var mongoose = require('mongoose');

mongoose.connect("mongodb://[act]:[pw]@ds161539.mlab.com:61539/se-project-2018");
//stuff pw

console.log(mongoose.connection.readyState);
var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    inst:      { type: String },
    point:     { type: Number },
    time:      { type: String },
    url:       { type: String},
    cname:     { type: String},
  }
);

function reqName(name, callback){
  var result;
  var Course = mongoose.model('Course', UserSchema, 'test');
  Course.find({inst:name})
    .select('inst cname point time')
    .exec(function(err, courses){
      callback(courses);
    });
}

router.get('/test.html', function (req, res) {
  console.log(req.query);
  if(req.query.name === undefined)
    res.render('test', {title: 'REQ COURSE', data:[]});
  else{
    reqName(req.query.name, function(result){
      res.render('test', {title: 'REQ COURSE', data:result});
    });
  }
  //class: reqName(req.query.name)
});

module.exports = router;
