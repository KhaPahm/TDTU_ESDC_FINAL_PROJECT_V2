var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {file: ''});
});

router.get('/signup', function(req, res, next) {
  res.render('index', {file: 'signup'})
}); 

module.exports = router;
