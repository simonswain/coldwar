/*global App:true */
/*jshint browser:true */
/*jshint strict:false */

var Scenes = {};

var App = function(){
  var self = this;
  this.view = null;

  this.el = document.getElementById('app');

  this.start = function(){
    this.render();
  };

  this.render = function(scene){
    if(this.view){
      this.view.stop();
    }
    this.view = new Scenes.coldwar(this.el);
    this.view.start();
  };

};

var app = new App();

document.addEventListener("DOMContentLoaded", function(event) {
  app.start();
});
