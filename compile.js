'use strict';

let exec = require('child_process').exec,
	colors = require('colors'),
	path = require('path'),
	file = process.argv[2],
	filename = path.basename(file, '.hbs');

function compile() {
	exec(`handlebars ${file} -f ./compiled/${filename}.js`, function (err, stdout, stderr) {
		console.log(`Handlebars: ${filename} compiled`.cyan);
		if (err) console.error(`Error: ${err}`);
		if (stdout) console.log(`stdout: ${stdout}`);
		if (stderr) console.error(`stderr: ${stderr}`);
	});
}

compile();
