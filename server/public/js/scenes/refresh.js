/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.refresh = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.refresh.prototype = Object.create(Scene.prototype);

Scenes.refresh.prototype.title = 'Refresh';

Scenes.refresh.prototype.layout = '';

Scenes.refresh.prototype.getCast = function(){
  return {
  }
};

Scenes.refresh.prototype.defaults = [{
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
  max: 240
}, {
  key: 'refresh',
  value: 15,
  min: 1,
  max: 120
}];

Scenes.refresh.prototype.genAttrs = function(){
  return {
    tick: 0,
    charge: 1,
    time: 0,
    duration: this.opts.duration,
    value: 0
  };
};

Scenes.refresh.prototype.init = function(){
  this.points = [];
  var point;
  var charge = 1;
  var q = 0;
  for(var i = 0; i < this.attrs.duration; i++){
    binary = (i < this.attrs.duration/2)
    if(binary && charge < 0.7){
      q = 0;
    }
    charge = Math.exp(-q/(this.attrs.duration * 0.37))
    q++;
    if (!binary){
      charge = 0;
    }    
    this.points.push([charge, binary]);
  }
}

Scenes.refresh.prototype.update = function(delta){

     this.attrs.time += this.env.diff / 50

  if (this.attrs.time > this.attrs.duration) {
    this.attrs.time -= this.attrs.duration;
  }


}

Scenes.refresh.prototype.paint = function(fx, gx, sx){

  gx.ctx.strokeStyle = '#0ff';
  gx.ctx.lineWidth = 16;

  var t = Math.floor(this.attrs.time);
  
  var a = (this.points[t][0]);
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

  // chart
  
  var dx = 0.5 * this.opts.max_x / this.points.length;
  var ix;
  var offset;

  gx.ctx.beginPath();

  for(var i = 0; i<this.attrs.duration * 2; i++){
    ix = (t + i) % this.points.length;
    gx.ctx.beginPath();
    gx.ctx.fillStyle = 'rgba(255,0,255,' + this.points[ix][0] + ')';
    gx.ctx.arc(
      //this.opts.max_x * 0.5 + (dx * i/2),
      this.opts.max_x * 1.0 - (dx * i/2),
      (this.opts.max_y * 0.63) - (this.opts.max_y * 0.25 * this.points[ix][0]),
      4,
      0, 2*Math.PI
    );
    gx.ctx.fill();
  }

  gx.ctx.beginPath();
  gx.ctx.strokeStyle = '#cc0';
  gx.ctx.lineWidth = 2;

  for(var i = 0; i<this.attrs.duration * 2; i++){

    ix = (t + i) % this.points.length;
    
    if(ix === 0){
      gx.ctx.stroke();
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        //this.opts.max_x * 0.5 + (dx * i/2),
        this.opts.max_x * 1.0 - (dx * i/2),
        (this.opts.max_y * 0.5) + (this.opts.max_y * 0.125 * 1)
      ) 
      gx.ctx.lineTo(
        //this.opts.max_x * 0.5 + (dx * i/2),
        this.opts.max_x * 1.0 - (dx * i/2),
        (this.opts.max_y * 0.5) + (this.opts.max_y * 0.125 * -1)
      ) 
    }
    
    yy = this.points[ix][1] ? -1 : 1;
    gx.ctx.lineTo(
      //this.opts.max_x * 0.5 + (dx * i/2),
      this.opts.max_x * 1.0 - (dx * i/2),
      (this.opts.max_y * 0.5) + (this.opts.max_y * 0.125 * yy)
    ) 

  }
  gx.ctx.stroke();
  
  gx.ctx.fillStyle = '#fff';
  gx.ctx.lineStyle = '#fff';
  gx.ctx.font='64px robotron';
  gx.ctx.textAlign='center';
  gx.ctx.textBaseline='middle';
  gx.ctx.fillText(
    Math.floor(this.points[t][1] ? '1' : '0'),
    this.opts.max_x * 0.75,
    this.opts.max_y * 0.75
  );
  
}
