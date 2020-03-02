const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authenticate = require('../authenticate');
const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

function verifyIsOwnUser(commentUser) {
	return( authenticate.getUsername()==commentUser);
}

function add_username(jsonBody) {
	// https://stackoverflow.com/questions/14528385/how-to-convert-json-object-to-javascript-array
	var arr = Object.keys(jsonBody).map((key) => [key, jsonBody[key]]);

	// first I insert current username in a temporary array
	arr[arr.length] = new Array("username", authenticate.getUsername());

	// create a dictionary obj to represent body with current username inserted
	// https://pietschsoft.com/post/2015/09/05/javascript-basics-how-to-create-a-dictionary-with-keyvalue-pairs
	var dictBody = new Object();
	arr.forEach( (prop,index) => {
///		console.log(arr[index][0]+":'"+arr[index][1]+"'");	// use to debug
		dictBody[ arr[index][0] ] = arr[index][1];
	});
	console.log(dictBody);
	return dictBody;
}

// ----routes without id------------------------------------------------------------------

dishRouter.route('/')
	.get(authenticate.verifyOrdinaryUser, (req,res,next) => {
		Dishes.find({})
		.then((dishes) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dishes);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.post(authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
		Dishes.create(req.body)
		.then((dish) => {
			console.log("Dish created: ", dish);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dish);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.put(authenticate.verifyOrdinaryUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /dishes');
	})
	.delete(authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
		Dishes.remove({})
		.then((resp) => {
			console.log("Dishes removed");
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(resp);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})


// ---routes with id------------------------------------------------------------------

dishRouter.route('/:dishId')
	.get(authenticate.verifyOrdinaryUser, (req,res,next) => {
		Dishes.findById(req.params.dishId)
		.then((dish) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dish);
			console.log('Will send details of the dish: ' + req.params.dishId);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.post(authenticate.verifyOrdinaryUser, (req, res, next) => {
	  	res.statusCode = 403;
	  	res.end('POST operation not supported on /dishes/'+ req.params.dishId);
	})
	.put(authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
		Dishes.findByIdAndUpdate(req.params.dishId, {
			$set: req.body
		}, { new: true })
		.then((dish) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dish);
	  		console.log('Updating the dish: ' + req.params.dishId + '\n');
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.delete(authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
		Dishes.findByIdAndRemove(req.params.dishId)
		.then((resp) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(resp);
			console.log('Deleting dish: ' + req.params.dishId);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})

// ---comments------------------------------------------------------

dishRouter.route('/:dishId/comments')
	.get(authenticate.verifyOrdinaryUser, (req,res,next) => {
		Dishes.findById(req.params.dishId)
		.then((dish) => {
		    if (dish != null) {
		        res.statusCode = 200;
		        res.setHeader('Content-Type', 'application/json');
		        res.json(dish.comments);
		    }
		    else {
		        err = new Error('Dish ' + req.params.dishId + ' not found');
		        err.status = 404;
		        return next(err);
		    }
		}, (err) => next(err))
		.catch((err) => next(err));
	})
	.post(authenticate.verifyOrdinaryUser, (req, res, next) => {
		Dishes.findById(req.params.dishId)
		.then((dish) => {
		    if (dish != null) {
				// to associate the username to its comment 
				// (and later, to restrict modifications)
				var reqBodyModified = add_username(req.body);

				dish.comments.push(reqBodyModified);
		        dish.save()
		        .then((dish) => {
		            res.statusCode = 200;
		            res.setHeader('Content-Type', 'application/json');
		            res.json(dish);                
		        }, (err) => next(err));
		    }
		    else {
		        err = new Error('Dish ' + req.params.dishId + ' not found');
		        err.status = 404;
		        return next(err);
		    }
		}, (err) => next(err))
		.catch((err) => next(err));
	})
	.put(authenticate.verifyOrdinaryUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /dishes/'+ req.params.dishId + '/comments');
	})
	.delete(authenticate.verifyOrdinaryUser, (req, res, next) => {
		Dishes.findById(req.params.dishId)
		.then((dish) => {
		    if (dish != null) {
		        for (var i = (dish.comments.length -1); i >= 0; i--) {
					const idComment = dish.comments[i]._id; 
					const commentUserOwner = dish.comments.id(idComment).username;
					// only your own comments are allowed to be deleted
					if (verifyIsOwnUser(commentUserOwner)) {
						dish.comments.id(idComment).remove();
					}
		        }
		        dish.save()
		        .then((dish) => {
		            res.statusCode = 200;
		            res.setHeader('Content-Type', 'application/json');
		            res.json(dish);                
		        }, (err) => next(err));
		    }
		    else {
		        err = new Error('Dish ' + req.params.dishId + ' not found');
		        err.status = 404;
		        return next(err);
		    }
		}, (err) => next(err))
		.catch((err) => next(err));    
	});

// ---comments with id------------------------------------------------------

dishRouter.route('/:dishId/comments/:commentId')
	.get(authenticate.verifyOrdinaryUser, (req,res,next) => {
		Dishes.findById(req.params.dishId)
		.then((dish) => {
		    if (dish != null && dish.comments.id(req.params.commentId) != null) {
		        res.statusCode = 200;
		        res.setHeader('Content-Type', 'application/json');
		        res.json(dish.comments.id(req.params.commentId));
		    }
		    else if (dish == null) {
		        err = new Error('Dish ' + req.params.dishId + ' not found');
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
	.post(authenticate.verifyOrdinaryUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('POST operation not supported on /dishes/'+ req.params.dishId
		    + '/comments/' + req.params.commentId);
	})
	.put(authenticate.verifyOrdinaryUser, (req, res, next) => {
		Dishes.findById(req.params.dishId)
		.then((dish) => {
		    if (dish != null && dish.comments.id(req.params.commentId) != null) {
				var commentUser = dish.comments.id(req.params.commentId).username;
				if (verifyIsOwnUser(commentUser)) {
					if (req.body.rating) {
						dish.comments.id(req.params.commentId).rating = req.body.rating;
					}
					if (req.body.author) {
						dish.comments.id(req.params.commentId).author = req.body.author;                
					}
					if (req.body.comment) {
						dish.comments.id(req.params.commentId).comment = req.body.comment;                
					}
					dish.save()
					.then((dish) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(dish);                
					}, (err) => next(err));
				}
				else{
					err = new Error("Your username |" + authenticate.getUsername() + "| isn't authorized to edit this comment");
					err.status = 403;
					return next(err);
				}
		    }
		    else if (dish == null) {
		        err = new Error('Dish ' + req.params.dishId + ' not found');
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
	.delete(authenticate.verifyOrdinaryUser, (req, res, next) => {
		Dishes.findById(req.params.dishId)
		.then((dish) => {
		    if (dish != null && dish.comments.id(req.params.commentId) != null) {
				var commentUser = dish.comments.id(req.params.commentId).username;

				if (verifyIsOwnUser(commentUser)) {
					dish.comments.id(req.params.commentId).remove();
					dish.save()
					.then((dish) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(dish);                
					}, (err) => next(err));
				}
				else{
					err = new Error("Your username |" + authenticate.getUsername() + "| isn't authorized to delete this comment");
					err.status = 403;
					return next(err);
				}
		    }
		    else if (dish == null) {
		        err = new Error('Dish ' + req.params.dishId + ' not found');
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

//	export this module
module.exports = dishRouter;
