'use strict';
let cwd = process.cwd(),
	fs = require('fs-extra'),
	path = require('path'),
	join = path.resolve,
	uglify = require('uglify-js'),
	Handlebars = null,
	config = require(join(cwd, './handlebars.config.js'));

try {
	Handlebars = require(join(cwd, 'node_modules/handlebars'));
} catch (err) {
	if ('MODULE_NOT_FOUND' === err.code)
		Handlebars = require.main.require('handlebars');
	else throw err;
}
/* ================================================
 * Global Helpers
 * ===============================================*/
let readFile = (filepath) => {
		try {
			return fs.readFileSync(filepath, 'utf-8');
		} catch (err) {
			console.error(config.app.prefix, 'is not able to read file: ', filepath, '\n', err);
		}
	},
	writeFile = (filepath, content) => {
		try {
			return fs.outputFileSync(filepath, content);
		} catch (err) {
			console.error(config.app.prefix, 'is not able to write file: ', filepath, '\n', err);
		}
	},
	removeFile = (filepath) => {
		try {
			return fs.removeSync(filepath);
		} catch (err) {
			console.error(config.app.prefix, 'is not able to delete file: ', filepath, '\n', err);
		}
	};

module.exports = class Hash {

	constructor() {
		this.helpers = {};
		this.partials = {};
		this.templates = {};
		this.wrappers = {
			helpers: readFile(join(__dirname, './wrappers/helpers')),
			partials: readFile(join(__dirname, './wrappers/partials')),
			templates: readFile(join(__dirname, './wrappers/templates')),
			standalone: readFile(join(__dirname, './wrappers/standalone'))
		};
	}

	add(filepath) {
		// check
		let file = this._getFileinfo(filepath);
		if (!file) return false;

		// read
		file.content = readFile(filepath);

		// compile
		file.precompiled = 'helpers' === file.type ?
			file.content : Handlebars.precompile(file.content);

		file.compiled = this._wrap({
			file: file,
			wrapper: this.wrappers[file.type],
			content: file.precompiled
		});

		// store
		this[file.type][path.join(file.relativeDir, file.base)] = file;
		let output;
		try {
			output = config.minify ? this._compress(file.compiled) : file.compiled;
		} catch (err) {
			let message = config.app.prefix + ' JS_Parse_Error in file: ' + path.join(file.relativeDir, file.base) + '\n' + err.message;
			console.error(message);
			return false;
		}

		writeFile(file.storepath, this._wrap({
			file: file,
			wrapper: this.wrappers.standalone,
			content: output
		}));

		return file;
	}

	update(filepath) {
		return this.add(filepath);
	}

	remove(filepath) {
		let file = this._getFileinfo(filepath);
		if (!file) return false;
		delete this[file.type][path.join(file.relativeDir, file.base)];
		// TODO: remove from disk
		removeFile(file.storepath);
		return file;
	}

	updateBundle() {
		let output = this.concat();
		if (!output) return;

		output = this._wrap({
			wrapper: this.wrappers.standalone,
			content: output
		});

		try {
			output = config.minify ? this._compress(file.compiled) : file.compiled;
		} catch (err) {
			return false;
		}
		this._writeBundle(output);
	}

	_wrap(options) {
		options.file = options.file || {};
		return options.wrapper
			.replace(/INJECT_HANDLEBARS_INTERNAL_WRAPPER_FILENAME/i, options.file.name || '')
			.replace(/INJECT_HANDLEBARS_INTERNAL_WRAPPER_CONTENT/i, options.content);
	}

	_compress(output) {
		// output = output
		// 	.replace(/'/gi, '\'')
		// 	.replace(/"/gi, '\"');
		try {
			return uglify.minify(output, {
				fromString: true
			}).code;
		} catch (err) {
			let error = new Error('JS_Parse_Error');
			error.code = 'JS_Parse_Error';
			error.message = err.message
			throw error;
		}
	}

	_writeBundle(output) {
		writeFile(join(config.bundle, config.bundleFilename), output);
	}

	concat() {
		let helpers = Object.keys(this.helpers)
			.map(key => this.helpers[key].compiled);
		let partials = Object.keys(this.partials)
			.map(key => this.partials[key].compiled);
		let templates = Object.keys(this.templates)
			.map(key => this.templates[key].compiled);

		let output = helpers.join('\n') + partials.join('\n') + templates.join('\n');
		return output.length ? output : false;
	}

	_filepathCheck(file) {
		// filter .gitignore and non-js files
		if (file.base.match(/\.gitignore/i))
			return false;
		if ('.js' === file.ext || '.hbs' === file.ext)
			return true;
		return false;
	}

	_getFileinfo(filepath) {
		let file = path.parse(filepath);
		if (!this._filepathCheck(file)) return false;

		file.relativeDir = file.dir.substring(file.dir.lastIndexOf(config.raw) + config.raw.length + 1);
		let filename = file.name + (config.minify ? '.min' : '') + '.js';
		file.storepath = join(config.compiled, file.relativeDir, filename);
		file.type = file.relativeDir.match(/helpers/i) ?
			'helpers' : file.relativeDir.match(/partials/i) ?
			'partials' : 'templates';
		return file;
	}

}
