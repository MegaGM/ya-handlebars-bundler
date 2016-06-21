'use strict';
let Handlebars = require('handlebars');
require('./bundle');



let r = Handlebars.templates['main.hbs']({
	fine: 'kisa',
	link: 'http://google.com'
});
console.log(r);
