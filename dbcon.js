var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_phamanh',
  password        : '7645',
  database        : 'cs290_phamanh'
});

module.exports.pool = pool;
