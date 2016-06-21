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
file.basename = path.basename(file.path);
file.name = file.basename.substring(0, file.basename.lastIndexOf('.'));
file.dest = path.join(file.path, '../../compiled');

// compute prefix for the file
if (file.path.match(/\/helpers\//i))
	file.prefix = '_helper_';
else if (file.path.match(/\/partials\//i))
	file.prefix = '_partial_';
else
	file.prefix = '';


// TODO: add minification
Promise.resolve(file)
	.then(compile)
	.then(wrap)
	.then(write)
	.then(concat)
	.then(writeBundle);

// general function for compiling a single Handlebars file when its changed
function compile(file) {
	if ('_helper_' === file.prefix) {
		// pass compilation, just load the file since it's a raw js file
		return fs.readFileAsync(file.path)
			.then(content => {
				file.compiled = content;
			})
			.thenReturn(file)
			.catch(console.error);
	}
	return exec(`handlebars ${file.path}`)
		.spread((stdout, stderr) => {
			if (stderr) return console.error(`Handlebars compiler error: ${stderr}`);
			console.info(`\nHandlebars compiled: ${file.path}`.cyan);
			file.compiled = stdout;
		})
		.thenReturn(file)
		.catch(console.error);
}

// insert the compiled file inside a wrapper that makes it work smoothly in both CommonJS environment and in a browser
// TODO: add AMD environment as well
function wrap(file) {
	return wrapperP
		.then(wrapper => {
			file.content = wrapper
				.replace(/INJECT_HANDLEBARS_INTERNAL_WRAPPER/i, file.compiled);
			console.log(`Handlebars wrapped: ${file.basename}`.cyan);
		})
		.thenReturn(file)
		.catch(console.error);
}

// simply write the compiled and wrapped file into ./compiled directory
function write(file) {
	return fs.writeFileAsync(path.join(file.dest, file.prefix + file.name + '.js'), file.content)
		.then(nothing => console.log(`Handlebars writed: ${file.dest}${file.basename}`.cyan))
		.thenReturn(file)
		.catch(console.error);
}

// concat all files in the ./compiled directory in the order: helpers, partials, templates
function concat(file) {
	let output = [],
		helpers = [],
		partials = [],
		templates = [];

	return fs.readdirAsync(file.dest)
		.then(dir => {
			// filter .gitignore and non-js files
			return dir = dir.filter(file => {
				if (file.match(/\.gitignore/i))
					return false;
				if ('.js' !== path.extname(file))
					return false;
				return true;
			});
		})
		.then(dir => {
			// sort files by type: helpers, partials, templates
			dir.forEach(basename => {
				if (basename.match(/_helper_/i))
					helpers.push(fs.readFileAsync(path.join(file.dest, basename)));
				else if (basename.match(/_partial_/i))
					partials.push(fs.readFileAsync(path.join(file.dest, basename)));
				else
					templates.push(fs.readFileAsync(path.join(file.dest, basename)));
			});

			return [helpers, partials, templates];
		})
		.spread((helpers, partials, templates) => {
			let reducer = (total, item) => {
				return total + item.toString() + '\n';
			};

			return Promise
				.reduce(helpers, reducer, '')
				.then(output.push.bind(output))
				.thenReturn(partials)
				.reduce(reducer, '')
				.then(output.push.bind(output))
				.thenReturn(templates)
				.reduce(reducer, '')
				.then(output.push.bind(output))
				.thenReturn(output)
				.catch(console.error);
		})
		.catch(console.error);
}

function writeBundle(output) {
	console.log('output: ', output);
	let bundlePath = path.join(path.dirname(file.dest), 'bundle.js');
	console.log('bundlePath', bundlePath);
	return fs.writeFileAsync(bundlePath, output.join('\n'))
		.then(() => {
			console.log(`Handlebars: bundle successfully created!`.cyan);
		})
		.thenReturn(output)
		.catch(console.error);
}
