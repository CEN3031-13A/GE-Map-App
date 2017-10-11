/* Import mongoose */
var mongoose = require('mongoose'), 
    Schema = mongoose.Schema;

/* Create schema format */
var customerSchema = new Schema({
	_id: {type: String, required: true, unique:true},
	index: Number,
	isActive: Boolean,
	logo: String,
	age: Number,
	name: String,
	email: String,
	phone: String,
	address: String,
	about: String,
	registered: String,
	orders: [{
		id: String,
		index: Number,
		shipments: [{
			id: String,
			tracking_number: String,
			carrier: String,
			origin: {
				latitude: Number,
				longitude: Number
			},
			destination: {
				latitude: Number,
				longitude: Number
			},
			current_location: {
				latitude: Number,
				longitude: Number
			},
			ship_date: String,
			expected_date: String,
			contents:[String],
		}],
	}]
	
});

/* 'pre' function that adds the updated_at (and created_at if not already there) property */
customerSchema.pre('save', function(next) {
	var currentDate = new Date();
	this.updated_at = currentDate;
	if (!this.created_at){
		this.created_at = currentDate;
	}
	next();
});

/* Use your schema to instantiate a Mongoose model */
var Customer = mongoose.model('Customer', customerSchema);

/* Export the model to make it avaiable to other parts of your Node application */
module.exports = Customer;
