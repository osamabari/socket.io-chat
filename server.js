(function () {
	'use strict';

	var http        = require('http');
	var Chat        = require('./index');
	var statics     = require('node-static');
	var db          = require('./lib/db');
	var mongodb     = require('mongodb');
	var MongoClient = mongodb.MongoClient;

	var file = new statics.Server('./public');

	var server = http.createServer(function (req, res) {
		req.addListener('end', function () {
			file.serve(req, res);
		}).resume();
	});

	MongoClient.connect('mongodb://127.0.0.1/test', function (error, dbConnect) {
		server.listen(3000, '127.0.0.1');

		Chat.setConnect(dbConnect);

		var chatClient = new Chat.Client(server);

		chatClient.on('authenticate', function (socket, data, next) {
			db.getConnect(function (connect) {
				console.log({
					username: String(data.username),
					password: String(data.password)
				});

				connect.collection('users').findOne({
					username: String(data.username),
					password: String(data.password)
				}, function (error, result) {
					if (result) {
						socket.auth = true;
						socket.user = result._id;
						next();
					} else {
						next(new Error('invalid credentials'));
					}
				});
			});
		});

		chatClient.on('error', function (socket, event, error) {
			console.log('client error', event, error);
			console.log('client error', event, error.stack);
			//socket.emit('error');
		});

		chatClient.on('beforeCreateChat', function (socket, chatModel) {
			chatModel.setCreator(socket.user);
		});

		chatClient.validate('addMember', function (socket, data, next) {
			console.log('add member validate');
			next();
		});

		chatClient.validate('createChat', function (socket, data, next) {
			console.log('add member validate');
			next();
		});

		chatClient.validate('createChat', function (socket, data, next) {
			console.log('add member validate 2');
			next();
		});

		chatClient.validate('createChat', function (socket, data, next) {
			console.log('add member validate 3');
			next();
		});
	});



}());