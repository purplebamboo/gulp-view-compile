gulp-view-compile[![Build Status](https://travis-ci.org/purplebamboo/gulp-view-compile.svg)](https://travis-ci.org/purplebamboo/gulp-view-compile)
=================

用于将html代码打包成cmd,amd规范可以使用的模块。这样可以跨域使用。

## Installation

`npm install gulp-view-compile`

## Test
`npm test`


## example

```

var rename = require('gulp-rename');
var viewCompile = require('gulp-view-compile');

gulp.src('./public/views/**/*.html').
  pipe(viewCompile({
    //定义资源根目录。模块的id名会是html文件的绝对地址去掉这个base.不填的话默认就不会有模块id.
    base:__dirname
  }));
  //一般会结合rename使用，把后缀改成.js
  .pipe(rename(function (path) {
      path.extname = ".js";
  }))
  .pipe(gulp.dest('public/views/'));


```
## options

###options.base
定义资源根目录。模块的id名会是html文件的绝对地址去掉这个base。
不填的话默认为空，就不会有模块id。
比如如果base是`/user/project`,文件的绝对地址是`/user/project/view/a.html`。
这样就会生成 模块id是 `view/a`的模块。

###options.asciiOnly
是否把中文转换成unicode,这样可以很好的解决不同编码的乱码的问题，默认是true。

###options.removeSpace
是否移除所有的空格，默认是true。

###options.protectMark
是否保留一些标记里面内容的格式，比如换行空格。
此参数只有在options.removeSpace为true的情况下起作用。

默认值为['pre']，所有pre标签里面的格式会被保留。支持简单的选择器写法，比如['pre','#test','.test']。


###options.idMap
生成的模块名转换函数，接受一个生成好的模块id为参数,比如如果希望模块名加上`-debug`:

```
viewCompile({
  base:__dirname,
  idMap:function(path){
    return path + "-debug"
  }
})
```


## License

MIT
