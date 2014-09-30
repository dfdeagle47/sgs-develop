var EmbeddedTestSchema = new mongoose.Schema({
	embeddedAttr: {
		type: String
	}
});

EmbeddedTestSchema.methods.getVirtualAttr = function(options, callback){
	callback(null, 'ok');
};

EmbeddedTestSchema.methods.developSchema = function(options, callback){
	var ds = {
		light: {
			paths: [
				'embeddedAttr'
			]
		},

		detailed: {
			paths: [
				'embeddedAttr',
				'virtualAttr'
			]
		}
	};

	callback(null, ds);
};

EmbeddedTestSchema.methods.getVirtualInstanceAttr = function(options, callback){
	mongoose.model('Test').findOne({}, callback);
};

var TestSchema = new mongoose.Schema({
	attr1: {
		type: String
	},
	attr2: {
		attr3: {
			type: String
		}
	},
	arrayAttr: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	embeddedTests: [EmbeddedTestSchema]
});

TestSchema.methods.getVirtualInstanceAttr = function(options, callback){
	mongoose.model('Test').findOne({}, callback);
};

TestSchema.methods.getVirtualStringAttr = function(options, callback){
	callback(null, 'ok');
};

TestSchema.methods.developSchema = function(options, callback){
	var ds = {
		light: {
			paths: [
				'attr1',
				'attr2.attr3'
			]
		},

		detailed: {
			extend: ['light'],
			paths: [
				{path: 'embeddedTests', scope: 'light'},
				{path: 'virtualInstanceAttr', scope: 'light', populate: true},
				'virtualStringAttr'
			]
		},

		detailed_embdet: {
			extend: ['detailed'],
			paths: [
				{path: 'embeddedTests', scope: 'detailed'}
			]
		},

		detailed_embcust: {
			extend: ['detailed'],
			paths: [
				{
					path: 'embeddedTests', 
					pathsToDevelop: [
						'virtualAttr'
					]
				}
			]
		}

	};

	callback(null, ds);
};

var TestModel = mongoose.model('Test', TestSchema);