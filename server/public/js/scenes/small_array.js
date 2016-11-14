/* global Scenes */

Scenes.small_array = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.small_array.prototype = Object.create(Scene.prototype)

Scenes.small_array.prototype.title = 'Big Array'

Scenes.small_array.prototype.init = function () {
  this.memory = [];
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    this.memory.push({});
  }
  this.index = 0;
}

Scenes.small_array.prototype.defaults = [{
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
  value: 4,
  min: 3,
  max: 24
}, {
  key: 'cols',
  value: 4,
  min: 8,
  max: 32
}]

Scenes.small_array.prototype.genAttrs = function () {
  return {
  }
}

Scenes.small_array.prototype.update = function (delta) {
  this.index += delta * 0.25;
  if(this.index >= this.memory.length){
    this.index -= this.memory.length;
  }
}

Scenes.small_array.prototype.paint = function (fx, gx, sx) {
  var ww = (this.opts.max_x / this.opts.rows) / 2;
  var hh = (this.opts.max_y / this.opts.cols) / 2;
  var zz = (this.opts.max_x / (this.opts.rows * this.opts.rows));

  gx.ctx.save();
  gx.ctx.translate(0, this.opts.max_y * 0.05)
  
  gx.ctx.lineWidth = 1;

  var x, y;
  var ix = Math.floor(this.index);

  var xxx = ix % this.opts.cols;
  var yyy = Math.floor(ix / this.opts.rows);
  
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){

    x = i % this.opts.cols;
    y = Math.floor(i / this.opts.rows);
    
    gx.ctx.save();
    gx.ctx.translate(this.opts.max_x/2 - (ww * this.opts.rows/2), this.opts.max_y * 0.1)

    if(x === 0){
      gx.ctx.fillStyle = (yyy === y) ? '#fff' : '#f00';
      gx.ctx.font = '8pt robotron';
      gx.ctx.textAlign = 'center';
      gx.ctx.textBaseline = 'middle';
      gx.ctx.fillText(
        y,
        x - (ww * 0.5),
        (y * hh) + hh/2
      );
    }

    if(y === 0){
      gx.ctx.fillStyle = (xxx == x) ? '#fff' : '#f00';
      gx.ctx.font = '8pt robotron';
      gx.ctx.textAlign = 'center';
      gx.ctx.textBaseline = 'middle';
      gx.ctx.fillText(
        x,
        (x * ww) + ww * 0.5,
        - hh * 0.5
      );
    }

    gx.ctx.strokeStyle = '#f00'; 
    gx.ctx.fillStyle = (ix === i) ? '#f00' : '#000';
    gx.ctx.beginPath();
    gx.ctx.fillRect((x * ww), (y * hh), ww, hh); 
    gx.ctx.rect((x * ww), (y * hh), ww, hh);
    gx.ctx.stroke();

    gx.ctx.fillStyle = (ix === i) ? '#000' : '#f00';
    gx.ctx.font = '8pt robotron';
    gx.ctx.textAlign = 'center';
    gx.ctx.textBaseline = 'middle';
    gx.ctx.fillText(
      i,
      (x * ww) + ww*0.5,
      (y * hh) + hh/2
    );

    gx.ctx.restore();

    gx.ctx.save();
    gx.ctx.translate(0, this.opts.max_y * 0.8) 
    gx.ctx.fillStyle = (ix === i) ? '#0f0' : '#000';
    gx.ctx.strokeStyle = '#0f0'; 
    gx.ctx.beginPath();
    gx.ctx.fillRect((i * zz), 0, zz, zz);
    gx.ctx.rect((i * zz), 0, zz, zz);
    gx.ctx.stroke();


    gx.ctx.fillStyle = (ix === i) ? '#000' : '#0f0';
    gx.ctx.font = '8pt robotron';
    gx.ctx.textAlign = 'center';
    gx.ctx.textBaseline = 'middle';
    gx.ctx.fillText(
      i,
      (i * zz) + zz * 0.5,
      zz/2
    );
    
    gx.ctx.restore();
        
  }

  x = ix % this.opts.cols;
  y = Math.floor(ix / this.opts.rows);

  gx.ctx.fillStyle ='#fff';
  gx.ctx.font = '16pt robotron';
  gx.ctx.textAlign = 'left';
  gx.ctx.textBaseline = 'middle';
  gx.ctx.fillText(
    '(' + y + ' * ' + this.opts.cols + ') + ' + x + ' = ' + ix, 
    //'ix = (y * w) + x',
    this.opts.max_x * 0.28,
    this.opts.max_y * 0.70
  );

  
  gx.ctx.restore();
}
