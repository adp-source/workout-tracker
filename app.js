/*
CS290 / Homework 6 / Database interactions and UI
Anhdung Pham, 3/4/2018
*/

const express = require('express');

const app = express();
const handlebars = require('express-handlebars').create({defaultLayout:'main'});
const bodyParser = require('body-parser');
const db = require('./dbcon.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);

app.get('/',function(req,res){
  let context = {};
  res.render('home', context);
});

app.get('/query',function(req,res,next){
  db.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(rows));
  });
});

app.post('/insert',function(req,res,next){
  console.log("Insert endpoint.");
  console.log(req.body);
  if(req.body.name.length < 1){
    next(Error("Name is required."));
    return;
  }
  db.pool.query({
    sql: "INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)",
    values: [req.body.name, req.body.reps, req.body.weight, req.body.date, req.body.lbs]
  }, function(err, result){
    if(err){
      next(err);
      return;
    }
    res.status(200).send("Insert successful.");
  });
});

app.post('/delete',function(req,res,next){
  console.log("Delete endpoint.");
  console.log(req.body);
  db.pool.query({
    sql: "DELETE FROM workouts WHERE id=?",
    values: [req.body.id]
  }, function(err, result){
    if(err){
      next(err);
      return;
    }
    res.status(200).send("Delete successful.");
  });
});

app.post('/edit',function(req,res,next){
  console.log("Edit endpoint.");
  console.log(req.body);
  db.pool.query("SELECT * FROM workouts WHERE id=?", [req.body.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      let curVal = result[0];
      db.pool.query({
        sql: "UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?",
        values: [
          req.body.name || curVal.name, 
          req.body.reps || curVal.reps, 
          req.body.weight || curVal.weight, 
          req.body.date || curVal.date, 
          req.body.lbs || curVal.lbs,
          req.body.id ]
      }, function(err, result){
        if(err){
          next(err);
          return;
        }
        res.status(200).send("Update successful.");
      });
    }
  });
});

app.get('/reset-table',function(req,res,next){
  let context = {};
  db.pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    let createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    db.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on port ' + app.get('port') + '; press Ctrl-C to terminate.');
});
