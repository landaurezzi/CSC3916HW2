/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(status, message, req) {
    //json object with attributes (status, meessage, headers, key)
    var json = {
        status: status,
        message: message,
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'Successfully created new user.'})
    }
});

router.post('/signin', function (req, res) {
    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json ({success: true, token: 'JWT ' + token});
        }
        else {
            res.status(401).send({success: false, msg: 'Authentication failed.'});
        }
    }
});

    router.route('/movies')
    //unauthenticated
    .get(function(req, res) {
        console.log(req.body);
        //status 200 and message
        res = res.status(200);
        //header and string from request
        var o = getJSONObjectForMovieRequirement(res.status, 'GET movies', req);
        //pass object from method
        res.json(o);
    }
    )

    //unathenticated
    .post(function(req, res) {
        console.log(req.body);
        //status 200 and message
        res = res.status(200);
        //header and string from request
        var o = getJSONObjectForMovieRequirement(res.status, 'movie saved', req);
        //pass object from method
        res.json(o);
    }
    )

    //authenticated
    .put(authJwtController.isAuthenticated, function(req, res) {
        console.log(req.body);
        //status 200 and message
        res = res.status(200);
        //header and string from request
        var o = getJSONObjectForMovieRequirement(res.status, 'movie updated', req);

        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        res.json(o);
    }
    )

    //authenticated
    .delete(authController.isAuthenticated, function(req, res) {
        console.log(req.body);
        //status 200 and message
        res = res.status(200);
        //header and string from request
        var o = getJSONObjectForMovieRequirement(res.status, 'movie deleted', req);

        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        res.json(o);
    }
    )
    
    //all other methods should return error
    /*
    .patch
    */
    ;

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


