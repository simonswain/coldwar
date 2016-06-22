/* global Scenes */

Scenes.array = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.array.prototype = Object.create(Scene.prototype)

Scenes.array.prototype.title = 'Array'

Scenes.array.prototype.init = function () {
  this.memory = [];
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    this.memory.push({});
  }
  this.index = 0;
}

Scenes.array.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 480,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 480,
  min: 100,
  max: 1000
}, {
  key: 'rows',
  value: 2,
  min: 3,
  max: 24
}, {
  key: 'cols',
  value: 2,
  min: 8,
  max: 32
}]

Scenes.array.prototype.genAttrs = function () {
  return {
  }
}

Scenes.array.prototype.update = function (delta) {
  this.index += delta * 0.05;
  if(this.index >= this.memory.length){
    this.index -= this.memory.length;
  }
}

Scenes.array.prototype.paint = function (fx, gx, sx) {
  var ww = (this.opts.max_x / this.opts.rows) / 2;
  var hh = (this.opts.max_y / this.opts.cols) / 2;

  gx.ctx.save();
  
  gx.ctx.lineWidth = 1;

  var x, y;
  var ix = Math.floor(this.index);
  
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    x = i % this.opts.cols;
    y = Math.floor(i / this.opts.rows);
    gx.ctx.save();
    gx.ctx.translate(this.opts.max_x/2 - (ww * this.opts.rows/2), this.opts.max_y * 0.1)
    gx.ctx.strokeStyle = '#f00'; 
    gx.ctx.fillStyle = (ix === i) ? '#f00' : '#000';
    gx.ctx.beginPath();
    gx.ctx.fillRect((x * ww), (y * hh), ww, hh); 
    gx.ctx.rect((x * ww), (y * hh), ww, hh);
    gx.ctx.stroke();

    gx.ctx.fillStyle = (ix === i) ? '#000' : '#f00';
    gx.ctx.font = '24pt robotron';
    gx.ctx.textAlign = 'center';
    gx.ctx.textBaseline = 'middle';
    gx.ctx.fillText(
      i,
      (x * ww) + ww*0.5,
      (y * hh) + hh/2
    );

    gx.ctx.restore();

    gx.ctx.save();
    gx.ctx.translate(0, this.opts.max_y * 0.7) 
    gx.ctx.fillStyle = (ix === i) ? '#0f0' : '#000';
    gx.ctx.strokeStyle = '#0f0'; 
    gx.ctx.beginPath();
    gx.ctx.fillRect((i * ww), 0, ww, hh);
    gx.ctx.rect((i * ww), 0, ww, hh);
    gx.ctx.stroke();

    gx.ctx.fillStyle = (ix === i) ? '#000' : '#0f0';
    gx.ctx.font = '24pt robotron';
    gx.ctx.textAlign = 'center';
    gx.ctx.textBaseline = 'middle';
    gx.ctx.fillText(
      i,
      (i * ww) + ww*0.5,
      hh/2
    );

    gx.ctx.restore();
        
  }

  gx.ctx.restore();
}
