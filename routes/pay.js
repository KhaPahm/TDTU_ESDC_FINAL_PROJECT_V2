var express = require('express');
const jwt = require('jsonwebtoken');

var router = express.Router();

var database = require('../database');
express.static('../uploads')
express.static('../public')

router.get('/userinfor', (req, res, next) => {
    try {
        const decode = jwt.verify(req.cookies.userRegisterd, 'thi*sis@jwt%secret0f-website');
        database.query("SELECT u.UserID, u.FirstName, LastName, u.Sex, u.Phone, u.Email, a.Address FROM esdc_final.user u join esdc_final.useraddress a on u.UserID = a.UserID where u.Username = ? group by u.UserID;", [decode.username], (error, result) => {
            res.json({data: result[0]});
        })
    } catch (error) {
        if (error) throw error
    }
})

router.get('/', (req, res, next) => {
    res.render('index', {title: 'NewShirts Pay',file: 'pay'})
})

module.exports = router;
