/* 
  Import modules/files
 */
var mongoose = require('mongoose'), 
    Schema = mongoose.Schema, 
	Package = require('./CustomerSchema.js'),
	
    config = require('../config/env/development.js');

/* Connect to database */
mongoose.connect(config.db.uri);


var findCustomer = function() {
				Package.find({name: 'Zenolux'}, function(err, customer){
					if (err) throw err;
					console.log(customer);
				});
			};
			findCustomer();
			
findCustomer();

