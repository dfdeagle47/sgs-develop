var assert = require('assert');
global.mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');

require('sgs-mongoose-additions')(mongoose);

require('./TestModel');
require('./UserModel');

//var Developer = require('./coverage/instrument/src/index')(mongoose);
var Developer = require('../src/index')(mongoose);

var developer = new Developer({});
var develop = developer.develop.bind(developer);


var test = mongoose.model('Test')({
	attr1: 'attr1',
	attr2: {
		attr3: 'attr3'
	},
	embeddedTests: [{
		embeddedAttr: 'embeddedAttr'
	}]
});

debugger


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

	before(function (done) {
		async.times(10, function(n, next){
			mongoose.model('Test').create({
				attr1: 'attr1',
				attr2: {
					attr3: 'attr3'
				},
				embeddedTests: [{
					embeddedAttr: 'embeddedAttr'
				}]
			}, next);
		}, done);
	});

	before(function (done) {
		mongoose.model('Test').findOne(function(err, test){
			if(err){
				return done(err);
			}
			mongoose.model('User').create({
				attr: 'userattr',
				test: test._id
			}, done);
		});
	});

	var assertTestLight = function(doc){
		assert(!(doc instanceof mongoose.Document));
		var keys = _(doc).keys();
		assert.equal(keys.length, 3);
		assert(_(keys).contains('attr1'));
		assert(_(keys).contains('attr2.attr3'));
	};

	var assertTestDetailed = function(doc){
		assert(!(doc instanceof mongoose.Document));
		var keys = _(doc).keys();
		assert.equal(keys.length, 6);
		assert(_(keys).contains('attr1'));
		assert(_(keys).contains('attr2.attr3'));
		assert(_(keys).contains('embeddedTests'));
		assert(_(keys).contains('virtualInstanceAttr'));
		assert(_(keys).contains('virtualStringAttr'));
		assertTestLight(doc.virtualInstanceAttr);
	};

	var assertTestDetailedEmbCust = function(doc){
		assert(!(doc instanceof mongoose.Document));
		var keys = _(doc).keys();
		assert(_(keys).contains('embeddedTests'));
		doc.embeddedTests.forEach(function(embeddedTest){
			assertEmbeddedTestCust(embeddedTest);
		});
	};

	var assertUserDetailed_TestDetailed = function(doc){
		assert(!(doc instanceof mongoose.Document));
		var keys = _(doc).keys();
		assert(_(keys).contains('attr'));
		assert(_(keys).contains('test'));
		assert.equal(keys.length, 2);
		assertTestDetailed(doc.test);
	};

	var assertEmbeddedTestDetailed = function(doc){
		assert(!(doc instanceof mongoose.Document));
		var keys = _(doc).keys();
		assert.equal(keys.length, 2);
		assert(_(keys).contains('embeddedAttr'));
		assert(_(keys).contains('virtualAttr'));
	};

	var assertEmbeddedTestCust = function(doc){
		assert(!(doc instanceof mongoose.Document));
		var keys = _(doc).keys();
		assert.equal(keys.length, 1);
		assert(_(keys).contains('virtualAttr'));
	};

	it('single document light', function(done){
		mongoose.model('Test').findOne({}, function(err, test){
			var res = {data: test};
			develop({scope: 'light'})({}, res, function(err){
				if(err){
					return done(err);
				}
				assertTestLight(res.data);
				done();
			});
		});
	});

	it('single document detailed', function(done){
		mongoose.model('Test').findOne({}, function(err, test){
			var res = {data: test};
			develop({scope: 'detailed'})({}, res, function(err){
				if(err){
					return done(err);
				}
				assertTestDetailed(res.data);
				done();
			});
		});
	});

	it('single document detailed single child detailed', function(done){
		mongoose.model('User').findOne({}, function(err, user){
			var res = {data: user};
			develop({scope: 'detailed_testdetailed'})({}, res, function(err){
				if(err){
					return done(err);
				}
				assertUserDetailed_TestDetailed(res.data);
				done();
			});
		});
	});

	it('single document detailed single child parent custom spec', function(done){
		mongoose.model('Test').findOne({}, function(err, test){
			var res = {data: test};
			develop({scope: 'detailed_embcust'})({}, res, function(err){
				if(err){
					return done(err);
				}
				assertTestDetailedEmbCust(res.data);
				done();
			});
		});
	});

	it('documentArray * documents detailed', function(done){
		mongoose.model('Test').findOne({}, function(err, test){
			if(err){
				return done(err);
			}
			test.embeddedTests.push({embeddedAttr: 'embeddedAttr2'});
			var res = {data: test.embeddedTests};
			develop({scope: 'detailed'})({}, res, function(err){
				if(err){
					return done(err);
				}
				assert(res.data instanceof Array);
				res.data.forEach(function(doc){
					assertEmbeddedTestDetailed(doc);
				});
				done();
			});
		});
	});

	it('single document client format', function(done){
		mongoose.model('Test').findOne({}, function(err, test){
			var req = {data: {scope: 'light'}};
			var res = {data: test};
			develop({})(req, res, function(err){
				if(err){
					return done(err);
				}
				assertTestLight(res.data);
				done();
			});
		});
	});

	it('ObjectId is stringified', function (done) {
		mongoose.model('Test')
		.findOne({}, function (e, test) {

			var req = {
				data: {
					scope: 'light'
				}
			};
			var res = {
				data: test
			};

			develop({})(req, res, function (e) {
				if (e) {
					return done(e);
				}

				assert.strictEqual(typeof res.data._id, 'string');
				done();
			});
		});
	});

	it('Undefined value', function (done) {
		mongoose.model('Test')
		.findOne({}, function (e, test) {

			var req = {
				data: {
					scope: 'light'
				}
			};

			test.attr1 = undefined;

			var res = {
				data: test
			};

			develop({})(req, res, function (e) {
				if (e) {
					return done(e);
				}

				assert.strictEqual(typeof res.data._id, 'string');
				done();
			});
		});
	});

});
