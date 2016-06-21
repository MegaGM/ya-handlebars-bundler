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
file.dest = path.join(file.path, '../../compiled');

// compute prefix for the file
if (file.path.match(/\/helpers\//i))
	file.prefix = '_helper_';
else if (file.path.match(/\/partials\//i))
	file.prefix = '_partial_';
else
	file.prefix = '';


// TODO: add concatination and minification
Promise.resolve(file)
	.then(compile)
	.then(wrap)
	.then(rewrite)
	.then(concat);

// general function for compiling a single Handlebars file when its changed
function compile(file) {
	return exec(`handlebars ${file.path}`)
		.spread((stdout, stderr) => {
			if (stderr) return console.error(`Handlebars compiler error: ${stderr}`);
			console.info(`\nHandlebars compiled: ${file.path}`.cyan);
			file.compiled = stdout;
		})
		.thenReturn(file);
}

function wrap(file) {
	return wrapperP
		.then(wrapper => {
			file.content = wrapper
				.replace(/INJECT_HANDLEBARS_INTERNAL_WRAPPER/i, file.compiled);
			console.log(`Handlebars wrapped: ${file.name}`.cyan);
		})
		.thenReturn(file);
}

function rewrite(file) {
	return fs.writeFileAsync(path.join(file.dest, file.prefix + file.name + '.js'), file.content)
		.then(nothing => console.log(`Handlebars rewrited: ${file.dest}${file.name}`.cyan))
		.thenReturn(file);
}

function concat(file) {
	let helpers = [],
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
			// console.log('helpers: ', helpers);
			// console.log('partials: ', partials);
			// console.log('templates: ', templates);
			let output = [];

			Promise.reduce(helpers, (total, item) => {
					return total + item.toString() + '\n';
				}, '')
				.then(item => {
					output.push(item);
				})
				.thenReturn(partials)
				.reduce((total, item) => {
					return total + item.toString() + '\n';
				}, '')
				.then(item => {
					output.push(item);
				})
				.thenReturn(templates)
				.reduce((total, item) => {
					return total + item.toString() + '\n';
				}, '')
				.then(item => {
					output.push(item);
				})
				.then(() => {
					console.log('output: ', output);
					let bundlePath = path.join(path.dirname(file.dest), 'bundle.js');
					console.log('bundlePath', bundlePath);
					fs.writeFileAsync(bundlePath, output.join('\n'))
						.then(() => {
							console.log(`Handlebars some files were concatenated:
								${helpers.length} helpers, ${partials.length} partials and ${templates.length} templates`.cyan);
						});
				})
				.catch(err => console.error('errara', err));
		})
		.catch(err => console.error('errara', err));
}
