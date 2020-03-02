const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

var User = require('../models/users');
var passport = require('passport');
var authenticate = require('../authenticate');

const userRouter = express.Router();
userRouter.use(bodyParser.json());

/* GET users listing. */
userRouter.route('/')
	.get(authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req,res,next) => {
		User.find({})
		.then((users) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(users);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	});

userRouter.post('/signup', (req, res, next) => {
	User.register(new User( {username: req.body.username}), 
      req.body.password, (err,user) => {
   		if(err) {
      		res.statusCode = 500;
    		res.setHeader('Content-Type', 'application/json');
			res.json({err: err});
    	}
    	else{
      		passport.authenticate('local')(req, res, () => {
    		  res.statusCode = 200;
    		  res.setHeader('Content-Type', 'application/json');
    		  res.json({status: 'Registration Successful!', user: user});
			});
		}
	  });
});

userRouter.post('/login', passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({_id: req.user._id});

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, administrator: req.user.admin?'yes':'no', token: token, status: 'You are successfully logged in!'});
});

userRouter.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.send("You are successfully logged out.");
    //res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = userRouter;
