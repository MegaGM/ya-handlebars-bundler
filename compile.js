'use strict';

// dependencies
let path = require('path'),
	colors = require('colors'),
	Promise = require('bluebird'),
	fs = Promise.promisifyAll(require('fs')),
	exec = Promise.promisify(require('child_process').exec, {
		multiArgs: true
	});

let wrapperP = new Promise((resolve, reject) => {
	fs.readFileAsync(path.join(__dirname, './wrapper'))
		.then(content => {
			resolve(content.toString());
		});
});

// declare some information to work with
let file = {};
file.path = process.argv[2];
file.name = path.basename(file.path, '.hbs');
file.type = file.name.match(/_helper/i) ? 'helper' : 'template';
file.dest = path.join(file.path, '../../compiled', file.name + '.js');

// TODO: add concatination and minification
Promise.resolve(file)
	.then(compile)
	.then(wrap)
	.then(rewrite);

// general function for compiling a single Handlebars file when its changed
function compile(file) {
	return exec(`handlebars ${file.path}`)
		.spread((stdout, stderr) => {
			if (stderr) return console.error(`Handlebars compiler error: ${stderr}`);
			console.info(`\nHandlebars compiled: ${file.path}`.cyan);
			file.compiled = stdout;
			return file.dest;
		})
		.thenReturn(file);
}

function wrap(file) {
	return wrapperP
		.then(wrapper => {
			file.content = wrapper
				.replace(/INJECT_HANDLEBARS_INTERNAL_WRAPPER/i, file.compiled);
			console.log(`Handlebars wrapped: ${file.dest}`.cyan);
		})
		.thenReturn(file);
}

function concat(file) {}

function rewrite(file) {
	fs.writeFileAsync(file.dest, file.content)
		.then(nothing => console.log(`Handlebars rewrited: ${file.dest}`.cyan));
}
