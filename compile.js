'use strict';

// dependencies
let path = require('path'),
	colors = require('colors'),
	Promise = require('bluebird'),
	fs = Promise.promisifyAll(require('fs')),
	exec = Promise.promisify(require('child_process').exec, {
		multiArgs: true
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
	return exec(`handlebars ${file.path} -f ./compiled/${file.name}.js`)
		.spread((stdout, stderr) => {
			console.info(`\nHandlebars compiled: ${file.path}`.cyan);
			// if (stdout) console.info(`stdout: ${stdout}`);
			// if (stderr) console.error(`stderr: ${stderr}`);
			return file.dest;
		})
		.then(fs.readFileAsync)
		.then(content => {
			file.compiled = content.toString();
		})
		.thenReturn(file);
}

function wrap(file) {
	return fs.readFileAsync(path.join(__dirname, './wrapper'))
		.then(wrapper => {
			wrapper = wrapper.toString();
			file.content = wrapper.replace(/INJECT_HANDLEBARS_INTERNAL_WRAPPER/i, file.compiled);
			console.log(`Handlebars wrapped: ${file.dest}`.cyan);
		})
		.thenReturn(file);
}

function concat(file) {}

function rewrite(file) {
	fs.writeFileAsync(file.dest, file.content)
		.then(nothing => console.log(`Handlebars rewrited: ${file.dest}`.cyan));
}
