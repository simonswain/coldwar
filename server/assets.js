"use strict";

var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var UglifyJS = require('uglify-js');
var less = require('less');

var create = function(opts){

  opts = _.defaults(
    opts, {
      key: false,
      base: '',
      url: '/',
      out: __dirname + '/public/assets',
      outUrl: '/assets'
    });

  var assets = {
    css: [],
    js: []
  };

  var html = {
    css: '',
    js : ''
  };

  var urls = {
    css: '',
    js : ''
  };

  var renderedFiles;

  var preload = function(files){
    renderedFiles = files;
  };

  var renderJs = function(done){

    var files = _.map(assets.js, function(x){
      return opts.base + '/' + x;
    });

    var filename = 'script-' + new Date().getTime() + '.js';

    if(opts.key){
      filename = opts.key + '-' + filename;
    }

    var outf = opts.out + '/' + filename;

    var minified = UglifyJS.minify(files);
    fs.writeFileSync(outf, minified.code);
    renderedFiles.js = opts.outUrl + '/' + filename;
    done();
  };

  var renderCss = function(done){

    var filename = 'styles-' + new Date().getTime() + '.css';

    if(opts.key){
      filename = opts.key + '-' + filename;
    }

    var outf = opts.out + '/' + filename;

    var css = [];

    var renderOne = function(x, cb){
      var src = opts.base + '/' + x;
      less.render(
        fs.readFileSync(src, 'utf8'), {
          compress: true
        }, function (e, output) {
          css.push(output.css);
          cb();
        });
    };

    async.eachSeries(
      assets.css,
      renderOne,
      function(err, res){
        var s = css.join("\n");
        fs.writeFileSync(outf, s);
        renderedFiles.css = opts.outUrl + '/' + filename;
        done();
    });

  };

  var render = function(done){

    renderedFiles = {};

    var checkdir = function(next){

      var d = fs.existsSync(opts.out);
      if(!d){
        fs.mkdirSync(opts.out);
      }
      return next();

    };

    var cleandir = function(next){

      var files;
      var dirpath = opts.out;
      try {
        files = fs.readdirSync(dirpath);
      } catch(e) {
        return next();
      }

      if (files.length === 0) {
        return next();
      }

      for (var i = 0; i < files.length; i++) {
        if(opts.key && files[i].substr(0, opts.key.length) !== opts.key){
          continue;
        }
        var filepath = dirpath + '/' + files[i];
        if (fs.statSync(filepath).isFile()) {
          fs.unlinkSync(filepath);
        }
      }
      next();
    };

    async.series([
      checkdir,
      cleandir,
      renderJs,
      renderCss
    ], function(){
      done(null, renderedFiles);
    });

  };

  var gen = function(){
    html.css = _.map(assets.css, function(x){
      if(x.substr(-5) === '.less'){
        return '<link rel="stylesheet" href="' + opts.url + '' + x.slice(0, -5) + '.css' + '" />';
      }
      return '<link rel="stylesheet" href="' + opts.url + '' + x + '" />';
    }).join("\n");

    html.js = _.map(assets.js, function(x){
      return '<script type="text/javascript" src="' + opts.url + '' + x + '"></script>';
    }).join("\n");
  };

  var add = function(f){

    if(f.substr(0,1) === '/'){
      f = f.substr(1);
    }

    var src = opts.base + '/' + f;

    if(fs.lstatSync(src).isDirectory()){
      fs.readdirSync(src).forEach(function(file) {
        if (file.substr(0,1) === '.' ) {
          return;
        }
        if ( file.substr(0,1) === '#' ) {
          return;
        }
        add(f + '/' + file);
      });
    }

    if(f.substr(-3) === '.js'){
      assets.js.push(f);
    }

    if(f.substr(-4) === '.css'){
      assets.css.push(f);
    }

    if(f.substr(-5) === '.less'){
      assets.css.push(f);
    }

    gen();

  };

  var js = function(){
    if(renderedFiles){
      return '<script type="text/javascript" src="' + renderedFiles.js + '"></script>';
    }
    return html.js;
  };

  var css = function(){
    if(renderedFiles){
      return '<link rel="stylesheet" href="' + renderedFiles.css + '" />';
    }
    return html.css;
  };

  return {
    add: add,
    css: css,
    js: js,
    render: render,
    preload: preload
  };
};

var load = function(manifests){

  var files = {};
  var keys = {};
  _.each(manifests, function(manifest, key){
    keys[key] = {};
    keys[key] = create(manifest.opts);
    _.each(manifest.assets, function(f){
      keys[key].add(f);
    });
    keys[key].key = key;
  });

  var renderOne = function(key, next){
    key.render(function(err, res){
      files[key.key] = res;
      next();
    });
  };

  var render = function(target, done){
    if(arguments.length === 1){
      done = target;
      target = false;
    }

    async.eachSeries(
      _.toArray(keys),
      renderOne,
      function(){
        if(target){
          fs.writeFileSync(
            target,
            JSON.stringify(files)
          );
        }
        done();
      });
  };

  var preload = function(assets){
    _.each(assets, function(files, key){
      keys[key].preload(files);
    });
  };

  return {
    keys: keys,
    render: render,
    preload: preload
  };

};

module.exports = {
  create: create,
  load: load
};
