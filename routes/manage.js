var express = require('express');

var router = express.Router();

var database = require('../database');

router.get("/", function(request, response, next){

	response.render('manage', {
        title : 'Quản lý mặt hàng', 
        file: 'listproducts'
    });

});

router.post("/action", function(request, response, next) {
    
    var action = request.body.action;
    if(action == "fetch") {
        var query = "select p.ProductID as id, p.Name as name, p.Price as price, sum(Amount) as amount from esdc_final.product p inner join esdc_final.property prop on p.ProductID = prop.ProductID group by p.ProductID order by p.ProductID desc"
        database.query(query, function(error, data){
			console.log(data)
			response.json({
				data:data
			});

		});
    }

    if(action == "Add") {
        console.log(request.body)
        
    }
})

module.exports = router;