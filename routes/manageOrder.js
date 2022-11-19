var express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var router = express.Router();

var database = require('../database');

router.get('/neworder', (req, res, next) => {
    res.render('manage', {
        title: 'Đơn hàng mới',
        file: 'neworder'
    });
})

router.get('/getDataWaiting', (req, res, next) => {
    console.log("hehehe");
    database.query("SELECT r.ReceiptID, ua.Address, ua.Province, ua.District, ua.Ward, u.Firstname, u.Lastname, r.Date, r.Pay, r.Total FROM esdc_final.receipt r join esdc_final.user u on r.UserID=u.UserID join esdc_final.useraddress ua on r.AddressID = ua.AddressID where r.State='waiting'", (error, result) => {
        res.json({
            orders: result
        })
    })
})

router.get('/processOrder', (req, res, next) => {
    res.render('manage', {
        title: 'Đơn hàng đang xử lý',
        file: 'processOrder'
    });
})

router.get('/doneOrder', (req, res, next) => {
    res.render('manage', {
        title: 'Đơn hàng đã bán',
        file: 'doneOrder'
    });
})

router.get('/requestCancel', (req, res, next) => {
    res.render('manage', {
        title: 'Đơn hàng yêu cầu hoàn trả',
        file: 'requestCancel'
    });
})

router.get('/cancelledOrder', (req, res, next) => {
    res.render('manage', {
        title: 'Đơn hàng đã hủy',
        file: 'cancelledOrder'
    });
})

router.post('/getDetail', (req, res, next) => {
    console.log(req.body.idOrder)
    database.query("SELECT r.CustomerNote, u.FirstName, u.LastName, u.Phone, r.Date, ua.Address, ua.Province, ua.District, ua.Ward, rd.ProductID, p.Name, rd.Amount, rd.PurchasePrice, rd.Size, rd.Color as name  FROM esdc_final.receipt r join esdc_final.receiptdetail rd on r.ReceiptID = rd.ReceiptID join esdc_final.user u on r.UserID = u.UserID join esdc_final.useraddress ua on r.AddressID = ua.AddressID JOIN esdc_final.product p on rd.ProductID = p.ProductID where r.ReceiptID = ?", [req.body.idOrder], (error, result) => {
        var customer = result[0].FirstName + " " + result[0].LastName
        var address = result[0].Address + ", " + result[0].Ward + ", " + result[0].District + ", " + result[0].Province
        var phone = result[0].Phone
        var date = result[0].Date
        res.json({
            status: 'success',
            customer: customer,
            address: address,
            phone: phone,
            date: date,
            data: result
        })
    })
})

router.get('/getDataProcess', (req, res, next) => {
    const decode = jwt.verify(req.cookies.staffRegisterd, 'thi*sis@jwt%secret0f-website');
    database.query("select Role from esdc_final.staff where Username = ?", [decode.username], (error, result) => {
        if (result[0].Role > 2) {
            database.query("SELECT r.ReceiptID, ua.Address, ua.Province, ua.District, ua.Ward, u.Firstname, u.Lastname, r.Date, r.Pay, r.Total FROM esdc_final.receipt r join esdc_final.user u on r.UserID=u.UserID join esdc_final.useraddress ua on r.AddressID = ua.AddressID where r.State='processing'", (error, result) => {
                res.json({
                    orders: result
                })
            })
        } else {
            database.query("SELECT r.ReceiptID, ua.Address, ua.Province, ua.District, ua.Ward, u.Firstname, u.Lastname, r.Date, r.Pay, r.Total FROM esdc_final.receipt r join esdc_final.user u on r.UserID=u.UserID join esdc_final.useraddress ua on r.AddressID = ua.AddressID where r.State='processing' and r.StaffID = (select StaffID from esdc_final.staff where username = ?)", [decode.username], (error, result) => {
                res.json({
                    orders: result
                })
            })
        }
    })

})

router.get('/getDataRequestCancel', (req, res, next) => {
    const decode = jwt.verify(req.cookies.staffRegisterd, 'thi*sis@jwt%secret0f-website');
    database.query("select Role from esdc_final.staff where Username = ?", [decode.username], (error, result) => {
        if (result[0].Role > 2) {
            database.query("SELECT r.ReceiptID, ua.Address, ua.Province, ua.District, ua.Ward, u.Firstname, u.Lastname, r.Date, r.Pay, r.Total FROM esdc_final.receipt r join esdc_final.user u on r.UserID=u.UserID join esdc_final.useraddress ua on r.AddressID = ua.AddressID where r.State='reqCancel'", (error, result) => {
                res.json({
                    orders: result
                })
            })
        } else {
            database.query("SELECT r.ReceiptID, ua.Address, ua.Province, ua.District, ua.Ward, u.Firstname, u.Lastname, r.Date, r.Pay, r.Total FROM esdc_final.receipt r join esdc_final.user u on r.UserID=u.UserID join esdc_final.useraddress ua on r.AddressID = ua.AddressID where r.State='reqCancel' and r.StaffID = (select StaffID from esdc_final.staff where username = ?)", [decode.username], (error, result) => {
                res.json({
                    orders: result
                })
            })
        }
    })

})



