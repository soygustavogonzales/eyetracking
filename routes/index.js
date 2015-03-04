var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/samples/:sample',function(req,res,next){
	var sample = req.params.sample
	res.render('examples/'+sample)
});

module.exports = router;
