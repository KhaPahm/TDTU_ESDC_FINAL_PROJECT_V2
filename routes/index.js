const { query } = require('express');
var express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { response } = require('../app');
var router = express.Router();

var database = require('../database');
express.static('../uploads')
express.static('../public')

/* LOAD home page. */
router.post('/store', async (req, res, next) => {
  database.query("SELECT p.ProductID, p.Name, p.Price, i.Path from esdc_final.product p Join esdc_final.images i  on p.ProductID = i.ProductID group by ProductID", (error, result) => {
    res.json({
      data: result
    })
  })
})

router.get('/', async (req, res, next) => {
  res.render("index", { file: 'store' })
});

router.get('/loggined', async (req, res, next) => {
  try {
    if (!req.cookies.userRegisterd) {
      res.json({ loggedIn: 'false', user: 'fail' })
    } else {
      const decode = jwt.verify(req.cookies.userRegisterd, 'thi*sis@jwt%secret0f-website');
      console.log(decode.username)

      database.query("select * from esdc_final.avatar where username = ?", [decode.username], (error, resultAvt) => {
        if (error) return next();
        database.query("select total from esdc_final.cart where CartID = (SELECT CartID FROM esdc_final.cart where UserID = (SELECT UserID FROM esdc_final.user where Username = ?))" , [decode.username], (error, result) => {        
          res.json({ loggedIn: 'true', user: decode.username, avtSrc: resultAvt[0].src, amountCart: result[0].total })
        })
      })
    }
  } catch (error) {
    if (error) throw error
  }


});

// SIGNUP
router.get('/signup', function (req, res, next) {
  res.render('index', { file: 'signup', loggedIn: 'false' })
});

router.post('/signup', function (req, res, next) {
  var username = req.body.username;

  database.query("SELECT username FROM esdc_final.useraccount WHERE username = ?", [username], async (error, results) => {
    console.log(results)
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

      var query = `INSERT INTO esdc_final.useraccount values("${username}", "${password}"); 
      insert into esdc_final.user (firstname, lastname, sex, phone, email, username) values ("${firstname}", "${lastname}", "${sex}", "${phone}", "${email}", "${username}");
      insert into esdc_final.useraddress (address, userID) values ("${address}", (select userID from esdc_final.user where username = "${username}")); 
      insert into esdc_final.avatar (src, UserName) values ("defaut_avatar.jpg", "${username}")`;
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
        status: "success",
        message: "Loggin Success"
      })
    }
  })
})

router.get('/logout', function (req, res, next) {
  res.clearCookie("userRegisterd");
  res.redirect("/");

})

router.get('/product-detail', function (req, res, next) {
  var query = require('url').parse(req.url, true).query;
  var id = query.id;
  var product = {
    PID: id,
    PName: "",
    PDescription: "",
    PPrice: "",
    PColor: [],
    PColorpicker: [],
    PImgs: []
  }
  database.query("Select Name, Description, Price from esdc_final.product where ProductId = ?", [id], (error, resultP) => {
    if (error) throw error;
    product.PName = resultP[0].Name;
    product.PDescription = resultP[0].Description;
    product.PPrice = resultP[0].Price;
    database.query("select distinct(Color), Colorpicker from esdc_final.property  where ProductID = ?", [id], (error, resultProperty) => {
      if (error) throw error;
      for (var i = 0; i < resultProperty.length; i++) {
        product.PColor.push(resultProperty[i].Color);
        product.PColorpicker.push(resultProperty[i].Colorpicker);
      }

      database.query("SELECT Path FROM esdc_final.images where ProductID = ?", [id], (error, resultImgs) => {
        if (error) throw error;
        for (var i = 0; i < resultImgs.length; i++) {
          product.PImgs.push(resultImgs[i].Path);
        }
        res.render('index', { file: 'productdetail', productInfo: product })
      })
    })

  })


})


router.post('/addtocart', function (req, res, next) {
  if (!req.cookies.userRegisterd) {
    res.json({
      status: "nonelogin"
    })
  } else {
    var query = "select Amount from esdc_final.property where ProductID = ? and size = ? and Color = ?";
    var amount = req.body.amount;
    database.query(query, [req.body.IDProduct, req.body.size, req.body.color], (error, result) => {
      if (error) throw error;
      if (result[0].Amount < amount) {
        res.json({
          status: "error",
          CurrentAmount: result[0].Amount
        })
      } else {
        const decode = jwt.verify(req.cookies.userRegisterd, 'thi*sis@jwt%secret0f-website');
        console.log(decode.username)

        database.query("select UserID from esdc_final.user where username = ?", [decode.username], (error, result) => {
          var insert = "insert into esdc_final.cartdetail values ((SELECT CartID FROM esdc_final.cart where UserID = ?), ?, ?, (SELECT Price FROM esdc_final.product where ProductID = ?), ?, ?);"+
                        "update esdc_final.cart as c, (select sum(Amount) sumAmount from esdc_final.cartdetail where CartID = (SELECT CartID FROM esdc_final.cart where UserID = ?) group by CartID) as t set c.Total = t.sumAmount where c.UserID = ?;"
          database.query(insert, [result[0].UserID, req.body.IDProduct, amount, req.body.IDProduct, req.body.size, req.body.color, result[0].UserID, result[0].UserID], (error, result) => {
            res.json({
              status: "success"
            })
          })
        })
      }
    })
  }
})

module.exports = router;
