var express = require('express');
var router = express.Router();

var mongo = require('mongodb');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* simple database sample page */
var mongoose = require('mongoose');

mongoose.connect("mongodb://user:se2018user@ds161539.mlab.com:61539/se-project-2018");
//stuff pw

//console.log(mongoose.connection.readyState);
var Schema = mongoose.Schema;

var CourseSchema = new Schema({
  instructor_en : { type: [String] },
  instructor: { type: [String] },
  point: { type: Number },
  session: { type: [String] },
  place: { type: [String] },
  crse: { type: String },
  url: {type:String},
});

function reqInst(query, callback) {
  var result;
  var Course = mongoose.model('Course', CourseSchema, 'beta');
  console.log("query : " , query);
  Course.find(query)
    .select('crse point instructor instructor_en session place url')
    .exec(function(err, courses) {
      callback(courses, query);
    });
}

function eqObj(a, b){
  return JSON.stringify(a) === JSON.stringify(b);
}

router.post('/userSearch', function(req, res) {
  //req.body.College (學院)
  //req.body.Department (系別)
  //req.body.Category (課程類別)
  //req.body.Time_Interval (時間:分為五天，當天沒想要的時間為0)
  //console.log("req.body.College"+req.body.College);
  var callback = function(result, query) {

    //sort
    courses = [];
    for(var idx in query["$or"]){
      var q = query["$or"][idx]
      var test;
      if(q.hasOwnProperty("crse")){
        test = function(e){return q.crse.test(e);}

      }
      else if(q.hasOwnProperty("instructor")){
        test = function(e){return e.instructor.includes(q.instructor);}
      }
      else if(q.hasOwnProperty("instructor_en")){
        test = function(e){return e.instructor_en.includes(q.instructor_en);}
      }
      for(var c in result){
        if(test(result[c])){
          courses.push(result[c]);
        }
      }
    }
    //console.log(courses);
    res.json({ data: courses });
  }

  query = {};
  if(req.body.Department !== ""){
    codes = { "資訊科學系" : [/^7.3/],
      "心理學系" : [/^7.2/],
      "應用數學系" : [/^701/, /^751/],
      "金融學系" : [/^3.2/],
      "國貿學系" : [/^3.1/],
      "會計學系" : [/^3(0|5)1/],
      "統計學系" : [/^3(0|5)4/],
      "企業管理學系" : [/^3.5/],
      "資訊管理學系" : [/^3.6/],
      "財務管理學系" : [/^3.7/],
      "新聞學系" : [/^4(0|5)1/],
      "廣告學系" : [/^4(0|5)2/],
      "廣播電視學系" : [/^4(0|5)3/],
      "法律學系" : [/^6(0|5)1/],
      "政治學系" : [/^2(0|5)2/],
      "社會學系" : [/^2(0|5)4/],
      "財政學系" : [/^2(0|5)5/],
      "公共行政學系" : [/^2(0|5)6/],
      "地政學系" : [/^2(0|5)7/],
      "經濟學系" : [/^2(0|5)8/],
      "民族學系" : [/^2(0|5)9/],
      "中國文學系" : [/^1(0|5)1/],
      "歷史學系" : [/^1(0|5)3/],
      "哲學系" : [/^1(0|5)4/],
      "外交學系" : [/^2(0|5)3/],
      "教育學系" : [/^1(0|5)2/],
    };
    if(req.body.Department in codes){
      query.code = { $in: codes[req.body.Department] };
    }
  }
  else if(req.body.College !== ""){
    codes = { "理學院" : "7",
      "商學院" : "3",
      "傳播學院" : "4",
      "法學院" : "6",
      "社會科學學院" : "2",
      "文學院" : "1",
      "國際事務學院" : "8",
      "教育學院" : "9"
    };
    if(req.body.College in codes){
      query.code = { $regex: '^' + codes[req.body.College] };
    }
  }

  if(req.body.Category !== ""){
    if(req.body.Category == "必修"){
      query.crse_type = "必";
    }
    else if(req.body.Category == "選修"){
      query.crse_type = "選";
    }
    else{
      types = ["體育", "服務學習", "---通識(全部)---", "中文通識",
        "外文通識", "人文通識", "社會通識", "自然通識"];
      codes = [{ $regex: /^002/ }, { $regex: /^050/ },
        { $in: [/^03/, /^04/]}, { $regex: /^031/ },
        { $regex: /^032/ }, { $regex: /^041/ } ,
        { $regex: /^042/ }, { $regex: /^043/ } ];
      for(var i = 0 ; i < types.length ; i++){
        if(req.body.Category === types[i]){
          query.code = codes[i];
          break;
        }
      }
    }
  }
  if(!eqObj(req.body.Time_Interval,
    { '1': '0', '2': '0', '3': '0', '4': '0', '5': '0' })){
    function toBin(n){
      if(n == 0) return '';
      else return toBin(Math.floor(n / 2)) + String(n % 2)
    }
    time = req.body.Time_Interval;
    conds = [];
    for(var i = 0 ; i < 5 ; i++){
      if(time[String(i + 1)] !== '0'){
        day = time[String(i + 1)];
        mask = "00";
        for(var j = 0 ; j < 9 ; j++){
          mask += day.indexOf(String(j + 1)) >= 0 ? '.' : '0';
        }
        bin = toBin(i + 1);
        mask = '0'.repeat(3 - bin.length) + bin + mask;
        mask += "00000";
        conds.push(new RegExp(mask,'i'));
      }
    }
    if(conds.length !== 0){
      query.session = { $in : conds };
    }
  }
  if(req.body.Keyword !== ""){
    var key = req.body.Keyword;
    fuzzy_searh('course/uinstructor.txt',
    key, 10, function(insts){
      return fuzzy_searh('course/uinstructor_en.txt',
        key, 10, function(insts_en){
          return fuzzy_searh('course/ucourse_name.txt',
            key, 10, function(course){
              return fuzzy_searh('course/ucourse_name_en.txt',
                key, 10, function(course_en){
                  var eq_one = function(e){return e[1] === 1;};
                  insts = insts.some(eq_one) ? insts.filter(eq_one) : insts;
                  insts_en = insts_en.some(eq_one) ? insts_en.filter(eq_one) : insts_en;

                  insts.map(function(e){e.push("instructor");})
                  insts_en.map(function(e){e.push("instructor_en");})
                  course = course.map(function(e){ return [(new RegExp(e[0], "i")), e[1]]});
                  course.map(function(e){e.push("crse");})

                  
                  course_en = [[new RegExp(key,"i") , 1, "crse"]]

                  var all = insts.concat(insts_en.concat(course.concat(course_en)));

                  all = all.sort(function(a,b){return b[1] - a[1];});
                  all = all.filter(function(e){return e[1] > 0;});

                  all = all.map(function(e){ var obj = {}; obj[e[2]] = e[0]; return obj;});
                  query["$or"] = all;
                  //if(insts.length !== 0)
                  //  query.instructor = {$in : insts.map(e => e[0])};
                  //if(insts_en.length !== 0)
                  //  query.instructor_en = {$in : insts_en.map(e => e[0])};
                  //if(course.length + course_en.length !== 0)
                  //  query.crse = {$in :
                  //    course.map(e => new RegExp(e[0] + '*', "i"))
                  //    .concat(course_en.map(e => new RegExp('*' + e[0], "i")))};
                  return reqInst(query, callback);
                });
            });
        });
    });
  }
  else{
    return reqInst(query, callback);
  }

})

