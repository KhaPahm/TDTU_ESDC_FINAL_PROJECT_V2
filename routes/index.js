const { query } = require('express');
var express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { response } = require('../app');
var router = express.Router();
var { OAuth2Client } = require('google-auth-library');
var nodemailer = require('nodemailer');


var database = require('../database');
const { verify } = require('crypto');
express.static('../uploads')
express.static('../public')

// GOOGLE_MAILER_CLIENT_ID: 1010698284682-kg6b6ltf5aefq5k26qjtt6su5vhmvaj2.apps.googleusercontent.com
// GOOGLE_MAILER_CLIENT_SECRET: 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
const myOAuth2Client = new OAuth2Client(
  '1010698284682-kg6b6ltf5aefq5k26qjtt6su5vhmvaj2.apps.googleusercontent.com',
  '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'
)

myOAuth2Client.setCredentials({
  refresh_token: '1//04N4DEcbK56P3CgYIARAAGAQSNwF-L9IrM_qT5c2En4Qd60PH3-9mb_UHJo3v-niJO1NwFrXQrgY4h2hu9_SV726ZnciXfuQKp4c'
})


/* LOAD home page. */
router.post('/store', async (req, res, next) => {
  database.query("SELECT p.ProductID, p.Name, p.Price, i.Path from esdc_final.product p Join esdc_final.images i  on p.ProductID = i.ProductID where p.Deleted=false group by ProductID", (error, result) => {
    res.json({
      data: result
    })
  })
})

router.get('/', async (req, res, next) => {
  res.render("index", { title: 'NewShirts store', file: 'store' })
});

router.get('/loggined', async (req, res, next) => {
  try {
    if (!req.cookies.userRegisterd) {
      res.json({ loggedIn: 'false', user: 'fail' })
    } else {
      const decode = jwt.verify(req.cookies.userRegisterd, 'thi*sis@jwt%secret0f-website');

      database.query("select * from esdc_final.avatar where username = ?", [decode.username], (error, resultAvt) => {
        if (error) return next();
        database.query("select total from esdc_final.cart where CartID = (SELECT CartID FROM esdc_final.cart where UserID = (SELECT UserID FROM esdc_final.user where Username = ?))", [decode.username], (error, result) => {
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
  res.render('index', { title: 'NewShirts Sigup', file: 'signup', loggedIn: 'false' })
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
      // var Npassword = req.body.password;
      // var firstname = req.body.firstname;
      // var lastname = req.body.lastname;
      // var sex = req.body.sex;
      // var phone = req.body.phone;
      var email = req.body.email;
      // var address = req.body.address;
      // const password = await bcrypt.hash(Npassword, 8);
      const hashUsername = await bcrypt.hash(username, 8);
      const verifyLink = `http://localhost:3000/verify?username=${username}&token=${hashUsername}&form=${JSON.stringify(req.body)}`;
      console.log(verifyLink);
      try {
        const myAccessTokenObject = await myOAuth2Client.getAccessToken();
        const myAccessToken = myAccessTokenObject?.token;

        const transport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAUTH2',
            user: 'khapham.work@gmail.com',
            clientId: '1010698284682-kg6b6ltf5aefq5k26qjtt6su5vhmvaj2.apps.googleusercontent.com',
            clientSecret: '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',
            refresh_token: '1//04mW_YadMLVZiCgYIARAAGAQSNwF-L9IrbBlgxfGjoV68huAL5RPhmSW7oBwz02jyMhtSQ0Q7Q97RD6Zwc5stdr63eXV7_aewdXk',
            accessToken: myAccessToken
          }
        })

        const mailOptions = {
          to: email,
          subject: 'VERIFY EMAIL FOR NEW ACCOUNT OF NEWSHIRTS STORE',
          html: `<h3>Xin chào tôi đến từ Newshirts Store</h3>` +
            `<p>Chúng tôi ghi nhận bạn đang tạo một tài khoản mới thông qua email này. Nếu đó là bạn vui lòng xác nhận qua <a href='${verifyLink}'>đường link này</a></p>`
        }

        await transport.sendMail(mailOptions);

        res.json({
          status: 'success',
          mail: email
        })
      } catch (error) {
        console.log(error);
      }

    }
  })

})

