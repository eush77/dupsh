#!/usr/bin/env node

var spawn = require('child_process').spawn;
var parse = require('shell-quote').parse;
var minimist = require('minimist');
var fs = require('fs');
var path = require('path');

var argv = minimist(process.argv.slice(2), {
    alias: { h: 'help' }
});

if (argv.help) return showHelp(0);
if (argv.length < 2) return showHelp(1);

var ca = parse(argv._[0]);
var cb = parse(argv._[1]);

var pa = spawn(ca[0], ca.slice(1));
var pb = spawn(cb[0], cb.slice(1));

pa.stdout.pipe(pb.stdin);
pb.stdout.pipe(pa.stdin);

pa.stderr.pipe(process.stderr);
pb.stderr.pipe(process.stderr);

pa.on('exit', onexit);
pb.on('exit', onexit);

var codes = [];
function onexit (code) {
    codes.push(code);
    if (codes.length !== 2) return;
    var c = code[0] || code[1];
    if (c) process.exit(c);
}

function showHelp (code) {
    var r = fs.createReadStream(path.join(__dirname, 'usage.txt'));
    r.pipe(process.stdout);
    r.on('end', function () {
        if (code) process.exit(code);
    });
}
