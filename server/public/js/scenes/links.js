/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.links = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.links.prototype = Object.create(Scene.prototype);

Scenes.links.prototype.title = 'Links';

Scenes.links.prototype.layout = '';

Scenes.links.prototype.init = function(){
  this.ix = 0;
  this.memory = [];
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    this.memory.push([true, true, true, true]);
  }
  this.cage = new Actors.Cage(
    this.env, {
      scene: this
    }, {
    });
    
}

Scenes.links.prototype.getCast = function(){
  return {
  }
};

Scenes.links.prototype.defaults = [{
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

Scenes.links.prototype.genAttrs = function(){
  return {
    time: 0,
    index: 0,
    value: 0,
    duration: this.opts.duration,
  };
};

Scenes.links.prototype.update = function(delta){

  this.cage.update(delta)

  if(this.cage.rats.length < 2 && Math.random() < 0.05){
    this.cage.addRat();
  }
  
  this.attrs.time += delta * 0.05;
  if(this.attrs.time > 1){
    this.attrs.time -= 1;
    this.ix ++;
    if(this.ix > 3){
      this.ix = 0;
    }
  }

}

Scenes.links.prototype.paint = function(fx, gx, sx){

  this.cage.paint(gx)

  var ww = this.opts.max_x / this.opts.rows;
  var hh = this.opts.max_y / this.opts.cols;

  fx.ctx.save();
  fx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  fx.ctx.scale(0.9, 0.9);

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  gx.ctx.scale(0.9, 0.9);
  
  gx.ctx.lineWidth = 6;
  gx.ctx.strokeStyle = '#f00';

  var points = [1, 5, 7, 3];

  fx.ctx.lineWidth = 6;
  gx.ctx.lineWidth = 6;
  
  var x, y;
  
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    x = i % this.opts.cols;
    y = Math.floor(i / this.opts.rows);
    var yy, xx;
    gx.ctx.save();
    
    ;    
    if(i === 4){
      gx.ctx.strokeStyle = '#f00';
      gx.ctx.fillStyle = '#f00';
      gx.ctx.beginPath();
      gx.ctx.rect((x * ww), (y * hh), ww, hh);
      gx.ctx.fill();
      gx.ctx.stroke();

      // gx.ctx.fillStyle = '#000';
      // gx.ctx.font = '48pt robotron';
      // gx.ctx.textAlign='center';
      // gx.ctx.textBaseline='middle';
      //gx.ctx.fillText(i, ww/2 + x * ww, hh/2 + y * hh);
    } else if(points[this.ix] === i){

      fx.ctx.strokeStyle = '#ff0';
      fx.ctx.beginPath();
      fx.ctx.rect((x * ww), (y * hh), ww, hh);
      fx.ctx.fill();
      fx.ctx.stroke();
      fx.ctx.fill();
      
      // gx.ctx.strokeStyle = '#ff0';
      // gx.ctx.beginPath();
      // gx.ctx.rect((x * ww), (y * hh), ww, hh);
      // gx.ctx.stroke();

      // gx.ctx.fillStyle = '#ff0';
      // gx.ctx.font = '48pt robotron';
      // gx.ctx.textAlign='center';
      // gx.ctx.textBaseline='middle';
      //gx.ctx.fillText(i, ww/2 + x * ww, hh/2 + y * hh);
      
      xx = x;
      yy = y;
      

    } else { 
      // gx.ctx.strokeStyle = '#f00'; 
      // gx.ctx.beginPath();
      // gx.ctx.rect((x * ww), (y * hh), ww, hh);
      // gx.ctx.stroke();

      // gx.ctx.fillStyle = '#fff';
      // gx.ctx.font = '48pt robotron';
      // gx.ctx.textAlign='center';
      // gx.ctx.textBaseline='middle';
      // gx.ctx.fillText(i, ww/2 + x * ww, hh/2 + y * hh);

    }

    gx.ctx.restore();
    
  }

  gx.ctx.strokeStyle = '#ff0';
  gx.ctx.beginPath();
  gx.ctx.rect((xx * ww), (yy * hh), ww, hh);
  gx.ctx.stroke();

  fx.ctx.strokeStyle = '#ff0';
  fx.ctx.beginPath();
  fx.ctx.rect((xx * ww), (yy * hh), ww, hh);
  fx.ctx.stroke();
  
  gx.ctx.save();
  gx.ctx.translate(ww * 1.5, hh * 1.5);   
  gx.ctx.rotate( Math.PI / 2 * this.ix - Math.PI/2);   
  gx.ctx.lineCap='round';
  gx.ctx.strokeStyle = '#fff'; 
  gx.ctx.beginPath();
  gx.ctx.moveTo(ww * 0.25, 0)
  gx.ctx.lineTo(ww * 0.75, 0)
  gx.ctx.stroke();      
  gx.ctx.moveTo(ww * 0.65, - hh * 0.1)
  gx.ctx.lineTo(ww * 0.75, 0)
  gx.ctx.stroke();      
  gx.ctx.moveTo(ww * 0.65, hh * 0.1)
  gx.ctx.lineTo(ww * 0.75, 0)
  gx.ctx.stroke();      

  // gx.ctx.fillStyle = '#fff';
  // gx.ctx.font = '24pt robotron';
  // gx.ctx.textAlign='center';
  // gx.ctx.textBaseline='middle';
  // gx.ctx.fillText(points[this.ix], ww/3, - hh/5);

  gx.ctx.restore();

  
  gx.ctx.restore();

  fx.ctx.restore();

}
