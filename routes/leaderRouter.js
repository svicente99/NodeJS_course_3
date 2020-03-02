const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Leaders = require('../models/leaders');

const leadRouter = express.Router();

leadRouter.use(bodyParser.json());

leadRouter.route('/')
	.get(authenticate.verifyOrdinaryUser, (req,res,next) => {
		Leaders.find({})
		.then((leaders) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(leaders);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.post(authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, function(req, res, next) {
		Leaders.create(req.body)
		.then((leader) => {
			console.log("Leader created: ", leader);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(leader);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.put(authenticate.verifyOrdinaryUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /leaders');
	})
	.delete(authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
		Leaders.remove({})
		.then((resp) => {
			console.log("Leaders removed");
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(resp);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})


// ---------------------------------------------------

leadRouter.route('/:leaderID')
	.get(authenticate.verifyOrdinaryUser, (req,res,next) => {
		Leaders.findById(req.params.leaderID)
		.then((leader) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(leader);
			console.log('Will send details of the leader: ' + req.params.leaderID);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.post(authenticate.verifyOrdinaryUser, (req, res, next) => {
	  	res.statusCode = 403;
	  	res.end('POST operation not supported on /leaders/'+ req.params.leaderID);
	})
	.put(authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
		Leaders.findByIdAndUpdate(req.params.leaderID, {
			$set: req.body
		}, { new: true })
		.then((leader) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(leader);
	  		console.log('Updating the leader: ' + req.params.leaderID + '\n');
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.delete(authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
		Leaders.findByIdAndRemove(req.params.leaderID)
		.then((resp) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(resp);
			console.log('Deleting leader: ' + req.params.leaderID);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})

// --------------------------------------------------------------------------------------

//	export this module
module.exports = leadRouter;
