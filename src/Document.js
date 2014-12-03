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

				pathsToDevelop = pathsToDevelop.map(function(path){
					return typeof path === 'string' ? {path: path} : path;
				});

				//console.log('pathsToDevelop', pathsToDevelop)
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

		// paths to develop for scope options.scope
		pathsToDevelop: function(options, callback){
			if(options.pathsToDevelop){
				return callback(null, options.pathsToDevelop);				
			}

			var devPathsByPathFromScope = function(scope, developSchema){
				var scopeSchema = developSchema[scope]||{};
				var devPaths = {};
				(scopeSchema.extend||[]).forEach(function(scopeToExtend){
					devPaths = _(devPaths).extend(devPathsByPathFromScope(scopeToExtend, developSchema));
				});
				(scopeSchema.paths||[]).forEach(function(path){
					if(typeof path === 'string'){
						path = {path: path};
					}
					devPaths[path.path] = path;
				});
				return devPaths;
			}

			this.developSchema(options, function(err, developSchema){
				if(err){
					return callback(err);
				}
				//console.log('developSchema', developSchema)
				callback(null, _(devPathsByPathFromScope(options.scope, developSchema)).values());
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
				me.get(path, options, function(err, value){
					if(err){
						return callback(err);
					}

					if (value.constructor.name === 'ObjectID') {
						value = value.toString();
					}

					developedObject[path] = value;
					callback();
				});
			}, callback);
		},

		developChildrenInDevelopedObject: function(developedObject, pathsToDevelop, options, callback){
			var me = this;
			async.each(pathsToDevelop, function (pathToDevelop, callback) {
				var path = pathToDevelop.path;
				var value = developedObject[path];
				if(value && typeof value.develop === 'function'){
					var childOptions = {
						req: options.req,
						scope: pathToDevelop.scope,
						pathsToDevelop: pathToDevelop.pathsToDevelop
					};
					value.develop(childOptions, function(err, developedValue){
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