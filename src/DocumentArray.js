var async = require('async');
var _ = require('underscore');

module.exports = function(mongoose){

	mongoose.Types.DocumentArray.prototype.develop = function(options, callback){
		if (!this.length) {
			return callback(null, this);
		};
		this.developDocs(options, callback);
	};

};