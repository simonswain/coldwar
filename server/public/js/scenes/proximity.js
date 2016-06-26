/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.proximity = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.proximity.prototype = Object.create(Scene.prototype);

Scenes.proximity.prototype.title = 'Proximity';

Scenes.proximity.prototype.layout = '';

Scenes.proximity.prototype.init = function(){
  this.ix = 0;
}

Scenes.proximity.prototype.getCast = function(){
  return {
  }
};

Scenes.proximity.prototype.defaults = [{
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
  value: 3,
  min: 3,
  max: 24
}, {
  key: 'cols',
  value: 3,
  min: 8,
  max: 32
}, {
  key: 'duration',
  value: 60,
  min: 1,
  max: 120
}];

Scenes.proximity.prototype.genAttrs = function(){
  return {
    time: 0,
    index: 0,
    value: 0,
    duration: this.opts.duration,
  };
};

Scenes.proximity.prototype.update = function(delta){
  this.attrs.time += delta * 0.05;
  if(this.attrs.time > 1){
    this.attrs.time -= 1;
    this.ix ++;
    if(this.ix > 3){
      this.ix = 0;
    }
  }
}

Scenes.proximity.prototype.paint = function(fx, gx, sx){
  var ww = this.opts.max_x / this.opts.rows;
  var hh = this.opts.max_y / this.opts.cols;

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  gx.ctx.scale(0.9, 0.9);
  
 
  var points = [1, 5, 7, 3];
  
  var x, y;
  var yy, xx;

  // center
  gx.ctx.strokeStyle = '#f0f';
  gx.ctx.fillStyle = '#f0f';
  gx.ctx.beginPath();
  gx.ctx.rect(ww, hh, ww, hh);
  gx.ctx.fill();
  gx.ctx.stroke();

  gx.ctx.fillStyle = '#000';
  gx.ctx.font = '48pt robotron';
  gx.ctx.textAlign='center';
  gx.ctx.textBaseline='middle';
  gx.ctx.fillText(4, ww/2 + ww, hh/2 + hh);

  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    x = i % this.opts.cols;
    y = Math.floor(i / this.opts.rows);

    gx.ctx.lineWidth = 6;
    
    if (points[this.ix] === i){
      gx.ctx.strokeStyle = '#fff';
      gx.ctx.fillStyle = '#fff';
      gx.ctx.beginPath();
      gx.ctx.rect((x * ww), (y * hh), ww, hh);
      gx.ctx.fill();
      gx.ctx.stroke();

      gx.ctx.fillStyle = '#000';
      gx.ctx.font = '48pt robotron';
      gx.ctx.textAlign='center';
      gx.ctx.textBaseline='middle';
      gx.ctx.fillText(i, ww/2 + x * ww, hh/2 + y * hh);
      xx = x;
      yy = y;
    }
  }
  
  
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    x = i % this.opts.cols;
    y = Math.floor(i / this.opts.rows);

    gx.ctx.lineWidth = 6;
    
    if (points[this.ix] === i){
     gx.ctx.strokeStyle = '#0ff'; 
      gx.ctx.beginPath();
      gx.ctx.rect((x * ww), (y * hh), ww, hh);
      gx.ctx.stroke();
    } else { 
      gx.ctx.strokeStyle = '#0ff'; 
      gx.ctx.beginPath();
      gx.ctx.rect((x * ww), (y * hh), ww, hh);
      gx.ctx.stroke();

      gx.ctx.fillStyle = '#fff';
      gx.ctx.font = '48pt robotron';
      gx.ctx.textAlign='center';
      gx.ctx.textBaseline='middle';
      gx.ctx.fillText(i, ww/2 + x * ww, hh/2 + y * hh);

    }
  }

  gx.ctx.restore();
}
