// Importing express inside your server
const express = require ('express');
const bcrypt = require('bcrypt');

// Import mongoose insider server
const mongoose = require('mongoose');

//Import body-parser
const bodyParser = require('body-parser');

// Import dotenv
require('dotenv').config()

// Import passport
const passport = require('passport');
// Import the strategies & way to extract the jsonwebtoken
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

//Import cors
const cors = require('cors');

const jwt = require('jsonwebtoken');

// The same secret in routes/AccountsRoutes will be needed to read the jsonwebtoken
const secret = process.env.SECRET;

// We need the AccountsModel to find the user in the database
const AccountsModel = require('./models/AccountsModel');

// Options for passport-jwt
const passportJwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret
};

// This function is what will read the contents (payload) of the jsonwebtoken
const passportJwt = (passport) => {
    passport.use(
        new JwtStrategy(
            passportJwtOptions,
            (jwtPayload, done) => {

                // Extract and find the user by their id (contained jwt)
                AccountsModel.findOne({ _id: jwtPayload.id})
                .then(
                    // If the document was found
                    (document) => {
                        return done(null, document)
                    }
                )
                .catch(
                    // If something went wrong with database search
                    (err) => {
                        return done(null, null);
                    }
                )
            }
        )
    )
};

// Import routes
const MerchantsRoutes = require('./routes/MerchantsRoutes');
const AccountsRoutes = require('./routes/AccountsRoutes');

// Create the server object
const server = express();

// Configure express to use body-parser
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(passport.initialize());
server.use(cors());

// Invoke passportJwt and pass the passport package as argument
passportJwt(passport);


//Enter database connection URL from mongoDB
const dbURL = process.env.DB_URL;

mongoose.connect(
    dbURL,
    {
        'useNewUrlParser': true,
        'useUnifiedTopology': true
    }

).then(
    ()=>{
        console.log('You are connected to MongoDB');
    }
).catch(
    (e)=>{
        console.log('catch', e);
    }
);

// /register
// A POST route for saving data into the 'users' collection
server.post(
    '/accounts/register',    //http://localhost:8080/accounts/register
    (req, res) => {

        // capture the user data coming from the client (e.g browser, postman)
        const userData = {
            avatar: req.body.avatar,
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password
        };


        // Step 1) Generate a salt
        bcrypt.genSalt(
            (err, salt) => {

                // Step 2) Generate a hash encrypted password
                bcrypt.hash(
                    userData.password,  // first ingredient
                    salt,  //second ingredient
                    (err, hashedPassword) => {

                        // Save the data to database (users collection)
                        const newAccountModel = new AccountsModel(userData);
                        
                        // Step 3) Replace the original password with hash encrypted password
                        newAccountModel.password = hashedPassword;

                        // Step 4) Save user data to database (with encryption password)
                        newAccountModel.save(
                            (err, dbResult) => {
                
                                // if something goes wrong, send error
                                if(err){
                                    res.json({message: err})
                                }
                                
                                // Otherwise, send success message
                                else{
                                    res.json({message: 'User has been saved'});
                                }
                            }
                        );
                    }
                )
            }
        );


        console.log(
            'From the user', userData
        );

    }
    
);


// /login
server.post(
    '/accounts/login',
    (req,res) => {
        
        // Step 1. Capture userData (email & password)
        const userData = {
            email: req.body.email,
            password: req.body.password
        }

        // Step 2a. In database, Find account that matches email
        AccountsModel.findOne(
            {email: userData.email},
            (err, document) => {
                

                //Step 2b. If email does not match, reject the login request
                if(!document){
                    res.json({message: "Please check your email or password"})
                }

                // Step 3. If there is matching email, examine the document( the userData - password)
                else {

                    // Step 4. Compare the encrypted password in database with incoming password
                    bcrypt.compare(userData.password, document.password)
                    .then(
                        (isMatch) => {

                            // Step 5a. If the password matches, generate web token (JWT - json web token)
                            if(isMatch){
                                // Step 6. Send the JWT to the client (postman, browser)
                                const payload = {
                                    id: document.id,
                                    email: document.email
                                };

                                jwt.sign(
                                    payload,
                                    secret,
                                    (err, jsonwebtoken) => {
                                        res.json(
                                            {
                                                message: 'Login successful',
                                                jsonwebtoken: jsonwebtoken
                                            }
                                        )
                                    }
                                )
                            }

                            //Step 5b. If password does not match, reject login request
                            else {
                                res.json({message:"Please check your email or password"})
                            }
                        }
                    )
                }
            }
        )
        
    }
);

// link our MerchantsRoutes
server.use(
    '/merchants', // http://localhost:8080/merchants
    passport.authenticate('jwt', {session:false}),   //authenticate user in order to proceed to merchants - use passport-jwt
    MerchantsRoutes
);


// link our AccountsRoutes
server.use(
    '/accounts/', // http://localhost:8080/accounts
    passport.authenticate('jwt', {session:false}),   //authenticate user in order to proceed to merchants - use passport-jwt
    AccountsRoutes
);

// Create a route for the landing page
server.get(
    '/',
    (req, res)=>{
        res.send(
            "<h1> Welcome to somewebsite.com</h1>" +
            "<a href='/about'>About</a>" + " " +
            "<a href='/contact'>Contact</a>" + " " +
            "<a href='/products'>Products</a>"
        );
    }
);

// Create a route for the 404 page
server.get(
    '*',
    (req, res)=>{
        res.send(
            "<h1> 404! Page not Found</h1>"
            );
    }
);

// Connect to port (range 3000 - 9999)
// http://127.0.0.1:8080 (aka http://localhost:8080)  this is on local machine
server.listen( 
    process.env.PORT || 8080, ()=>{
        console.log('You are connected to Localhost http://127.0.0.1:8080');
    }
)