router.get('/verify', async (req, res, next) => {
  var query = require('url').parse(req.url, true).query;
  var form = JSON.parse(query.form);
  database.query("SELECT username FROM esdc_final.useraccount WHERE username = ?", [query.username], async (error, results) => {
    if (error) throw error;
    if (results[0]) {
      res.render('index', { title: 'NewShirts Welcome', file: 'verify', loggedIn: 'true', status: "danger", message: "Tài khoản đã được kích hoạt!" });
    } else {
      bcrypt.compare(query.username, query.token, async (error, result) => {
        if (result == true) {
          // console.log(form.password);
          var username = form.username;
          var Npassword = form.password;
          var firstname = form.firstname;
          var lastname = form.lastname;
          var sex = form.sex;
          var phone = form.phone;
          var email = form.email;
          var address = form.address;
          var province = form.province;
          var distinct = form.district;
          var ward = form.district;
          const password = await bcrypt.hash(Npassword, 8);

          var query = `INSERT INTO esdc_final.useraccount values("${username}", "${password}", CURDATE(), false); 
          insert into esdc_final.user (firstname, lastname, sex, phone, email, username) values ("${firstname}", "${lastname}", "${sex}", "${phone}", "${email}", "${username}");
          insert into esdc_final.useraddress (Address, Province, District, Ward, userID) values ("${address}","${province}", "${distinct}", "${ward}", (select userID from esdc_final.user where username = "${username}")); 
          insert into esdc_final.avatar (src, UserName) values ("defaut_avatar.jpg", "${username}"); insert into esdc_final.cart (Total, UserID) values (0, (select UserID from esdc_final.user where UserName = '${username}'))`;
          console.log(query)
          database.query(query, (error, results) => {
            if (error) throw error;
            const token = jwt.sign({ username: username }, 'thi*sis@jwt%secret0f-website', {
              expiresIn: '90d'
            })
            const cookieOptions = {
              expiresIn: new Date(Date.now() + 90 + 24 + 60 + 60 + 1000),
              httpOnly: true
            }
            res.cookie("userRegisterd", token, cookieOptions);

            res.render('index', { title: 'NewShirts Welcome', file: 'verify', loggedIn: 'true', status: "success", message: `Chào mừng ${firstname} đến với cửa hàng của Newshirts!  ` })
          })
        } else {

        }
      })
    }
  })
})

router.post('/signin', function (req, res, next) {
  var { username, password } = req.body;
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
        res.render('index', { title: resultP[0].Name, file: 'productdetail', productInfo: product })
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
          var userID = result[0].UserID;
          database.query("SELECT ProductID, Size, Color FROM esdc_final.cartdetail where CartID = (SELECT CartID FROM esdc_final.cart where UserID = ?);", [userID], (error, result) => {
            console.log(result)
            if (typeof result[0] == 'undefined') {
              var insert = "insert into esdc_final.cartdetail values ((SELECT CartID FROM esdc_final.cart where UserID = ?), ?, ?, (SELECT Price FROM esdc_final.product where ProductID = ?), ?, ?);" +
                "update esdc_final.cart as c, (select sum(Amount) sumAmount from esdc_final.cartdetail where CartID = (SELECT CartID FROM esdc_final.cart where UserID = ?) group by CartID) as t set c.Total = t.sumAmount where c.UserID = ?;"
              database.query(insert, [userID, req.body.IDProduct, amount, req.body.IDProduct, req.body.size, req.body.color, userID, userID], (error, result) => {
                res.json({
                  status: "success"
                })
              })
            } else if (result[0].ProductID == req.body.IDProduct && result[0].Size == req.body.size && result[0].Color == req.body.color) {
              var update = "update esdc_final.cartdetail set Amount = Amount + ? where CartID = (SELECT CartID FROM esdc_final.cart where UserID = ?) and ProductID =? and Size=? and Color =?;" +
                "update esdc_final.cart as c, (select sum(Amount) sumAmount from esdc_final.cartdetail where CartID = (SELECT CartID FROM esdc_final.cart where UserID = ?) group by CartID) as t set c.Total = t.sumAmount where c.UserID = ?;";
              database.query(update, [amount, userID, req.body.IDProduct, req.body.size, req.body.color, userID, userID], (error, result) => {
                res.json({
                  status: "success"
                })
              })
            } else {
              var insert = "insert into esdc_final.cartdetail values ((SELECT CartID FROM esdc_final.cart where UserID = ?), ?, ?, (SELECT Price FROM esdc_final.product where ProductID = ?), ?, ?);" +
                "update esdc_final.cart as c, (select sum(Amount) sumAmount from esdc_final.cartdetail where CartID = (SELECT CartID FROM esdc_final.cart where UserID = ?) group by CartID) as t set c.Total = t.sumAmount where c.UserID = ?;"
              database.query(insert, [userID, req.body.IDProduct, amount, req.body.IDProduct, req.body.size, req.body.color, userID, userID], (error, result) => {
                res.json({
                  status: "success"
                })
              })
            }
          })

        })
      }
    })
  }
})

module.exports = router;
