/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.crt = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.crt.prototype = Object.create(Scene.prototype);

Scenes.crt.prototype.title = 'Crt';

Scenes.crt.prototype.layout = '';

Scenes.crt.prototype.init = function(){

  this.memory = [];
  for(var i = 0; i < 16; i++){
    this.memory.push(Math.floor(Math.random() * 256));
  }
  
}

Scenes.crt.prototype.getCast = function(){
  return {
  }
};

Scenes.crt.prototype.defaults = [{
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

Scenes.crt.prototype.genAttrs = function(){
  return {
    time: 0,
    index: 0,
    value: 0,
    scan: 0,
    duration: this.opts.duration,
  };
};

Scenes.crt.prototype.update = function(delta){

  this.attrs.scan ++
  if(this.attrs.scan > (this.memory.length * 12)){
    this.attrs.scan = 0;
  }
  
  this.attrs.time += this.env.diff * 0.5
  if (this.attrs.time > this.attrs.duration) {
    this.attrs.time = 0;
    this.attrs.index ++;
    if(this.attrs.index === this.memory.length){
      this.attrs.index = 0;
    }
    this.memory[this.attrs.index] = (Math.floor(Math.random() * 4096));
  }
  
}

Scenes.crt.prototype.drawCap = function(gx, charge, shade){

  gx.ctx.save();

  if(!shade){
    gx.ctx.fillStyle = 'rgba(0, 255, 255, 0.25)';
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      0,
      0,    
      this.opts.max_x,
      this.opts.max_y    
    )
  }

  gx.ctx.strokeStyle = '#fff';
  gx.ctx.lineWidth = 32;

  if(shade){
    gx.ctx.strokeStyle = '#0ff';
    gx.ctx.lineWidth = 16;
  }

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

  if(shade){
    gx.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      0,
      0,    
      this.opts.max_x,
      this.opts.max_y    
    )
  }
  
  gx.ctx.restore();
  
}


Scenes.crt.prototype.paint = function(fx, gx, sx){

  gx.ctx.save();
  gx.ctx.translate(0, this.opts.max_y * 0.075);

  // gx.ctx.fillStyle = 'rgba(255,0,255, 0.2)';
  // gx.ctx.beginPath();
  // gx.ctx.fillRect(
  //   0, 0,    
  //   this.opts.max_x,
  //   this.opts.max_y    
  // )
  
  var value;

  var ww = this.opts.max_x / 16;
  var hhw = this.opts.max_y / 16;
  var scan = 0;
  for(var i = 0; i < this.memory.length; i++){
    for(var j = 0; j < 12; j++){

      gx.ctx.save();
      gx.ctx.translate(ww*2 + (ww * j), this.opts.max_y * 0.05 * (i+0.25));
      gx.ctx.scale(0.07, 0.07);
      value = (this.memory[i] & Math.pow(2, j));
      if (scan === this.attrs.scan){
        this.drawCap(gx, value);
      } else {
        this.drawCap(gx, value, true);
      }
      gx.ctx.restore()

      scan ++;
    }
   
  }


  gx.ctx.restore();
  
}
