var assert = require("assert")
var viewCompile = require('./index.js')

var fs = require('vinyl-fs');

var testStream = fs.src(['./source.html'])


fs.src(['./test.js']).
on('data',function(chucnk){
  console.log(chucnk);
  console.log('=====');
})
