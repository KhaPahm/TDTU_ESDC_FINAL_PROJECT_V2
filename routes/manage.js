var express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var router = express.Router();

var database = require('../database');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, filename + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })


router.get("/", function (request, response, next) {
    response.render('manage', {
        title: 'Quản lý đơn hàng',
        file: 'neworder'
    });
});

router.get("/products", function (request, response, next) {
    response.render('manage', {
        title: 'Quản lý đơn hàng',
        file: 'listproducts'
    });
});

router.get('/login', function (request, response, next) {
    response.render('staffLogin', {
        title: 'Đăng nhập cho nhân viên'
    });
})

router.get('/addstaff', function (request, response, next) {
    response.render('manage', {
        title: 'Thêm nhân viên',
        file: 'addstaff'
    });
})

router.get('/checklogin', function (request, response, next) {
    try {
        if (!request.cookies.staffRegisterd) {
            response.json({ loggedIn: 'false', user: 'fail' })
        } else {
            const decode = jwt.verify(request.cookies.staffRegisterd, 'thi*sis@jwt%secret0f-website');
            console.log(decode.username);
            database.query("SELECT StaffID, Firstname, LastName, role FROM esdc_final.staff where username = ?;", [decode.username], (error, result) => {
                if (error) throw error
                var Name = result[0].Firstname + " " + result[0].LastName
                console.log(Name);
                response.json({
                    loggedIn: 'true',
                    staffId: result[0].StaffID,
                    name: Name,
                    Role: result[0].role
                })
            })
        }
    } catch (error) {
        if (error) throw error
    }
})


router.get('/logout', (req, res, next) => {
    res.clearCookie("staffRegisterd");
    res.redirect("/manage");
})

router.route("/action",).post(upload.array('photos', 20), function (request, response, next) {
    var action = request.body.action;
    console.log(action)
    if (action == "fetch") {
        var query = "select p.ProductID as id, p.Name as name, p.Price as price, sum(Amount) as amount from esdc_final.product p inner join esdc_final.property prop on p.ProductID = prop.ProductID where p.Deleted=0 group by p.ProductID order by p.ProductID desc"
        database.query(query, function (error, data) {
            response.json({
                data: data
            });

        });
    }

    if (action == "Add") {
        console.log(request.body)
        var fs = request.files

        var name = request.body.name;
        var price = Number(request.body.price);
        var description = request.body.description;
        var type = request.body.type;

        var query = `insert into esdc_final.Product (Name, Description, Type, Price) values ("${name}", "${description}", "${type}", ${price});`;

        var color = request.body.color;
        var colorpicker = request.body.colorpicker;
        var sizeS = request.body.sizeS;
        var sizeM = request.body.sizeM;
        var sizeL = request.body.sizeL;

        if (typeof color === 'string') {
            query += `insert into esdc_final.Property (Color, Colorpicker, Size, Amount, ProductID) values ("${color}", "${colorpicker}", "S", ${sizeS}, (select max(ProductID) as proID from esdc_final.Product)) ;`;
            query += `insert into esdc_final.Property (Color, Colorpicker, Size, Amount, ProductID) values ("${color}", "${colorpicker}", "M", ${sizeM}, (select max(ProductID) as proID from esdc_final.Product)) ;`;
            query += `insert into esdc_final.Property (Color, Colorpicker, Size, Amount, ProductID) values ("${color}", "${colorpicker}", "L", ${sizeL}, (select max(ProductID) as proID from esdc_final.Product)) ;`;

        } else {
            for (var i = 0; i < color.length; i++) {
                query += `insert into esdc_final.Property (Color, Colorpicker, Size, Amount, ProductID) values ("${color[i]}", "${colorpicker[i]}", "S", ${sizeS[i]}, (select max(ProductID) as proID from esdc_final.Product)) ;`;
                query += `insert into esdc_final.Property (Color, Colorpicker, Size, Amount, ProductID) values ("${color[i]}", "${colorpicker[i]}", "M", ${sizeM[i]}, (select max(ProductID) as proID from esdc_final.Product)) ;`;
                query += `insert into esdc_final.Property (Color, Colorpicker, Size, Amount, ProductID) values ("${color[i]}", "${colorpicker[i]}", "L", ${sizeL[i]}, (select max(ProductID) as proID from esdc_final.Product)) ;`;
            }
        }

        for (var i = 0; i < fs.length; i++) {
            console.log(fs[i].filename);
            query += `insert into esdc_final.images (Path, ProductID) values ('${fs[i].filename}', (select max(ProductID) as proID from esdc_final.Product));`;
        }

        database.query(query, function (error, data) {
            response.json({
                message: 'Data Added'
            });
        });
    }

    if (action == 'delete') {
        var id = request.body.id;

        var query = ` update esdc_final.product set Deleted = true where ProductID = ${id}; update esdc_final.property set Deleted = true where ProductID = ${id}; update esdc_final.images set Deleted = true where ProductID = ${id};`;

        database.query(query, function (error, data) {

            response.json({
                message: 'Data was deleted at id = ' + id
            });
        });
    }

    if (action == 'removeall') {
        var query = `update esdc_final.product set Deleted = true; update esdc_final.property set Deleted = true; update esdc_final.images set Deleted = true;`;

        database.query(query, function (error, data) {
            response.json({
                message: 'Data was remove all'
            });
        });
    }
})

router.post('/login', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    database.query('SELECT * FROM esdc_final.useraccount where UserName = ?;', [username], async (error, result) => {
        if (error) throw error;
        console.log(result)
        if (!result.length || !await bcrypt.compare(password, result[0].password) || result[0].Role < 1) {
            console.log("Wrong password");
            res.json({
                status: "error",
                message: "Incorrect username or Password!"
            })
        } else {
            const token = jwt.sign({ username: username }, 'thi*sis@jwt%secret0f-website', {
                expiresIn: '90d'
            })
            const cookieOptions = {
                expiresIn: new Date(Date.now() + 90 + 24 + 60 + 60 + 1000),
                httpOnly: true
            }
            res.cookie("staffRegisterd", token, cookieOptions);
            res.json({
                status: "success",
                message: "Loggin Success"
            })
        }
    })

})

router.post('/addstaff', async (req, res, next) => {
    var username = req.body.idcard
    var Npassword = req.body.lastname + req.body.idcard


    const password = await bcrypt.hash(Npassword, 8);

    database.query("SELECT username FROM esdc_final.useraccount WHERE username = ?", [username], async (error, results) => {
        if (error) throw error;
        if (results[0]) {
            res.json({
                status: 'error',
                message: "Nhân viên đã được thêm trước đó!"
            });
        } else {
            database.query("insert into esdc_final.useraccount values(?, ?, NOW(), true)", [username, password], (error, result) => {
                if (error) throw error
                database.query("insert into esdc_final.staff (FirstName, LastName, Sex, Phone, Address, Username, Role, Deleted, DateOfBirth, IDCartNumber, Email) values(?, ?, ?, ?, ?, ?, ?, false, ?, ?, ?)",
                    [req.body.firstname, req.body.lastname, req.body.sex, req.body.phone, req.body.address, username, req.body.role, req.body.dayofbirth, req.body.idcard, req.body.email],
                    (error, result) => {
                        if (error) throw error
                        res.json({
                            status: 'success',
                            username: username,
                            password: Npassword
                        })
                    })

            })
        }
    })


})


module.exports = router