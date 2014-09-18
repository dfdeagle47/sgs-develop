var _ = require('underscore');

module.exports = function(mongoose){

	mongoose.Types.Embedded.prototype.populate = function(paths, callback){
		var parentPath = this.parentArray()._path;
		var me = this;
		paths = paths.split(' ').filter(function(path){
			return !me.populated(path);
		}).map(function(path){
			return parentPath+'.'+path;
		}).join(' ');

		this.parent().populate(paths, callback);
	};

	mongoose.Types.Embedded.prototype.populated = function(path){
		var parentPath = this.parentArray()._path;
		return this.parent().populated.apply(this, [parentPath+'.'+path]);
	};

}