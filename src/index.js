var Developer = require('./Developer');

module.exports = function(mongoose){

	if(!mongoose.Document.prototype.develop){
		require('./Model')(mongoose);
		require('./Document')(mongoose);
		require('./Embedded')(mongoose);
		require('./Array')(mongoose);
	}

	return Developer;
};