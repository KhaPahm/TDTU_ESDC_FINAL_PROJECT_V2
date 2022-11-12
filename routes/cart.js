const { query } = require('express');
var express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { response, render } = require('../app');
var router = express.Router();

var database = require('../database');
express.static('../uploads')
express.static('../public')

router.get('/', async (req, res, next) => {
    res.render('index', { file: 'cart' })
})

router.get('/checkcart', async (req, res, next) => {
    try {

        const decode = jwt.verify(req.cookies.userRegisterd, 'thi*sis@jwt%secret0f-website');
        console.log(decode.username)

        database.query("select Total from esdc_final.cart where CartID = (SELECT CartID FROM esdc_final.cart where UserID = (SELECT UserID FROM esdc_final.user where Username = ?))", [decode.username], (error, result) => {
            if (result[0].Total == 0) {
                if (error) throw error;
                res.json({
                    status: "NoData"
                })
            }
        })


    } catch (error) {
        if (error) throw error
    }
})
module.exports = router;