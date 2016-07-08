/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.sorter = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.sorter.prototype = Object.create(Scene.prototype);

Scenes.sorter.prototype.title = 'Sorter';

Scenes.sorter.prototype.layout = '';

Scenes.sorter.prototype.init = function(){
  this.memory = [];
  for(var i = 0; i < 20; i++){
    this.memory.push(2+Math.floor((Math.random() * 14)+1));
  }
  console.log(this.memory);

  var length = this.memory.length;
  var h = 1;
  while( h < length / 3){
    h = 3 * h + 1;
  }
  this.h = h;
  this.i = h;
}

Scenes.sorter.prototype.getCast = function(){
  return {
  }
};

Scenes.sorter.prototype.defaults = [{
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

Scenes.sorter.prototype.genAttrs = function(){
  return {
    time: 0,
    index: 0,
    value: 0,
    scan: 0,
    duration: this.opts.duration,
  };
};

Array.prototype.swap = function (x,y) {
  var b = this[x];
  this[x] = this[y];
  this[y] = b;
  return this;
}

Scenes.sorter.prototype.update = function(delta){

  this.attrs.time += this.env.diff * 1
  if (this.attrs.time > this.attrs.duration) {
    this.attrs.time = 0;
    
    if(this.h > 0){
      var i = this.i;
      if(i<this.memory.length){
        for ( var j = i; j > 0 && this.memory[j] < this.memory[j-this.h]; j-=this.h){
          this.memory.swap(j, j-this.h);
        }
        this.i ++;
      } else {
        this.h = --this.h / 3
        this.i = this.h
      }
    } else {
      this.init();
    }
   
  }

}

Scenes.sorter.prototype.drawCap = function(gx, charge){

  gx.ctx.save();

  gx.ctx.fillStyle = 'rgba(255,0,255, 0.5)';
  //gx.ctx.fillStyle = 'rgba(255,0,255,' + charge + ')';
  gx.ctx.strokeStyle = '#000';
  gx.ctx.lineWidth = 32;

  gx.ctx.beginPath();
  gx.ctx.fillRect(
    this.opts.max_x * 0.25,
    this.opts.max_y * 0.25,    
    this.opts.max_x * 0.4,
    this.opts.max_y * 0.2    
  )

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.45, this.opts.max_y * 0.1) 
  gx.ctx.lineTo(this.opts.max_x * 0.45, this.opts.max_y * 0.25)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.25, this.opts.max_y * 0.25) 
  gx.ctx.lineTo(this.opts.max_x * 0.65, this.opts.max_y * 0.25)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.25, this.opts.max_y * 0.45) 
  gx.ctx.lineTo(this.opts.max_x * 0.65, this.opts.max_y * 0.45)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.45, this.opts.max_y * 0.45) 
  gx.ctx.lineTo(this.opts.max_x * 0.45, this.opts.max_y * 0.6)
  gx.ctx.stroke();

  gx.ctx.restore();
  
}


Scenes.sorter.prototype.paint = function(fx, gx, sx){

  gx.ctx.save();

  // gx.ctx.fillStyle = 'rgba(255,0,255, 0.2)';
  // gx.ctx.beginPath();
  // gx.ctx.fillRect(
  //   0, 0,    
  //   this.opts.max_x,
  //   this.opts.max_y    
  // )
  
  var value;

  var ww = this.opts.max_x / 20;
  var hh = this.opts.max_y * 0.05;
  var hhw = this.opts.max_y / 16;
  var scan = 0;
  var base;
  for(var i = 0; i < this.memory.length; i++){

    if(i === this.i){
      gx.ctx.fillStyle = 'rgba(255,0,255, 0.2)';
      gx.ctx.beginPath();
      gx.ctx.fillRect(
        0, hh * i,    
        this.opts.max_x,
        hh    
      )
    }

    for(var j = 0; j < 16; j++) {
      base = 8 - this.memory[i]/2
      value = (j >= base && j < this.memory[i] + base);
        gx.ctx.fillStyle = 'rgba(255,0,255, 0.5)';
      if(value){
        gx.ctx.beginPath();
        gx.ctx.fillRect(ww*2 + (ww * j), hh * i, ww, hh)
      }
      gx.ctx.save();
      gx.ctx.translate(ww*2 + (ww * j), hh * i);
      gx.ctx.scale(0.07, 0.07);
      this.drawCap(gx);
      gx.ctx.restore()

      scan ++;
    }
   
  }


  gx.ctx.restore();
  
}
