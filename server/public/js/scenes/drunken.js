/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.drunken = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.drunken.prototype = Object.create(Scene.prototype);

Scenes.drunken.prototype.title = 'Drunken';

Scenes.drunken.prototype.layout = '';

Scenes.drunken.prototype.init = function(){

  this.memory = [];
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    this.memory.push(true);
  }
  
}

Scenes.drunken.prototype.getCast = function(){
  return {
  }
};

Scenes.drunken.prototype.defaults = [{
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
  key: 'rows',
  value: 16,
  min: 3,
  max: 24
}, {
  key: 'cols',
  value: 16,
  min: 8,
  max: 32
}, {
  key: 'duration',
  value: 60,
  min: 1,
  max: 120
}];

Scenes.drunken.prototype.genAttrs = function(){
  return {
    x: Math.floor(this.opts.cols/2),
    y: Math.floor(this.opts.rows/2),
    time: 0,
    index: 0,
    value: 0,
    duration: this.opts.duration,
    failed: 0,
  };
};

Scenes.drunken.prototype.update = function(delta){

  var x = this.attrs.x
  var y = this.attrs.y
  var dx = x, dy = y;

  var fx = fy = (Math.random() < 0.5 ? 1 : -1);
  
  if(Math.random() < 0.5){
    dx += fx
    fy = 0
  }else{
    fx = 0
    dy += fy
  }

  if(dx < 0) {dx = 0}
  if(dx >= this.opts.rows) {dx = this.opts.rows-1} 
  if(dy < 0) {dy = 0}
  if(dy >= this.opts.cols){dy = this.opts.cols-1}

  this.memory[(this.opts.rows*y)+x] = false
  this.attrs.x = dx
  this.attrs.y = dy


  // if(this.memory[(this.opts.rows*dy)+dx]){
  //   this.memory[(this.opts.rows*y)+x] = false
  //   this.attrs.x = dx
  //   this.attrs.y = dy
  // } else {
  //   this.attrs.failed ++;
  // }

  // if(this.attrs.failed > 50 && ! this.env.gameover){
  //   this.env.gameover = true;
  //   setTimeout(this.env.restart, 1000)
  // }
 
  
}


Scenes.drunken.prototype.paint = function(fx, gx, sx){

  var ww = this.opts.max_x / this.opts.rows;
  var hh = this.opts.max_y / this.opts.cols;

  gx.ctx.save();
  
  var x, y;
  
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    x = i % this.opts.cols;
    y = Math.floor(i/this.opts.rows);
    if(this.memory[i]){
      gx.ctx.fillStyle = '#000';
      gx.ctx.strokeStyle = '#000';
    } else {
      gx.ctx.fillStyle = '#0f0';
      gx.ctx.strokeStyle = '#000';
    }

    gx.ctx.beginPath();
    gx.ctx.lineWidth = 2;
    gx.ctx.rect(
      x * ww,
      y * hh,
      ww,
      hh
    )
    gx.ctx.fill();
    gx.ctx.stroke();
  }

  // cursor
  x = this.attrs.x
  y = this.attrs.y

  if((Date.now()%1000) < 250){
    gx.ctx.fillStyle = '#fff';
    gx.ctx.strokeStyle = '#000';
  } else {
    gx.ctx.fillStyle = '#000';
    gx.ctx.strokeStyle = '#fff';
  }

  gx.ctx.beginPath();
  gx.ctx.lineWidth = 2;
  gx.ctx.rect(
    x * ww,
    y * hh,
    ww,
    hh
  )
  gx.ctx.fill();
  gx.ctx.stroke();

  // end cursor

  
  gx.ctx.restore();
  
}
