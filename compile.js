'use strict';

// dependencies
let path = require('path'),
	colors = require('colors'),
	exec = require('child_process').exec;

// make some data to work with
let file = process.argv[2];

// general function for compiling a single Handlebars file when its changed
function compile(file) {
	let filename = path.basename(file, '.hbs');
	exec(`handlebars ${file} -f ./compiled/${filename}.js`, function (err, stdout, stderr) {
		// TODO: add concatination and minification
		console.log(`Handlebars: ${filename} compiled`.cyan);
		if (err) console.error(`Error: ${err}`);
		if (stdout) console.log(`stdout: ${stdout}`);
		if (stderr) console.error(`stderr: ${stderr}`);
	});
}

Promise.resolve(file)
	.then(compile);
