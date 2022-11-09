const { query } = require('express');
var express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { response } = require('../app');
var router = express.Router();

var database = require('../database');

/* GET home page. */
router.get('/', async (req, res, next) => {
  if (!req.cookies.userRegisterd) {
    res.render("index", { file: 'store', loggedIn: 'false', user: "nothing" });
  }
  try {
    console.log(req.cookies.userRegisterd)
    const decode = jwt.verify(req.cookies.userRegisterd, 'thi*sis@jwt%secret0f-website');
    console.log(decode.username)

    database.query("SELECT * FROM esdc_final.useraccount WHERE username = ?", [decode.username], (error, result) => {
      if (error) return next();
      
      if (result[0]) {
        res.render("index", { file: 'store', loggedIn: 'true', user: result[0].UserName })
      } else {
        res.render("index", { file: 'store', loggedIn: 'false', user: 'fail' })
      }
    })
  } catch (error) {
    if (error) throw error
  }

});

router.get('/signup', function (req, res, next) {
  res.render('index', { file: 'signup' })
});

router.post('/signup', function (req, res, next) {
  var username = req.body.username;

  database.query("SELECT username FROM esdc_final.useraccount WHERE username = ?", [username], async (error, results) => {
    if (error) throw error;
    if (results[0]) {
      res.json({
        status: "error",
        message: "Username has already been registered"
      });
    } else {
      var Npassword = req.body.password;
      var firstname = req.body.firstname;
      var lastname = req.body.lastname;
      var sex = req.body.sex;
      var phone = req.body.phone;
      var email = req.body.email;
      var address = req.body.address;
      const password = await bcrypt.hash(Npassword, 8);

      res.json({
        status: "success",
        message: "User has been registered"
      })

      var query = `INSERT INTO esdc_final.useraccount values("${username}", "${password}"); 
      insert into esdc_final.user (firstname, lastname, sex, phone, email, username) values ("${firstname}", "${lastname}", "${sex}", "${phone}", "${email}", "${username}");
      insert into esdc_final.useraddress (address, userID) values ("${address}", (select userID from esdc_final.user where username = "${username}"))`;
      console.log(query)
      database.query(query, (error, results) => {
        if (error) throw error;
        res.json({
          status: "success",
          message: "User has been registered"
        })
      })
    }
  })

})

router.post('/signin', function (req, res, next) {
  var { username, password } = req.body;
  console.log(req.body);
  database.query('SELECT * from esdc_final.useraccount WHERE username = ?', [username], async (error, result) => {

    if (error) throw error;
    if (!result.length || !await bcrypt.compare(password, result[0].password)) {

      console.log("Wrong password");
      res.json({
        status: "error",
        message: "Incorrect username or Password!"
      })
    } else {
      const token = jwt.sign({ username: result[0].UserName }, 'thi*sis@jwt%secret0f-website', {
        expiresIn: '90d'
      })
      const cookieOptions = {
        expiresIn: new Date(Date.now() + 90 + 24 + 60 + 60 + 1000),
        httpOnly: true
      }
      res.cookie("userRegisterd", token, cookieOptions);
      res.json({
        status: "Succes",
        message: "User has been logged in"
      })
    }
  })
})



module.exports = router;