router.get('/getDataDone', (req, res, next) => {
    const decode = jwt.verify(req.cookies.staffRegisterd, 'thi*sis@jwt%secret0f-website');
    database.query("select Role from esdc_final.staff where Username = ?", [decode.username], (error, result) => {
        if (result[0].Role > 2) {
            database.query("SELECT r.ReceiptID, ua.Address, ua.Province, ua.District, ua.Ward, u.Firstname, u.Lastname, r.Date, r.Pay, r.Total FROM esdc_final.receipt r join esdc_final.user u on r.UserID=u.UserID join esdc_final.useraddress ua on r.AddressID = ua.AddressID where r.State='done'", (error, result) => {
                res.json({
                    orders: result
                })
            })
        } else {
            database.query("SELECT r.ReceiptID, ua.Address, ua.Province, ua.District, ua.Ward, u.Firstname, u.Lastname, r.Date, r.Pay, r.Total FROM esdc_final.receipt r join esdc_final.user u on r.UserID=u.UserID join esdc_final.useraddress ua on r.AddressID = ua.AddressID where r.State='done' and r.StaffID = (select StaffID from esdc_final.staff where username = ?)", [decode.username], (error, result) => {
                res.json({
                    orders: result
                })
            })
        }
    })

})

router.get('/getDataCancelled', (req, res, next) => {
    const decode = jwt.verify(req.cookies.staffRegisterd, 'thi*sis@jwt%secret0f-website');
    database.query("select Role from esdc_final.staff where Username = ?", [decode.username], (error, result) => {
        if (result[0].Role > 2) {
            database.query("SELECT r.ReceiptID, ua.Address, ua.Province, ua.District, ua.Ward, u.Firstname, u.Lastname, r.Date, r.Pay, r.Total FROM esdc_final.receipt r join esdc_final.user u on r.UserID=u.UserID join esdc_final.useraddress ua on r.AddressID = ua.AddressID where r.State='cancel'", (error, result) => {
                res.json({
                    orders: result
                })
            })
        } else {
            database.query("SELECT r.ReceiptID, ua.Address, ua.Province, ua.District, ua.Ward, u.Firstname, u.Lastname, r.Date, r.Pay, r.Total FROM esdc_final.receipt r join esdc_final.user u on r.UserID=u.UserID join esdc_final.useraddress ua on r.AddressID = ua.AddressID where r.State='cancel' and r.StaffID = (select StaffID from esdc_final.staff where username = ?)", [decode.username], (error, result) => {
                res.json({
                    orders: result
                })
            })
        }
    })

})



router.post('/receiveOrder', async (req, res, next) => {
    const decode = jwt.verify(req.cookies.staffRegisterd, 'thi*sis@jwt%secret0f-website');
    database.query("update esdc_final.receipt set State = 'processing', StaffID = (select StaffID from esdc_final.staff where username = ?) where ReceiptID = ?", [decode.username, req.body.orderID], (error, result) => {
        if (error) throw error
        res.json({
            status: 'success'
        })
    })
})

router.post('/done', async (req, res, next) => {
    const decode = jwt.verify(req.cookies.staffRegisterd, 'thi*sis@jwt%secret0f-website');
    database.query("update esdc_final.receipt set State = 'done', StaffID = (select StaffID from esdc_final.staff where username = ?) where ReceiptID = ?", [decode.username, req.body.orderID], (error, result) => {
        if (error) throw error
        res.json({
            status: 'success'
        })
    })
})

router.post('/cancel', async (req, res, next) => {
    const decode = jwt.verify(req.cookies.staffRegisterd, 'thi*sis@jwt%secret0f-website');
    database.query("update esdc_final.receipt set State = 'cancel', StaffID = (select StaffID from esdc_final.staff where username = ?), StaffNote = ?  where ReceiptID = ?", [decode.username, req.body.reason, req.body.idOrder], (error, result) => {
        if (error) throw error
        res.json({
            status: 'success'
        })
    })
})

module.exports = router;