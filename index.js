'use strict';
let Handlebars = require('handlebars');
require('require-all')('./helpers');
// require('./helpers/makeLink');

let path = require('path'),
	applicationPartials = {
		personal: require('./compiled/personal-related.js'),
		apb: require('./compiled/apb-related.js'),
		bns: require('./compiled/bns-related.js'),
		gta: require('./compiled/gta-related.js')
	};

function getTemplatePath(game) {
	return require(path.join(__dirname, './compiled/', game + '-related.js'));
}

module.exports = applicationPartials;
