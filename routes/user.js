const { query } = require('express');
var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');


var database = require('../database');
express.static('../uploads')
express.static('../public')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'User Profile', file: 'user' })
});

router.get('/info', (req, res, next) => {
  try {
    const decode = jwt.verify(req.cookies.userRegisterd, 'thi*sis@jwt%secret0f-website');
    var query = "SELECT * FROM esdc_final.user WHERE Username = ?"
    database.query(query, [decode.username], (error, resultInfor) => {
      const infor = resultInfor[0];
      database.query("select * from esdc_final.useraddress where UserID = ? and Deleted = 'flase'", [infor.UserID], (error, resultAddress) => {
        if (error) throw error;
        res.json({
          status: "success",
          infor: infor,
          address: resultAddress
        })
      })

    })

  } catch (error) {
    throw error
  }
})

router.post('/editAddress', async (req, res, next) => {
  database.query("SELECT * FROM esdc_final.useraddress WHERE AddressID = ?", [req.body.id], (error, result) => {
    res.json({
      data: result[0]
    })
  })
})

router.post('/deleteAddress', async (req, res, next) => {
  console.log(req.body.id);
  database.query("UPDATE esdc_final.useraddress SET Deleted = true WHERE AddressID = ?", [req.body.id], (error, result) => {
    if (error) throw error
    res.json({
      status: 'success'
    })
  })
})

module.exports = router;
