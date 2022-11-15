var express = require('express');
const jwt = require('jsonwebtoken');

var router = express.Router();

var database = require('../database');
express.static('../uploads')
express.static('../public')

router.get('/userinfor', async (req, res, next) => {
    try {
        const decode = jwt.verify(req.cookies.userRegisterd, 'thi*sis@jwt%secret0f-website');
        database.query("SELECT u.UserID, u.FirstName, LastName, u.Sex, u.Phone, u.Email, a.* FROM esdc_final.user u join esdc_final.useraddress a on u.UserID = a.UserID where u.Username = ? group by u.UserID;", [decode.username], (error, result) => {
            res.json({ data: result[0] });
        })
    } catch (error) {
        if (error) throw error
    }
})

router.get('/', (req, res, next) => {
    res.render('index', { title: 'NewShirts Pay', file: 'pay' })
})

router.get('/anotherAddress', async (req, res, next) => {
    const decode = jwt.verify(req.cookies.userRegisterd, 'thi*sis@jwt%secret0f-website');
    database.query("select a.* FROM esdc_final.useraddress a join esdc_final.user u on a.UserID = u.UserID where u.Username = ?", [decode.username], (error, result) => {
        if (error) throw error;
        res.json({
            addressList: result
        })
    })
})

router.post('/addNewAdress', async (req, res, next) => {
    const decode = jwt.verify(req.cookies.userRegisterd, 'thi*sis@jwt%secret0f-website');
    database.query('insert into esdc_final.useraddress (Address, Province, District, Ward, UserID) values (?, ?, ?, ?, (select UserID from esdc_final.user where Username = ?))', [req.body.address, req.body.province, req.body.district, req.body.ward, decode.username], (error, result) => {
        if (error) throw error;
        res.json({
            status: 'success',
            newAddress: req.body.address+", "+req.body.province+", "+req.body.district+", "+req.body.ward
        })
    })
})

router.post('/order', async (req, res, next) => {
    
})

module.exports = router;
