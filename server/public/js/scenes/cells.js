/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.cells = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.cells.prototype = Object.create(Scene.prototype);

Scenes.cells.prototype.title = 'Cells';

Scenes.cells.prototype.layout = '';

Scenes.cells.prototype.init = function(){

  this.memory = [];
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    this.memory.push([true, true, true, true]);
  }
  
}

Scenes.cells.prototype.getCast = function(){
  return {
  }
};

Scenes.cells.prototype.defaults = [{
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
  value: 8,
  min: 3,
  max: 24
}, {
  key: 'cols',
  value: 8,
  min: 8,
  max: 32
}, {
  key: 'duration',
  value: 60,
  min: 1,
  max: 120
}];

Scenes.cells.prototype.genAttrs = function(){
  return {
    time: 0,
    index: 0,
    value: 0,
    duration: this.opts.duration,
  };
};

Scenes.cells.prototype.update = function(delta){
  // this.attrs.time += this.env.diff * 0.5
  // if (this.attrs.time > this.attrs.duration) {
  //   this.attrs.time = 0;
  //   this.attrs.index ++;
  //   if(this.attrs.index === this.memory.length){
  //     this.attrs.index = 0;
  //   }
  //   this.memory[this.attrs.index] = (Math.floor(Math.random() * 256));
  // }
  }

Scenes.cells.prototype.drawCap = function(gx, charge){


}


Scenes.cells.prototype.paint = function(fx, gx, sx){

  var ww = this.opts.max_x / this.opts.rows;
  var hh = this.opts.max_y / this.opts.cols;

  gx.ctx.save();
  
  gx.ctx.lineWidth = 6;
  gx.ctx.strokeStyle = 'rgba(255,0,0,' + (0.5-(Math.sin(Math.PI * (Date.now()%2000)/1000)/2)) + ')';

  var x, y;
  
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    x = i % this.opts.cols;
    y = Math.floor(i / this.opts.rows);

    var val = this.memory[i];

    gx.ctx.save();
    gx.ctx.translate(ww * x * 0.1, hh * y * 0.1);
    gx.ctx.scale(0.9, 0.9);
    
    if(val[0]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww),
        (y * hh)
      )
      gx.ctx.lineTo(
        (x * ww) + ww,
        (y * hh)
      )
      gx.ctx.stroke();
    }

    if(val[1]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww) + ww,
        (y * hh)
      )
      gx.ctx.lineTo(
        (x * ww) + ww,
        (y * hh) + hh
      )
      gx.ctx.stroke();
    }

    if(val[2]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww) + ww,
        (y * hh) + hh
      )
      gx.ctx.lineTo(
        (x * ww) ,
        (y * hh) + hh
      )
      gx.ctx.stroke();
    }

    if(val[3]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww),
        (y * hh) + hh
      )
      gx.ctx.lineTo(
        (x * ww),
        (y * hh)
      )
      gx.ctx.stroke();
    }

    gx.ctx.restore();

  }

  gx.ctx.restore();
 
}
