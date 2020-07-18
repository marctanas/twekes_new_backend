// Import mongoose
const mongoose = require('mongoose');

// creating the Schema for what kind of collection will be saved in the DB
// class contructor
const MerchantsSchema = new mongoose.Schema(
    {
        brandName: {
            type: String,
            required: true
        },
        discountCode: {
            type: String,
            required: true
        },
    }
);

//model out of the schema
const MerchantsModel = mongoose.model('merchants', MerchantsSchema);

//to export to MongoDB
module.exports = MerchantsModel;