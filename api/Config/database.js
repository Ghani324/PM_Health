var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'scio-pmtool-qa.cfhiwiste2j6.us-east-1.rds.amazonaws.com', // Replace with your host name
  user: 'admin',      // Replace with your database username
  password: 'tXh9#S6+S)Y.CPYchT}p-.Xs{1fP',      // Replace with your database password
  database: 'PM_Health' // // Replace with your database Name
}); 
conn.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});
module.exports = conn;