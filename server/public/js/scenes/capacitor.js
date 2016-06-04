/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.capacitor = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.capacitor.prototype = Object.create(Scene.prototype);

Scenes.capacitor.prototype.title = 'Capacitor';

Scenes.capacitor.prototype.layout = '';

Scenes.capacitor.prototype.init = function(){

}

Scenes.capacitor.prototype.getCast = function(){
  return {
  }
};

Scenes.capacitor.prototype.defaults = [{
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
}, {
  key: 'duration',
  value: 60,
  min: 1,
  max: 120
}];

Scenes.capacitor.prototype.genAttrs = function(){
  return {
    time: 0,
    duration: this.opts.duration,
  };
};

Scenes.capacitor.prototype.update = function(delta){
  this.attrs.time += this.env.diff / 50
  if (this.attrs.time > this.attrs.duration) {
    this.attrs.time = 0;
  }
  
}

Scenes.capacitor.prototype.paint = function(fx, gx, sx){

  gx.ctx.strokeStyle = '#0ff';
  gx.ctx.lineWidth = 16;

  var a = 1-(this.attrs.time / this.attrs.duration);
  gx.ctx.fillStyle = 'rgba(255,0,255,' + a + ')';
  gx.ctx.beginPath();
  gx.ctx.fillRect(
    this.opts.max_x * 0.3,
    this.opts.max_y * 0.4,    
    this.opts.max_x * 0.4,
    this.opts.max_y * 0.2    
  )

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.5, this.opts.max_y * 0.2) 
  gx.ctx.lineTo(this.opts.max_x * 0.5, this.opts.max_y * 0.4)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.3, this.opts.max_y * 0.4) 
  gx.ctx.lineTo(this.opts.max_x * 0.7, this.opts.max_y * 0.4)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.3, this.opts.max_y * 0.6) 
  gx.ctx.lineTo(this.opts.max_x * 0.7, this.opts.max_y * 0.6)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.5, this.opts.max_y * 0.6) 
  gx.ctx.lineTo(this.opts.max_x * 0.5, this.opts.max_y * 0.8)
  gx.ctx.stroke();

  
}
