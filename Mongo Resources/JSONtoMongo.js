'use strict';
/* 
  Import needed modules/files
 */
var fs = require('fs'),
    mongoose = require('mongoose'), 
    Schema = mongoose.Schema, 
    Package = require('./CustomerSchema.js'),
	customers = require('./generated_shipment_data.json'),	
    config = require('../config/env/development.js');
	
/* Connect to the database */
mongoose.connect(config.db.uri);

for(var i=0;i<customers.length;i++){
	var dataFromPackages= new Package({
		_id: customers[i]._id,
		index: customers[i].index,
		isActive: customers[i].isActive,
		logo: customers[i].logo,
		age: customers[i].age,
		name: customers[i].name,
		email: customers[i].email,
		phone: customers[i].phone,
		address: customers[i].address,
		about: customers[i].about,
		registered: customers[i].registered,
		orders: customers[i].orders
	})
	dataFromPackages.save(function(err){
		if(err) throw err;
	});
}
console.log("Finished");