var express = require('express');
const multer = require('multer');

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
        title: 'Quản lý mặt hàng',
        file: 'listproducts'
    });
});




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

module.exports = router;