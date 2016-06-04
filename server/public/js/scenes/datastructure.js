/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.datastructure = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.datastructure.prototype = Object.create(Scene.prototype);

Scenes.datastructure.prototype.title = 'Data Structure';

Scenes.datastructure.prototype.genAttrs = function(){
  return {
    ttl: 128,
    rows: 2,
    cols: 2,
    
  };
};

Scenes.datastructure.prototype.init = function(){
}

Scenes.datastructure.prototype.defaults = [{
  key: 'max_x',
  value: 480,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 480,
  min: 32,
  max: 1024
}];


Scenes.datastructure.prototype.update = function(delta){

}

Scenes.datastructure.prototype.paint = function(fx, gx, sx){

  var ww = this.opts.max_x / this.attrs.rows;
  var hh = this.opts.max_y / this.attrs.cols;

  gx.ctx.save();


  gx.ctx.restore();

  
}
