const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Leaders = require('../models/leaders');

const leadRouter = express.Router();

leadRouter.use(bodyParser.json());

leadRouter.route('/')
	.get((req,res,next) => {
		Leaders.find({})
		.then((leaders) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(leaders);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.post((req, res, next) => {
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
	.put((req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /leaders');
	})
	.delete((req, res, next) => {
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
	.get((req,res,next) => {
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
	.post((req, res, next) => {
	  	res.statusCode = 403;
	  	res.end('POST operation not supported on /leaders/'+ req.params.leaderID);
	})
	.put((req, res, next) => {
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
	.delete((req, res, next) => {
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


leadRouter.route('/:leaderID/comments/:commentId')
	.get((req,res,next) => {
		Leaders.findById(req.params.leaderID)
		.then((leader) => {
		    if (leader != null && leader.comments.id(req.params.commentId) != null) {
		        res.statusCode = 200;
		        res.setHeader('Content-Type', 'application/json');
		        res.json(leader.comments.id(req.params.commentId));
		    }
		    else if (leader == null) {
		        err = new Error('Leader ' + req.params.leaderID + ' not found');
		        err.status = 404;
		        return next(err);
		    }
		    else {
		        err = new Error('Comment ' + req.params.commentId + ' not found');
		        err.status = 404;
		        return next(err);            
		    }
		}, (err) => next(err))
		.catch((err) => next(err));
	})
	.post((req, res, next) => {
		res.statusCode = 403;
		res.end('POST operation not supported on /leaders/'+ req.params.leaderID
		    + '/comments/' + req.params.commentId);
	})
	.put((req, res, next) => {
		Leaders.findById(req.params.leaderID)
		.then((leader) => {
		    if (leader != null && leader.comments.id(req.params.commentId) != null) {
		        if (req.body.rating) {
		            leader.comments.id(req.params.commentId).rating = req.body.rating;
		        }
		        if (req.body.comment) {
		            leader.comments.id(req.params.commentId).comment = req.body.comment;                
		        }
		        leader.save()
		        .then((leader) => {
		            res.statusCode = 200;
		            res.setHeader('Content-Type', 'application/json');
		            res.json(leader);                
		        }, (err) => next(err));
		    }
		    else if (leader == null) {
		        err = new Error('Leader ' + req.params.leaderID + ' not found');
		        err.status = 404;
		        return next(err);
		    }
		    else {
		        err = new Error('Comment ' + req.params.commentId + ' not found');
		        err.status = 404;
		        return next(err);            
		    }
		}, (err) => next(err))
		.catch((err) => next(err));
	})
	.delete((req, res, next) => {
		Leaders.findById(req.params.leaderID)
		.then((leader) => {
		    if (leader != null && leader.comments.id(req.params.commentId) != null) {
		        leader.comments.id(req.params.commentId).remove();
		        leader.save()
		        .then((leader) => {
		            res.statusCode = 200;
		            res.setHeader('Content-Type', 'application/json');
		            res.json(leader);                
		        }, (err) => next(err));
		    }
		    else if (leader == null) {
		        err = new Error('Leader ' + req.params.leaderID + ' not found');
		        err.status = 404;
		        return next(err);
		    }
		    else {
		        err = new Error('Comment ' + req.params.commentId + ' not found');
		        err.status = 404;
		        return next(err);            
		    }
		}, (err) => next(err))
		.catch((err) => next(err));
	});

// --------------------------------------------------------------------------------------

//	export this module
module.exports = leadRouter;
