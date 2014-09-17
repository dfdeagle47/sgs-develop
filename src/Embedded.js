module.exports = function(mongoose){

	mongoose.Types.Embedded.prototype.populate = function(paths, callback){
		var parentPath = this.parentArray()._path;

		paths = parentPath+'.'+paths;
		paths = paths.replace(/ /g, ' '+parentPath+'.');

		this.parent().populate(paths, callback);
	};

	mongoose.Types.Embedded.prototype.pathsToDevelop = function(options, callback){
		return mongoose.Model.prototype.pathsToDevelop.apply(this, arguments);
	};

	mongoose.Types.Embedded.prototype.developSchema = function(){
		return mongoose.Model.prototype.developSchema.apply(this, arguments);
	};

}