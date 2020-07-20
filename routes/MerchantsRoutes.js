// Import express into the file
const express = require('express');
// invoke the router()
const router = express.Router();
// import the ProductsModel
const MerchantsModel = require('../models/MerchantsModel');


// A POST route for saving data into the 'products' collection
router.post(
    '/',   // http://localhost:8080/merchants
    (req, res) => {

        // read the merchant data
        const merchantData = {
            brandName: req.body.brandName,
            discountCode: req.body.discountCode,
        };

        console.log(
            'From the merchant', merchantData
        );

        // Save the data to database (merchant collection)
        const newMerchantModel = new MerchantsModel(merchantData);
        newMerchantModel.save(
            (err, dbResult) => {

                // if something goes wrong, send error
                if(err){
                    res.json(err)
                }
                // Otherwise, send success message
                else{
                    res.json({message: 'Merchant has been saved'});
                }
            }
        );
    }
    
);

// A GET route for fetching data from the 'merchants' collection
router.get(
    '/',
    (req, res)=>{

        // Fetch all the documetns using .find()
        MerchantsModel.find()

        //Once the results are ready, use .json() to send the results
        .then(
            (results) => {
                res.json({merchants: results})
            }
        )
        .catch(
            (e) => {
                console.log('error eccured', e)
            }
        )

    }
);

//POST route to update merchant
router.post(
    '/update',
    (req,res) => {
        const merchantData = {
            brandName: req.body.brandName,
            discountCode: req.body.discountCode,
            _id: req.body._id
        };

        MerchantsModel.findOne(
            { _id: merchantData._id } 
        ).then((merchant) => {

            if (merchantData.brandName !== ""){
                merchant.brandName = merchantData.brandName
            }

            if (merchantData.discountCode !== ""){
                merchant.discountCode = merchantData.discountCode
            }
            merchant.save()
            res.json({message: 'Merchant details have been updated'})
        })
    }
)

// Export the router
module.exports = router;
