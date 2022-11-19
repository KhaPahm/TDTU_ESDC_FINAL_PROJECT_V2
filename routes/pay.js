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
    database.query("select a.* FROM esdc_final.useraddress a join esdc_final.user u on a.UserID = u.UserID where u.Username = ? and a.Deleted=0", [decode.username], (error, result) => {
        if (error) throw error;
        res.json({
            addressList: result
        })
    })
})


router.get('/done', async (req, res, next) => {
    const request = require('url').parse(req.url, true).query;
    res.render('index', { title: 'Thanh toán thành công!', file: 'paydone', orderID: request.orderID })
})

router.post('/addNewAdress', async (req, res, next) => {
    const decode = jwt.verify(req.cookies.userRegisterd, 'thi*sis@jwt%secret0f-website');
    database.query('insert into esdc_final.useraddress (Address, Province, District, Ward, UserID) values (?, ?, ?, ?, (select UserID from esdc_final.user where Username = ?))', [req.body.address, req.body.province, req.body.district, req.body.ward, decode.username], (error, result) => {
        if (error) throw error;
        var address = req.body.address + ", " + req.body.province + ", " + req.body.district + ", " + req.body.ward;
        database.query('SELECT max(AddressID) as IdAdd FROM esdc_final.useraddress where UserID = (select UserID from esdc_final.user where Username = ?);', [decode.username], (error, resultNewID) => {
            res.json({
                status: 'success',
                newAddress: address,
                id_address: resultNewID[0].IdAdd
            })
        })
    })
})

router.post('/order', async (req, res, next) => {
    const decode = jwt.verify(req.cookies.userRegisterd, 'thi*sis@jwt%secret0f-website');
    var total = req.body.total.trim();

    database.query("SELECT * FROM esdc_final.cart c join esdc_final.cartdetail cd on c.CartID = cd.CartID where UserID = (select UserID from esdc_final.user where Username = ?);", [decode.username], (error, results) => {
        const listProduct = results;
        const cartID = listProduct[0].CartID;

        for (var i = 0; i < listProduct.length; i++) {
            var amountI = listProduct[i].Amount
            database.query("select Amount from esdc_final.property where ProductID = ? and Size = ? and Color = ?;", [listProduct[i].ProductID, listProduct[i].Size, listProduct[i].Color], (error, result) => {
                if (amountI > result[0].Amount) {
                    res.json({
                        status: "error",
                        message: "Amount bigger than number of product in our store!"
                    })
                }
            })
        }

        var insertRecipt = "insert into esdc_final.receipt (AddressID, Total,  UserID) values (?, ?, (SELECT UserID from esdc_final.user where username = ?))"
        database.query(insertRecipt, [req.body.addressid, total, decode.username], (error, result) => {
            if (error) throw error
        });

        database.query("select max(ReceiptID) as NewReceiptID  from esdc_final.receipt where (SELECT UserID from esdc_final.user where username = ?)", [decode.username], (error, result) => {
            if (error) throw error
            var newReceiptID = result[0].NewReceiptID
            for (var i = 0; i < listProduct.length; i++) {
                database.query("insert into esdc_final.receiptdetail value (?, ?, ?, ?, ?, ?);", [newReceiptID, listProduct[i].ProductID, listProduct[i].Amount, listProduct[i].PurchasePrice, listProduct[i].Size, listProduct[i].Color], (error, res) => {
                    if (error) throw error
                })
                database.query("update esdc_final.property set Amount = Amount - ? where ProductID = ? and Size = ? and Color = ?", [listProduct[i].Amount, listProduct[i].ProductID, listProduct[i].Size, listProduct[i].Color], (error, result) => {
                    if (error) throw error
                })
            }

            database.query("delete from esdc_final.cartdetail where CartID = ?; update esdc_final.cart set Total = 0 where UserID = (select UserID from esdc_final.user where Username = ?)", [cartID, decode.username], (error, result) => {
                if (error) throw error
            })

            res.json({
                status: 'success',
                orderID: newReceiptID
            })
        })
    })
})


module.exports = router;
