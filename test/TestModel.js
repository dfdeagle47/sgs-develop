var EmbeddedTestSchema = new mongoose.Schema({
	embeddedAttr: {
		type: String
	}
});

EmbeddedTestSchema.statics.getVirtualCollAttr = function(options, callback){
	mongoose.model('Test').findOne({}, callback);
};

EmbeddedTestSchema.methods.getVirtualInstanceAttr = function(options, callback){
	mongoose.model('Test').findOne({}, callback);
};

var TestSchema = new mongoose.Schema({
	attr: {
		type: String
	},
	embeddedTests: [EmbeddedTestSchema],
	linkedTest: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Test'
	}
});

TestSchema.statics.getVirtualCollAttr = function(options, callback){
	mongoose.model('Test').findOne({}, callback);
};

TestSchema.methods.getVirtualInstanceAttr = function(options, callback){
	mongoose.model('Test').findOne({}, callback);
};

TestSchema.methods.doThat = function(options, callback){
	callback(null, options.data);
};

var TestModel = mongoose.model('Test', TestSchema);