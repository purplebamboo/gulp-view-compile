var assert = require("assert")
var viewCompile = require('../index.js')

var fs = require('vinyl-fs');
var path = require('path');

var testStream;

 describe('#test',function(){
   beforeEach(function(){
    testStream = fs.src(['./test/source.html'])
   })
   it('should translate html to cmd,amd modoule',function(done){

    testStream.pipe(viewCompile()).
    on('data',function(chucnk){
      var str = chucnk.contents.toString()
      assert.equal(true,/define\(function\(require, exports, module\)/.test(str))
    }).
    on('end',function(){
      done()
    })
   })

   it('use base should make a defineId',function(done){

    testStream.pipe(viewCompile({
      base:__dirname
    })).
    on('data',function(chucnk){
      var str = chucnk.contents.toString()
      var basename = 'define\\("source",function\\(require, exports, module\\)'
      assert.equal(true,new RegExp(basename).test(str))
    }).
    on('end',function(){
      done()
    })
   })
   it('define asciiOnly false to stop translate chinese to unicode',function(done){

    testStream.pipe(viewCompile({
      base:__dirname,
      asciiOnly:false
    })).
    on('data',function(chucnk){
      var str = chucnk.contents.toString()
      assert.equal(true,/标记/.test(str))
    }).
    on('end',function(){
      done()
    })
   })

   it('define removeSpace false to stop remove space',function(done){

    testStream.pipe(viewCompile({
      base:__dirname,
      asciiOnly:false,
      removeSpace:false
    })).
    on('data',function(chucnk){
      var str = chucnk.contents.toString()
      assert.equal(true,/\s/.test(str))
    }).
    on('end',function(){
      done()
    })
   })
   it('define trans false to stop remove space',function(done){

    testStream.pipe(viewCompile({
      base:__dirname,
      asciiOnly:false,
      removeSpace:false
    })).
    on('data',function(chucnk){
      var str = chucnk.contents.toString()
      assert.equal(true,/\s/.test(str))
    }).
    on('end',function(){
      done()
    })
   })
   it('use idMap to change id',function(done){

    testStream.pipe(viewCompile({
      base:__dirname,
      idMap:function(path){
        return path + "-debug"
      }

    })).
    on('data',function(chucnk){
      var str = chucnk.contents.toString()
      var basename = 'define\\("source-debug",function\\(require, exports, module\\)'
      assert.equal(true,new RegExp(basename).test(str))
    }).
    on('end',function(){
      done()
    })
   })

   it('use protectMark to remain empty',function(done){

    testStream.pipe(viewCompile({
      base:__dirname
      //protectMark:

    })).
    on('data',function(chucnk){
      var str = chucnk.contents.toString()
      assert.equal(true,new RegExp('1  8').test(str))
    }).
    on('end',function(){
      done()
    })
   })

 })
















