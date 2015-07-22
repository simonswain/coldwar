/*global App:true */
/*jshint browser:true */
/*jshint strict:false */

var Scenes = {};

var App = function(){
  var self = this;
  this.view = null;

  this.el = document.getElementById('app');

  this.start = function(){
    this.bindKeys();
    this.render();
  };

  this.render = function(scene){

    if(this.view){
      this.view.stop();
    }

    var pairs, opts;
    opts = {};

    var path = window.location.pathname.split('/');
    if(path.pop() === 'attract'){
      this.view = new Scenes.attract(this.el);
      this.view.start();
      return;
    }

    if(window.location.search.substr(0,1) === '?'){
      pairs = window.location.search.substr(1).split('&');
      pairs.forEach(function(pair, ix){
        pair = pair.split('=');
        opts[pair[0]] = Number(pair[1]);
      });
    }

    this.view = new Scenes.coldwar(this.el, opts);
    this.view.start();
  };

  this.bindKeys = function(){
    var self = this;
    window.addEventListener("keydown", self.onKey.bind(this));
  };

  this.onKey = function(e){
    switch(e.which){
    case 9:
      // 'tab'
      e.preventDefault();
      this.view.toggleOpts();
      break;

    case 13:
      // 'cr'
      e.preventDefault();
      this.view.restart();
      break;

    case 27:
      // 'esc'
      e.preventDefault();
      this.view.hideHelp();
      break;

    case 48:
      // '0'
      e.preventDefault();
      this.view.resetZoom();
      break;

    case 96:
      // pad '0'
      e.preventDefault();
      this.view.resetZoom();
      break;

    case 220:
      // '\'
      e.preventDefault();
      if(this.view.hasOwnProperty('toggleMeta')){
        this.view.toggleMeta();
      }
      break;

    case 191:
      // '?'
      e.preventDefault();
      if(e.shiftKey && this.view.hasOwnProperty('toggleHelp')){
        this.view.toggleHelp();
      }
      break;
    }
  };

};

var app = new App();

document.addEventListener("DOMContentLoaded", function(event) {
  app.start();
});
