var _ = require('underscore');
	_.str = require('underscore.string');
	_.mixin(_.str.exports());

var async = require('async')

module.exports = function(mongoose){

	_(mongoose.Document.prototype).extend({

		develop: function(options, callback){
			var developedObject = {};
			var me = this;
			// console.log('develop', options)
			this.pathsToDevelop(options, function(err, pathsToDevelop){
				if(err){
					return callback(err);
				}
				// console.log('pathsToDevelop', pathsToDevelop)
				me.developPopulate(pathsToDevelop, options, function(err){
					if(err){
						return callback(err);
					}
					// console.log('developPopulate')
					me.fillValuesInDevelopedObject(developedObject, pathsToDevelop, options, function(err){
						if(err){
							return callback(err);
						}
						// console.log('fillValuesInDevelopedObject', developedObject)
						me.developChildrenInDevelopedObject(developedObject, pathsToDevelop, options, function(err){
							if(err){
								return callback(err);
							}
							// console.log('developChildrenInDevelopedObject', developedObject)
							callback(null, developedObject);
						});
					});
				});
			});
		},

		pathsToDevelop: function(options, callback){
			this.developSchema(options, function(err, developSchema){
				if(err){
					return callback(err);
				}

				//console.log('developSchema', developSchema)

				var devPathsByPathFromScope = function(scope, callback){
					var scopeSchema = developSchema[scope]||{};
					var devPaths = {};
					(scopeSchema.extend||[]).forEach(function(scopeToExtend){
						devPaths = _(devPaths).extend(devPathsByPathFromScope(scopeToExtend));
					});
					(scopeSchema.paths||[]).forEach(function(path){
						if(typeof path === 'string'){
							path = {path: path};
						}
						devPaths[path.path] = path;
					});
					return devPaths;
				}

				callback(null, _(devPathsByPathFromScope(options.scope)).values());
			});
		},

		developSchema: function(options, callback){
			callback(null, {});
		},

		developPopulate: function(pathsToDevelop, options, callback){
			var pathsToPopulate = pathsToDevelop.filter(function(path){
				return path.populate;
			}).map(function(path){
				return path.path;
			});

			this.populate(pathsToPopulate.join(' '), callback);
		},

		fillValuesInDevelopedObject: function(developedObject, pathsToDevelop, options, callback){
			var me = this;
			async.each(pathsToDevelop, function(pathToDevelop, callback){
				var path = pathToDevelop.path;
				var camelizedGetPath = _('get_'+path).camelize();
				if(typeof me[camelizedGetPath] === 'function'){
					me[camelizedGetPath](options, function(err, value){
						developedObject[path] = value;
						callback();
					});
				}
				else{
					developedObject[path] = me.get(path);
					callback();
				}
			}, callback);
		},

		developChildrenInDevelopedObject: function(developedObject, pathsToDevelop, options, callback){
			var me = this;
			async.each(pathsToDevelop, function (pathToDevelop, callback) {
				var path = pathToDevelop.path;
				var value = developedObject[path];
				if(value && typeof value.develop === 'function'){
					value.develop({req: options.req, scope: pathToDevelop.scope}, function(err, developedValue){
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
		}

	});

};