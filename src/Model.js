var _ = require('underscore');
	_.str = require('underscore.string');
	_.mixin(_.str.exports());

var async = require('async')

module.exports = function(mongoose){

	mongoose.Model.prototype.pathsToDevelop = function(options, callback){
		var developSchema = this.developSchema();

		var devPathsByPathFromScope = function(scope){
			var scopeSchema = developSchema[scope]||{};
			var devPaths = {};
			(scopeSchema.extend]||[]).forEach(function(scopeToExtend){
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
	};

	mongoose.Model.prototype.developSchema = function(){
		return {};
	};

};