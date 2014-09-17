var async = require('async');
var _ = require('underscore');
	_.str = require('underscore.string');
	_.mixin(_.str.exports());

var Developer = function (options) {
	this.options = _.defaults(options||{}, {
		defaultScope: 'default'
	});
};

Router.prototype.develop = function (options) {
	options = _.defaults(options||{}, {

	});
	var me = this;
	return function(req, res, next){
		var data = res.data;
		if(typeof res.data.develop === 'function'){
			var scope = options.scope||req.data.scope||me.options.defaultScope;
			res.data.develop({req: req, scope: scope}, function(err, developedData){
				if(err){
					return next(err);
				}
				res.data = developedData;
				next();
			});
		}
		else{
			next();
		}
	}
};

module.exports = Developer;
