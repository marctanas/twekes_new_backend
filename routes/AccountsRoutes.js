// Import express into the file
const express = require('express');
const bcrypt = require('bcrypt');

//invoke the router()
const router = express.Router();

const jwt = require('jsonwebtoken');

require('dotenv').config()
const secret = process.env.SECRET;

// import the AccountsModel
const AccountsModel = require('../models/AccountsModel');
const { findOne } = require('../models/AccountsModel');


// A GET route for fetching data from the 'accounts' collection
router.get(
    '/profile',
    (req, res)=>{

 
        // Fetch all the documetns using .find()
        AccountsModel.findOne({_id: req.user._id})

        //Once the results are ready, use .json() to send the results
        .then(
            (user) => {
                res.json({accounts: user})
            }
        )
        .catch(
            (e) => {
                console.log('error eccured', e)
            }
        )

    }
);


// POST route to update user
router.post(
    '/update',
    (req, res) => {
        const userData = {
            avatar: req.body.avatar,
            fullName: req.body.fullName,
            password: req.body.password,
            _id: req.user._id
        };
        
        AccountsModel.findOne(
            { _id: userData._id }
            ).then((user) =>{

            if(userData.avatar !== ""){
                user.avatar = userData.avatar
            }

            if(userData.fullName !== ""){
                user.fullName = userData.fullName
            }

            if(userData.password !== ""){
                bcrypt.genSalt(
                    (err, salt) => {
        
                        // Step 2) Generate a hash encrypted password
                        bcrypt.hash(
                            userData.password,  
                            salt,
                            async(err, hashedPassword) => {
                                
                                // Step 3) Replace the original password with hash encrypted password
                                user.password = hashedPassword;
                                await user.save();
                            }
                        )
                    }
                );
            }
            user.save()
            res.json({message: 'User data has been updated'})
            
        })
    }
);

// Export the router
module.exports = router;
