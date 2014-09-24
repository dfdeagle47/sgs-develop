var TestModel = require('./TestModel');

var UserSchema = new mongoose.Schema({
	attr: {
		type: String
	},
	test: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Test'
	}
});

UserSchema.methods.developSchema = function(options, callback){
	var ds = {
		light: {
			paths: [
				'attr',
				'test'
			]
		},

		detailed: {
			extend: ['light'],
			paths: [
				{path: 'test', populate: true, scope: 'light'}
			]
		},

		detailed_testdetailed: {
			extend: ['detailed'],
			paths: [
				{path: 'test', populate: true, scope: 'detailed'}
			]
		}
	};

	callback(null, ds);
};

var UserModel = mongoose.model('User', UserSchema);