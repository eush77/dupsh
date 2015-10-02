# dupsh

> The major weakness of pipes is that they are unidirectional. It's not possible for a pipeline component to pass control information back up the pipe other than by terminating.
> [*<div align=right>TAOUP</div>*][taoup]

[taoup]: http://catb.org/~esr/writings/taoup/html/ch07s02.html#plumbing

pipe together two shell commands full duplex

Given two shell commands `a` and `b`, pipe the output of `a` to the input of `b`
and the output of `b` to the input of `a`:

```
a.stdout.pipe(b.stdin);
b.stdout.pipe(a.stdin);
```

# example

Piping together 2 processes full duplex is very handy for testing symmetric and
peer to peer protocols because you can use the same program for both sides of
the connection. Otherwise you would need to spin up a tcp server and client or
otherwise clutter up your program with transport implementation details.

For example, if we have a symmetric protocol that speaks `stdin` and `stdout`:

``` js
var exchange = require('hash-exchange');
var through = require('through2');
var concat = require('concat-stream');
var shasum = require('shasum');

var messages = process.argv.slice(2);
var data = {};
messages.forEach(function (msg) { data[shasum(msg)] = msg });

var ex = exchange(function (hash) {
    var r = through();
    r.end(data[hash]);
    return r;
});
ex.provide(Object.keys(data));

ex.on('available', function (hashes) {
    ex.request(hashes);
});

ex.on('response', function (hash, stream) {
    stream.pipe(concat(function (body) {
        console.error('# BEGIN ' + hash);
        console.error(body.toString('utf8'));
        console.error('# END ' + hash);
    }));
});
process.stdin.pipe(ex).pipe(process.stdout);
```

Then this program can be run under `dupsh` to wire up the inputs and outputs:

```
$ dupsh "node ex.js 'way cool' 'beep boop' 'wow'" "node ex.js 'hey' 'beep boop' 'zing'"
# BEGIN 7f550a9f4c44173a37664d938f1355f0f92a47a7
hey
# END 7f550a9f4c44173a37664d938f1355f0f92a47a7
# BEGIN 20a1c567ff655e597dc680f8cc0d1dc2462e06bf
zing
# END 20a1c567ff655e597dc680f8cc0d1dc2462e06bf
# BEGIN 774c5faf359759e8874c7d3ef8f2fed23ec4dbde
way cool
# END 774c5faf359759e8874c7d3ef8f2fed23ec4dbde
# BEGIN 5bae372e69f5293eda5b478a2663f5330fe41631
wow
# END 5bae372e69f5293eda5b478a2663f5330fe41631
```

and the stderr from both programs falls through.

# usage

```
usage: dupsh {OPTIONS} CMD1 CMD2

  Spawn CMD1 and CMD2, piping the stdout of CMD1 to the stdin of CMD2,
  and the stdout of CMD2 to the stdin of CMD1.
 
  stderr from both processes is forwarded to the dupsh stderr.

OPTIONS are:

  -h --help  Show this message.

```

# install

With [npm](https://npmjs.org) do:

```
npm install -g dupsh
```

to get the command-line `dupsh` program.

# license

MIT
