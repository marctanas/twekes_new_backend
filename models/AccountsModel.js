// Import mongoose
const mongoose = require('mongoose');

// creating the Schema for what kind of collection will be saved in the DB
// class contructor
const UsersSchema = new mongoose.Schema(
    {
        avatar: {
            type: String
        },
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }
);

//model out of the schema
const AccountsModel = mongoose.model('accounts', UsersSchema);

//to export to MongoDB
module.exports = AccountsModel;