router.get('/table', function(req, res) {
  res.render("table", {});
})

router.get('/try', function(req, res) {
  key = "Physics";
  fuzzy_searh('course/uinstructor.txt',
    key, 10, function(insts){
      return fuzzy_searh('course/uinstructor_en.txt',
        key, 10, function(insts_en){
          return fuzzy_searh('course/ucourse_name.txt',
            key, 10, function(course){
              return fuzzy_searh('course/ucourse_name_en.txt',
                key, 10, function(course_en){
                  var eq_one = function(e){return e[1] === 1;};
                  insts = insts.some(eq_one) ? insts.filter(eq_one) : insts;
                  insts_en = insts_en.some(eq_one) ? insts_en.filter(eq_one) : insts_en;

                  insts.map(function(e){e.push("inst");})
                  insts_en.map(function(e){e.push("inst_en");})
                  course = course.map(function(e){ return [e[0], e[1]]});
                  course.map(function(e){e.push("course");})

                  course_en = course_en.map(function(e){ return [e[0], e[1]]});


                  res.send(course_en);
                  course_en.map(function(e){e.push("course_en");})

                  var all = insts.concat(insts_en.concat(course.concat(course_en)));

                  all = all.sort(function(a,b){return b[1] - a[1];});
                  all = all.filter(function(e){return e[1] > 0;});

                  all = all.map(function(e){ var obj = {}; obj[e[2]] = e[0]; return obj;});

                  //query["$or"] = all;
                  res.send(all);
                  //if(insts.length !== 0)
                  //  query.instructor = {$in : insts.map(e => e[0])};
                  //if(insts_en.length !== 0)
                  //  query.instructor_en = {$in : insts_en.map(e => e[0])};
                  //if(course.length + course_en.length !== 0)
                  //  query.crse = {$in :
                  //    course.map(e => new RegExp(e[0] + '*', "i"))
                  //    .concat(course_en.map(e => new RegExp('*' + e[0], "i")))};
                  //return reqInst(query, callback);
                });
            });
        });
    });
})

var fs = require('fs');
var wuzzy = require('wuzzy');

function fuzzy_searh(fileName, desire, number, cb){
  list = [];
  desire = desire.toUpperCase();
  fs.readFile(fileName, function(err, data) {

    var lines = String(data).replace('\r', '').split('\n');

    lines.forEach(function(line) {
      list.push([line, wuzzy.jarowinkler(line, desire)]);
    });

    list = list.sort(function(a, b) { return b[1] - a[1]; });
    list = list.slice(0, number);
    cb(list);
  });
}

module.exports = router;
