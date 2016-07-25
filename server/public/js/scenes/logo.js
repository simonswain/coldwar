/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.logo = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.logo.prototype = Object.create(Scene.prototype);

Scenes.logo.prototype.title = 'Logo';

Scenes.logo.prototype.layout = '';

Scenes.logo.prototype.init = function(){

  this.memory = [];
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    this.memory.push([true, true, true, true]);
  }
  
}

Scenes.logo.prototype.getCast = function(){
  return {
  }
};

Scenes.logo.prototype.defaults = [{
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
}, {
  key: 'scale',
  value: 250,
  min: 50,
  max: 500
}];

Scenes.logo.prototype.genAttrs = function(){
  return {
    time: 0,
    index: 0,
    value: 0,
    duration: this.opts.duration,
  };
};

Scenes.logo.prototype.update = function(delta){
}

Scenes.logo.prototype.paint = function(fx, gx, sx){

  var z = this.opts.scale;

  var alpha = (0.5-(Math.sin(Math.PI * (Date.now()%4000)/2000)/2));

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x/2, this.opts.max_y/2)

  if(Math.random() < 0.1){
    //gx.ctx.rotate(Math.random() * Math.PI);
  }
  
  //gx.ctx.scale(this.opts.scale, this.opts.scale);
  gx.ctx.fillStyle = 'rgba(255,0,0,' + alpha + ')';
  //gx.ctx.fillStyle = '#f00';
  
  // if(Math.random() < 0.1){
  //   gx.ctx.fillStyle = '#000';
  // }
  
  gx.ctx.beginPath();
  gx.ctx.arc(-0.2 * z, -0.5 * z, 0.15 * z, 0, 2*Math.PI);
  gx.ctx.fill();

  gx.ctx.beginPath();
  gx.ctx.arc(0.2 * z, -0.5 * z, 0.15 * z, 0, 2*Math.PI);
  gx.ctx.fill();
  
  gx.ctx.fillStyle = '#000';
  gx.ctx.beginPath();
  gx.ctx.arc(-0.1 * z, -0.6 * z, 0.24 * z, 0, 2*Math.PI);
  gx.ctx.fill();

  gx.ctx.fillStyle = '#000';
  gx.ctx.beginPath();
  gx.ctx.arc(0.1 * z, -0.6 * z, 0.24 * z, 0, 2*Math.PI);
  gx.ctx.fill();
 
  gx.ctx.strokeStyle = 'rgba(255,0,0,' + alpha + ')';
  //gx.ctx.strokeStyle = '#f00';
  gx.ctx.lineCap='round';
  gx.ctx.lineWidth = 4

  gx.ctx.beginPath();
  gx.ctx.moveTo(-0.18*z, - 0.1 * z);
  gx.ctx.lineTo(-0.75*z, - 0.25 * z);
  gx.ctx.stroke();
 
  gx.ctx.beginPath();
  gx.ctx.moveTo(0.18*z, - 0.1 * z);
  gx.ctx.lineTo(0.75*z, - 0.25 * z);
  gx.ctx.stroke();
 
  // -
  gx.ctx.beginPath();
  gx.ctx.moveTo(-0.2*z, 0);
  gx.ctx.lineTo(-1*z, 0);
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(0.2*z, 0);
  gx.ctx.lineTo(1*z, 0);
  gx.ctx.stroke();
  
  // /
  gx.ctx.beginPath();
  gx.ctx.moveTo(-0.18*z, 0.1 * z);
  gx.ctx.lineTo(-0.75*z, 0.25 * z);
  gx.ctx.stroke();
 
  gx.ctx.beginPath();
  gx.ctx.moveTo(0.18*z, 0.1 * z);
  gx.ctx.lineTo(0.75*z, 0.25 * z);
  gx.ctx.stroke();

  gx.ctx.restore();

  // gx.ctx.fillStyle = 'rgba(255,0,0,' + alpha + ')';
  // gx.ctx.font = '18pt robotron';
  // gx.ctx.textAlign='center'
  // gx.ctx.baseline='middle'
  // gx.ctx.fillText('Rats of the Maze', this.opts.max_x * 0.5, this.opts.max_y * 0.7);

  // gx.ctx.fillStyle = '#fff';
  // gx.ctx.font = '18pt ubuntu mono';
  // gx.ctx.textAlign='center'
  // gx.ctx.baseline='middle'
  // gx.ctx.fillText('@simon_swain', this.opts.max_x * 0.5, this.opts.max_y * 0.8);
    
}
