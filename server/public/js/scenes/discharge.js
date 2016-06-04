/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.discharge = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.discharge.prototype = Object.create(Scene.prototype);

Scenes.discharge.prototype.title = 'Discharge';

Scenes.discharge.prototype.layout = '';

Scenes.discharge.prototype.init = function(){

  this.points = [];
  for(var i = 0; i < this.attrs.duration; i++){
    this.points.push(Math.exp(-i/(this.attrs.duration*0.37)));
  }

}

Scenes.discharge.prototype.getCast = function(){
  return {
  }
};

Scenes.discharge.prototype.defaults = [{
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

Scenes.discharge.prototype.genAttrs = function(){
  return {
    time: 0,
    duration: this.opts.duration,
  };
};

Scenes.discharge.prototype.update = function(delta){
  this.attrs.time += this.env.diff / 50
  if (this.attrs.time > this.attrs.duration) {
    this.attrs.time -= this.attrs.duration;
  }
  
}

Scenes.discharge.prototype.paint = function(fx, gx, sx){

  gx.ctx.strokeStyle = '#0ff';
  gx.ctx.lineWidth = 16;

  var a = 1-(this.attrs.time / this.attrs.duration);
  gx.ctx.fillStyle = 'rgba(255,0,255,' + a + ')';
  gx.ctx.beginPath();
  gx.ctx.fillRect(
    this.opts.max_x * 0.0,
    this.opts.max_y * 0.4,    
    this.opts.max_x * 0.4,
    this.opts.max_y * 0.2    
  )

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.2, this.opts.max_y * 0.2) 
  gx.ctx.lineTo(this.opts.max_x * 0.2, this.opts.max_y * 0.4)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.0, this.opts.max_y * 0.4) 
  gx.ctx.lineTo(this.opts.max_x * 0.4, this.opts.max_y * 0.4)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.0, this.opts.max_y * 0.6) 
  gx.ctx.lineTo(this.opts.max_x * 0.4, this.opts.max_y * 0.6)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.2, this.opts.max_y * 0.6) 
  gx.ctx.lineTo(this.opts.max_x * 0.2, this.opts.max_y * 0.8)
  gx.ctx.stroke();

  gx.ctx.strokeStyle = '#f0f';
  gx.ctx.fillStyle = '#f0f';
  gx.ctx.lineCap = 'round';


  // 0-1 boundary

  // gx.ctx.strokeStyle = '#666';
  // gx.ctx.lineWidth = 2;
  // gx.ctx.beginPath();
  // gx.ctx.moveTo(this.opts.max_x * 0.5, this.opts.max_y * 0.5) 
  // gx.ctx.lineTo(this.opts.max_x * 1, this.opts.max_y * 0.5)
  // gx.ctx.stroke();

  // chart
  
  var dx = 0.5 * this.opts.max_x / this.points.length;

  var ix;
  ix = Math.floor(this.attrs.time);
  gx.ctx.beginPath();

  var offset;
  for(var i = 0; i<this.attrs.duration*2; i++){
    ix = (Math.floor(this.attrs.time) + i) % this.points.length;
    gx.ctx.beginPath();
    a = 1-(ix / this.points.length);
    gx.ctx.fillStyle = 'rgba(255,0,255,' + a + ')';
    gx.ctx.arc(
      this.opts.max_x * 1.0 - (dx * i/2),
      (this.opts.max_y * 0.63) - (this.opts.max_y * 0.25 * this.points[ix]),
      4,
      0, 2*Math.PI
    );
    gx.ctx.fill();
  }

  gx.ctx.beginPath();
  gx.ctx.strokeStyle = '#cc0';
  gx.ctx.lineWidth = 2;
  
  for(var i = 0; i<this.attrs.duration*2; i++){

    ix = (Math.floor(this.attrs.time) + i) % this.points.length;
    
    if(ix === 0){
      gx.ctx.stroke();
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        this.opts.max_x * 1.0 - (dx * i/2),
        (this.opts.max_y * 0.5) + (this.opts.max_y * 0.125 * 1)
      ) 
      gx.ctx.lineTo(
        this.opts.max_x * 1.0 - (dx * i/2),
        (this.opts.max_y * 0.5) + (this.opts.max_y * 0.125 * -1)
      ) 
    }
    
    yy = this.points[ix] > 0.6 ? -1 : 1;
    gx.ctx.lineTo(
      this.opts.max_x * 1.0 - (dx * i/2),
      (this.opts.max_y * 0.5) + (this.opts.max_y * 0.125 * yy)
    ) 

  }
  gx.ctx.stroke();
  
  
}
