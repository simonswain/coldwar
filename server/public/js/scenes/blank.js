/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.blank = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.blank.prototype = Object.create(Scene.prototype);

Scenes.blank.prototype.title = 'Blank';

Scenes.blank.prototype.layout = '';

Scenes.blank.prototype.init = function(){
}


Scenes.blank.prototype.getCast = function(){
  return {
  }
};

Scenes.blank.prototype.defaults = [{
  key: 'max_x',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'max_z',
  value: 1,
  min: 1,
  max: 1
}];

Scenes.blank.prototype.genAttrs = function(){
  return {
  };
};

Scenes.blank.prototype.update = function(delta){
}

Scenes.blank.prototype.paint = function(fx, gx, sx){
}
