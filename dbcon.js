var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_secret',
  password        : 'secret',
  database        : 'cs290_secret'
});

module.exports.pool = pool;
