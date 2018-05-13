var express = require('express');
var router = express.Router();

var mongo = require('mongodb');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* simple database sample page */
var mongoose = require('mongoose');

mongoose.connect("mongodb://[user]:[pw]@ds161539.mlab.com:61539/se-project-2018");
//stuff pw

console.log(mongoose.connection.readyState);
var Schema = mongoose.Schema;

var CourseSchema = new Schema({
    instructor: { type: [String] },
    point: { type: Number },
    session: { type: [String] },
    place: { type: [String] },
    crse: { type: String },
});

function reqInst(name, callback) {
    var result;
    var Course = mongoose.model('Course', CourseSchema, 'beta');
    Course.find({ instructor: { $regex: name } })
        .select('crse point instructor session place')
        .exec(function(err, courses) {
            callback(courses);
        });
}

router.post('/userSearch', function(req, res) {
    reqInst(req.body.Keyword, function(result) {
        res.json({ data: result })
    });
})

router.get('/table', function(req, res) {
    res.render("table", {});
})

module.exports = router;