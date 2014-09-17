var assert = require('assert');
var express = require('express');
global.mongoose = require('mongoose');
var supertest = require('supertest');
var _ = require('underscore');
var bodyParser = require('body-parser');

require('./TestModel');

//var Developer = require('./coverage/instrument/src/index')(mongoose);
var Developer = require('../src/index')(mongoose);

var developer = new Developer({});
var develop = router.developer.bind(developer);

var test = mongoose.model('Test')({embeddedTests: [{}]});

debugger

var createData = function(req, res, next){
	req.data = {};
	_(req.data).extend(req.body);
	_(req.data).extend({paginate: {}});

	next();
};

describe('Testing the mongoose develop module.', function () {
	'use strict';

	before(function (done) {
		mongoose.connect('mongodb://localhost:27017/sgs_develop', function(err){
			if(err){
				return done(err);
			}
			mongoose.connection.db.dropDatabase(done);
		});
	});

	it('POST /api/<collection>', function(done){
		app.post('/api/tests', createData, route, function(req, res){
			assert(res.data instanceof mongoose.Document);
			assert.equal(res.data.attr, req.data.attr);
			testId = res.data.id;
			mongoose.model('Test').count({}, function(err, count){
				if(err){
					done(err);
				}
				assert.equal(count, 1);
				done();
			});
		});

		st.post('/api/tests').send({hey: 'test'}).end();
	});
		

});
