'use strict';

// dependencies
let path = require('path'),
	colors = require('colors'),
	mkdirp = require('mkdirp'),
	chokidar = require('chokidar'),
	Promise = require('bluebird'),
	uglify = require('uglify-js'),
	fs = Promise.promisifyAll(require('fs')),
	exec = Promise.promisify(require('child_process').exec, {
		multiArgs: true
	});


// declare some information to work with
let file = {};
file.path = process.argv[2];
if (!filenameCheck(file.path)) return;
let nestedPath = file.path.replace(__dirname, '');
file.type = nestedPath.match(/\/helpers\//i) ?
	'helper' : nestedPath.match(/\/partials\//i) ?
	'partial' : 'template';
file.basename = path.basename(file.path);
file.name = file.basename.substring(0, file.basename.lastIndexOf('.'));



Promise.resolve(file)
	.then(compile)
	.then(write)
	.then(concat)
	.then(wrap)
	.then(compress)
	.then(writeBundle);

// general function for compiling a single Handlebars file when its changed
function compile(file) {
	if ('helper' === file.type) {
		// pass compilation, since it's a raw js file
		return file;
	} else {
		let partialArg = file.type === 'partial' ? ' -p' : '';
		return exec(`handlebars ${file.path}${partialArg}`)
			.spread((stdout, stderr) => {
				if (stderr) console.error(`Handlebars compiler error: ${stderr}`);
				console.info(`\nHandlebars: compiled ${file.path.replace(__dirname,'')}`.cyan);
				file.compiled = stdout;
			})
			.thenReturn(file)
			.catch(console.error);
	}
}


// simply write the compiled and wrapped file into ./compiled directory
function write(file) {
	if ('helper' === file.type) {
		// pass dumping to disk, since we didn't cnange anything
		return file;
	}

	let writeDir = path.join(__dirname, 'compiled', file.type + 's');
	return fs.writeFileAsync(`${ensureExists(writeDir)}/${file.name}.js`, file.compiled)
		.then(() => console.info(`Handlebars: writed to disk ${writeDir.replace(__dirname,'')}/${file.name}.js`.cyan))
		.thenReturn(file)
		.catch(console.error);
}

// concat all files in the ./compiled directory in the order: helpers, partials, templates
function concat(file) {
	let output = [],
		helpers = [],
		partials = [],
		templates = [];

	let helpersDir = ensureExists(path.join(__dirname, './raw', './helpers')),
		partialsDir = ensureExists(path.join(__dirname, './compiled', './partials')),
		templatesDir = ensureExists(path.join(__dirname, './compiled', './templates'));

	return Promise.join(
			fs.readdirAsync(helpersDir),
			fs.readdirAsync(partialsDir),
			fs.readdirAsync(templatesDir),
			(helpers, partials, templates) => {
				helpers = helpers.filter(filenameCheck)
					.map(filename => path.join(helpersDir, filename));
				partials = partials.filter(filenameCheck)
					.map(filename => path.join(partialsDir, filename));
				templates = templates.filter(filenameCheck)
					.map(filename => path.join(templatesDir, filename));

				return [helpers, partials, templates];
			}
		)
		.spread((helpers, partials, templates) => {
			helpers = Promise.map(helpers, filepath => {
				return fs.readFileAsync(filepath);
			});
			partials = Promise.map(partials, filepath => {
				return fs.readFileAsync(filepath);
			});
			templates = Promise.map(templates, filepath => {
				return fs.readFileAsync(filepath);
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
				.then(() => {
					return output.join('\n');
				})
				.catch(console.error);
		})
		.catch(console.error);
}

// insert the compiled files inside a wrapper that makes it work smoothly in both CommonJS environment and in a browser
// TODO: add AMD environment as well
function wrap(output) {
	return fs.readFileAsync(path.join(__dirname, './wrapper'))
		.then(wrapper => {
			return output = wrapper.toString()
				.replace(/INJECT_HANDLEBARS_INTERNAL_WRAPPER/i, output);
		})
		.catch(console.error);
}

function compress(output) {
	output = output
		.replace(/'/gi, '\'')
		.replace(/"/gi, '\"');
	return uglify.minify(output, {
		fromString: true
	}).code;
}

function writeBundle(output) {
	let bundlePath = path.join(__dirname, 'bundle.js');
	return fs.writeFileAsync(bundlePath, output)
		.then(() => {
			console.info(`Handlebars: Bundle successfully created!\n`.cyan);
		})
		.thenReturn(output)
		.catch(console.error);
}

function filenameCheck(filename) {
	// filter .gitignore and non-js files
	if (filename.match(/\.gitignore/i))
		return false;
	if ('.js' === path.extname(filename) || '.hbs' === path.extname(filename))
		return true;
	return false;
}

function ensureExists(dir) {
	mkdirp.sync(dir);
	return dir;
}
