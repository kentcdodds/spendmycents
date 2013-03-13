
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
  	title: 'Spend My Cents!',
  	desc: 'Under development. Please check back soon!'
  });
};
