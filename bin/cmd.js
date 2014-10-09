#!/usr/bin/env node

var spawn = require('child_process').spawn;
var parse = require('shell-quote').parse;
var ca = parse(process.argv[2]);
var cb = parse(process.argv[3]);

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
