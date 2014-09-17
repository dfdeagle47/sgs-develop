var _ = require('underscore');
	_.str = require('underscore.string');
	_.mixin(_.str.exports());

var async = require('async')

module.exports = function(mongoose){

	mongoose.Document.prototype.develop = function(options, callback){
		var developedObject = {};
		var me = this;
		this.pathsToDevelop(options, function(err, pathsToDevelop){
			if(err){
				return callback(err);
			}
			me.developPopulate(pathsToDevelop, options, function(err){
				if(err){
					return callback(err);
				}
				me.fillValuesInDevelopedObject(developedObject, pathsToDevelop, options, function(err){
					if(err){
						return callback(err);
					}
					me.developChildrenInDevelopedObject(developedObject, pathsToDevelop, options, function(err){
						if(err){
							return callback(err);
						}
						callback(null, developedObject);
					});
				});
			});
		});
	};

	mongoose.Document.prototype.pathsToDevelop = function(options, callback){
		this.schema.pathsToDevelop(options, callback);
	};

	mongoose.Document.prototype.developPopulate = function(pathsToDevelop, options, callback){
		var pathsToPopulate = pathsToDevelop.filter(function(path){
			return path.populate;
		}).map(function(path){
			return path.path;
		});
		me.populate(pathsToPopulate.join(' '), callback);
	};

	mongoose.Document.prototype.fillValuesInDevelopedObject = function(developedObject, pathsToDevelop, options, callback){
		async.each(pathsToDevelop, function(pathToDevelop, callback){
			var path = pathToDevelop.path;
			var camelizedGetPath = _('get_'+path).camelize();
			if(typeof me[camelizedGetPath] === 'function'){
				me[camelizedGetPath](options, function(err, value){
					developedObject[path] = value;
				});
			}
			else{
				developedObject[path] = value;
				callback();
			}
		}), callback);
	};

	mongoose.Document.prototype.developChildrenInDevelopedObject = function(developedObject, pathsToDevelop, options, callback){
		async.each(pathsToDevelop, function (pathToDevelop, callback) {
			var path = pathToDevelop.path;
			var value = me[name];
			if(value && typeof value.develop === 'function'){
				value.develop({req: req, scope: pathToDevelop.scope}, function(err, developedValue){
					if(err){
						return callback(err);
					}
					developedObject[path] = developedValue;
					callback();
				});
			}
			else{
				callback();	
			}
		}, callback);
	};

};