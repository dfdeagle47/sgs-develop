var Developer = require('./Developer');

module.exports = function(mongoose){

	if(!mongoose.Document.prototype.develop){
		require('./Document')(mongoose);
		//require('./Embedded')(mongoose);
		require('./Array')(mongoose);
		require('./DocumentArray')(mongoose);
	}

	return Developer;
};
