'use strict';
let path = require('path');

let Handlebars = require('handlebars');
// let helpers = path.join(__dirname, './helpers');
// helpers = require('require-all')('helpers');
//
let templates = path.join(__dirname, './compiled');
templates = require('require-all')('compiled');

// console.log('Handlebars.template: ', Handlebars.template);
// console.log('Handlebars.templates: ', Handlebars.templates);

let result = Handlebars.templates['first.hbs']({
	okay: 'fine'
});
console.log(result);

// let path = require('path'),
// 	applicationPartials = {
// 		personal: require('./compiled/personal-related.js'),
// 	};
//
// module.exports = applicationPartials;
