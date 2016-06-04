/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.byte = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.byte.prototype = Object.create(Scene.prototype);

Scenes.byte.prototype.title = 'Byte';

Scenes.byte.prototype.layout = '';

Scenes.byte.prototype.init = function(){

  this.caps = [];
  for(var i = 0; i < 8; i++){
    this.caps.push(0);
  }
  
}

Scenes.byte.prototype.getCast = function(){
  return {
  }
};

Scenes.byte.prototype.defaults = [{
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

Scenes.byte.prototype.genAttrs = function(){
  return {
    time: 0,
    value: 0,
    duration: this.opts.duration,
  };
};

Scenes.byte.prototype.update = function(delta){
  this.attrs.time += this.env.diff
  if (this.attrs.time > this.attrs.duration) {
    this.attrs.time = 0;

    this.attrs.value ++;
    if(this.attrs.value > 255){
      this.attrs.value = 0;
    }
    for(var i = 0; i < 8; i++){
      this.caps[i] = (this.attrs.value & Math.pow(2, i));
    }
  }
  
}

Scenes.byte.prototype.drawCap = function(gx, charge){

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

  gx.ctx.fillStyle = '#fff';
  gx.ctx.lineStyle = '#fff';
  gx.ctx.font='128px robotron';
  gx.ctx.textAlign='center';
  gx.ctx.textBaseline='middle';
  if(charge > 0){
    gx.ctx.fillText(
      charge.toString(16),
      this.opts.max_x * 0.5,
      this.opts.max_y * 1
    );
  }
  
}


Scenes.byte.prototype.paint = function(fx, gx, sx){

  for(var i = 0; i < 8; i++){
    gx.ctx.save();
    gx.ctx.translate((this.opts.max_x / 8) * (7-i), this.opts.max_y * 0.3);
    gx.ctx.scale(0.2, 0.2);
    this.drawCap(gx, this.caps[i]);
    gx.ctx.restore()
  }

  gx.ctx.fillStyle = '#fff';
  gx.ctx.lineStyle = '#fff';
  gx.ctx.font='64px robotron';
  gx.ctx.textAlign='center';
  gx.ctx.textBaseline='middle';
  gx.ctx.fillText(
    ((this.attrs.value<16)? '0' : '') + this.attrs.value.toString(16).toUpperCase(),
    this.opts.max_x * 0.5,
    this.opts.max_y * 0.7
  );
  
}
