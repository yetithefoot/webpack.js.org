#!/usr/bin/env node
var Parser = require('tap-parser');
var through = require('through2');
var duplexer = require('duplexer');
var minimist = require('minimist');

process.stdin
  .pipe(checkLinks())
  .pipe(process.stdout);

function checkLinks(args) {
  var argv = minimist(process.argv.slice(2));
  var skip = argv.skip || 0;

  var tap = new Parser();
  var out = through.obj();
  var dup = duplexer(tap, out);

  tap.on('assert', ({ ok, name, diag = {} }) => {
    let isSupport = /class="support__[^"]*"/.test(diag.at)
    let isShield = /src="https:\/\/img\.shields\.io[^"]*"/.test(diag.at)

    if ( isSupport || isShield ) {
      let type = isSupport ? 'Support' : 'Shield'
      print(`IGNORE (${type}): ` + diag.actual)

    } else if ( !ok ) {
      console.error(name + '\n' + diag.actual + ' at ' + diag.at)
      process.exit(1)

    } else print(name)
  })

  return dup;
}

function print(message) {
  if ( message.length > 85 ) console.log( message.slice(0, 80) + '...' )
  else console.log( message )
}
