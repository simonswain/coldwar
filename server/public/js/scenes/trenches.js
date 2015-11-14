/*global Scenes:true, Scene:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.trenches = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.trenches.prototype = Object.create(Scene.prototype);

Scenes.trenches.prototype.title = 'Trenches';

Scenes.trenches.prototype.init = function(){
};


Scenes.trenches.prototype.getCast = function(){
  return {
  };
};

Scenes.trenches.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 480,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 480,
  min: 100,
  max: 1000
}, {
  key: 'max_z',
  info: 'Max Z',
  value: 100,
  min: 50,
  max: 500
}];

Scenes.trenches.prototype.genAttrs = function(){
  return {
  };
};

Scenes.trenches.prototype.update = function(delta){
};

Scenes.trenches.prototype.paint = function(fx, gx){
};

Scenes.trenches.prototype.getHelp = function(){
  return '';
};

