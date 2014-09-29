var _ = require('underscore');

module.exports = function(mongoose){

	_(mongoose.Types.Embedded.prototype).extend({

		populate: function(paths, callback){
			if(typeof callback === 'function'){
				var parentPath = this.parentArray()._path;
				var me = this;
				paths = paths.split(' ').filter(function(path){
					return !me.populated(path);
				}).map(function(path){
					return parentPath+'.'+path;
				}).join(' ');

				this.parent().populate(paths, callback);
			}
			else{
				return mongoose.Document.prototype.populate.apply(this, arguments);
			}
		}

		// populated: function(path){
		// 	var parentPath = this.parentArray()._path;
		// 	return this.parent().populated.apply(this, [parentPath+'.'+path]);
		// }

	});

}