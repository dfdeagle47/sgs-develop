var async = require('async');
var _ = require('underscore');

module.exports = function(mongoose){

	Array.prototype.develop = function(options, callback){
		if (!this.length) {
			return callback();
		};

		var doc = this[0];
		if(!(doc instanceof mongoose.Document)){
			callback(null, this);
		} 
		else {
			var me = this;
			doc.constructor.pathsToDevelop(options, function(err, pathsToDevelop){
				if(err){
					return callback(err);
				}

				var pathsToPopulateString = pathsToDevelop.filter(function(path){
					return path.populate;
				}).map(function(path){
					return path.path;
				}).join(' ');

				if(pathsToPopulateString && !(me instanceof mongoose.Types.DocumentArray)){
					doc.constructor.populate(me, pathsToPopulateString, function(err){
						if(err){
							return callback(err);
						}
						me.developDocs(options, callback);
					});
				}
				else{
					me.developDocs(options, callback);
				}
			});
		}
	};

	Array.prototype.developDocs = function(options, callback){
		var developedArray = [];
		var me = this;
		async.each(_(this).keys(), function(index, callback){
			me[index].develop(function(err, devObj){
				if(!err){
					developedArray[index] = devObj;
				}
				callback(err);
			});				
		}, function(err){
			if(err){
				callback(err);
			}
			callback(null, developedArray);
		});
	};

};