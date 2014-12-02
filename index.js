/**
 * 用于将html代码打包成cmd,amd规范可以使用的模块。这样可以跨域使用。
 */
var util = require('util')
var through = require('through-gulp')
var path = require('path')
var cheerio = require('cheerio')
  // http://nuysoft.iteye.com/blog/1217898
var rcjk = /[\u2E80-\u2EFF\u2F00-\u2FDF\u3000-\u303F\u31C0-\u31EF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FBF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]+/g

var FIRST_DELIMITER_REG = new RegExp('^' + path.sep)


function mixIn(dst, orin, overwrite) {
  var dst = dst || {},
    key, overwrite = overwrite || false
  for (key in orin) {
    if (orin.hasOwnProperty(key)) {
      if (typeof(dst[key]) !== 'undefined' && !overwrite) {
        continue
      }
      dst[key] = orin[key]
    }
  }
  return dst
}


function viewComile(options) {

  options = mixIn({
    asciiOnly: true,
    removeSpace: true,
    base: '',
    protectMark: ['pre'],
    idMap: ''
  }, options, true)

  var isNeedTransUnicode = options.asciiOnly
  var isNeedTransEmpty = options.removeSpace
  var protectArray = util.isArray(options.protectMark) ? options.protectMark : [options.protectMark]
  var mapFn = options.idMap
  var base = options.base

  var generateDefineId = function(filePath) {
    if (!base) return ''

    var ext = path.extname(filePath)

    return filePath.replace(base, '').replace(ext, '').replace(FIRST_DELIMITER_REG, '')

  }
  var _generatePlaceholderReg = function(mark) {
    return new RegExp('<' + mark + '[^>]*>[.]*<\/' + mark + '>')
  }


  var _protectFactory = function(){
    //var root = null;
    var protectHash = {}
    var root = null
    var specialId = ''


    return {
      protect:function(str){
        root = cheerio.load(str,{
          decodeEntities: false
        })
        protectArray.forEach(function(v, markIndex) {

          root(v).each(function(index,ele){

            specialId = 'placeholder-'+markIndex+index

            protectHash[specialId] = root(this).html().replace(/\n/g, '\\n').replace(/\r/g, '\\r')

            root(this).html('<div id="'+specialId+'"></div>')

          })

        })
        return root.html()

      },
      recover:function(str){
        root = cheerio.load(str,{
          decodeEntities: false
        })
        protectArray.forEach(function(v, markIndex) {

          root(v).each(function(index,ele){
            specialId = 'placeholder-'+markIndex+index
            root('#'+specialId).parent().html(protectHash[specialId])

          })

        })
        return root.html()

      }

    }

  }

  var stream = through(function(file, encoding, callback) {

    var htmlStr, jsStr, defineId
    var protectManage = _protectFactory()

    htmlStr = file.contents.toString()


    //保护一些标签不被转义
    if (isNeedTransEmpty){
      htmlStr = protectManage.protect(htmlStr)
    }

    //去掉空格
    if (isNeedTransEmpty) {
      htmlStr = htmlStr.replace(/\n+/g, '').replace(/\r+/g, '').replace(/\s{2,}/g, ' ').replace(/<!\-\-.*?\-\->/g, '').replace(/\\/g, '\\\\')
    }

    //恢复标签
    if (isNeedTransEmpty) {
      htmlStr = protectManage.recover(htmlStr)
    }

    //中文转义
    if (isNeedTransUnicode) {
      htmlStr = htmlStr.replace(rcjk, function(cjk) {
        return escape(cjk).toLocaleLowerCase().replace(/%u/gi, '\\u')
      })
    }



    //加id
    defineId = generateDefineId(file.path)

    //map映射
    if (mapFn) {
      defineId = mapFn(defineId)
    }
    defineId = defineId ? '"' + defineId + '"' + ',' : ''

    //转义引号
    htmlStr = htmlStr.replace(/"/g, '\\"').replace(/'/g, '\\\'')

    jsStr = 'define(' + defineId + 'function(require, exports, module) {return "' + htmlStr + '" })'

    file.contents = new Buffer(jsStr)

    this.push(file)
    callback()

  })
  return stream

}

module.exports = viewComile