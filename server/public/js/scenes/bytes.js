/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.bytes = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.bytes.prototype = Object.create(Scene.prototype);

Scenes.bytes.prototype.title = 'Bytes';

Scenes.bytes.prototype.layout = '';

Scenes.bytes.prototype.init = function(){

  this.memory = [];
  for(var i = 0; i < 8; i++){
    this.memory.push(Math.floor(Math.random() * 256));
  }
  
}

Scenes.bytes.prototype.getCast = function(){
  return {
  }
};

Scenes.bytes.prototype.defaults = [{
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

Scenes.bytes.prototype.genAttrs = function(){
  return {
    time: 0,
    value: 0,
    duration: this.opts.duration,
  };
};

Scenes.bytes.prototype.update = function(delta){
  this.attrs.time += this.env.diff * 0.5
  if (this.attrs.time > this.attrs.duration) {
    this.attrs.time = 0;
    var i = Math.floor(Math.random() * 8);
    this.memory[i] = (Math.floor(Math.random() * 256));
  }
  
}

Scenes.bytes.prototype.drawCap = function(gx, charge){

  gx.ctx.save();
  gx.ctx.translate(-this.opts.max_x * 0.5, -this.opts.max_y * 0.5);

  gx.ctx.strokeStyle = '#0ff';
  gx.ctx.lineWidth = 16;

  gx.ctx.fillStyle = 'rgba(255,0,255,' + charge + ')';
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

  gx.ctx.restore();
  
}


Scenes.bytes.prototype.paint = function(fx, gx, sx){

  gx.ctx.save();
  gx.ctx.translate(0, this.opts.max_y * 0.075);

  var value;
  for(var i = 0; i < this.memory.length; i++){
    for(var j = 0; j < 8; j++){
      gx.ctx.save();
      gx.ctx.translate((this.opts.max_x / 10) * (8-j), this.opts.max_y * 0.12 * i);
      gx.ctx.scale(0.15, 0.15);
      value = (this.memory[i] & Math.pow(2, j));
      this.drawCap(gx, value);
      gx.ctx.restore()
    }

    gx.ctx.fillStyle = '#fff';
    gx.ctx.lineStyle = '#fff';
    gx.ctx.font='32px robotron';
    gx.ctx.textAlign='center';
    gx.ctx.textBaseline='middle';
    gx.ctx.fillText(
      ((this.memory[i]<16)? '0' : '') + this.memory[i].toString(16).toUpperCase(),
      this.opts.max_x * 0.9,
      this.opts.max_y * 0.12 * i
    );

  }

  gx.ctx.restore();
  
}
