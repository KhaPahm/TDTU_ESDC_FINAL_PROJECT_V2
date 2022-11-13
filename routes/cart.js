var express = require('express');
const jwt = require('jsonwebtoken');

var router = express.Router();

var database = require('../database');
express.static('../uploads')
express.static('../public')

router.get('/', async (req, res, next) => {
    res.render('index', { title: 'NewShirts Cart', file: 'cart' })
})

router.get('/checkcart', async (req, res, next) => {
    try {
        const decode = jwt.verify(req.cookies.userRegisterd, 'thi*sis@jwt%secret0f-website');

        database.query("select Total from esdc_final.cart where CartID = (SELECT CartID FROM esdc_final.cart where UserID = (SELECT UserID FROM esdc_final.user where Username = ?))", [decode.username], (error, result) => {

            if (result[0].Total == 0) {
                if (error) throw error;
                res.json({
                    status: "NoData"
                })
            } else {
                ///
                var selectlist = "select c.CartID, c.ProductID, p.Name, c.Amount, c.PurchasePrice, c.Size, c.Color, i.Path from esdc_final.cartdetail c join esdc_final.images i on c.ProductID = i.ProductID join esdc_final.product p on c.ProductID = p.ProductID  where c.CartID = (SELECT CartID FROM esdc_final.cart where UserID = (SELECT UserID FROM esdc_final.user where Username = ?)) group by c.Color, c.Size"
                
                database.query(selectlist, [decode.username], (error, resultCart) => {
                    console.log(resultCart)
                    res.json({
                        status: "HaveData",
                        listP: resultCart
                    })
                })

            }
        })
    } catch (error) {
        if (error) throw error
    }
})

router.get('/remove', async(req, res, next) => {
    var query = require('url').parse(req.url, true).query;
    
    database.query("delete from esdc_final.cartdetail where CartID = ? and ProductID = ? and Size = ? and Color = ?; update esdc_final.cart set Total  = Total - ?  where CartID = ?", [query.cid, query.pid, query.size, query.color, query.amount,query.cid], (error, result) => {
        if(error) throw error;
        res.redirect('/cart');
    })
})
module.exports = router;