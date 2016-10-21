/* global Actors, Actor, Vec3, VecR */

Actors.Capacitors = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Capacitors.prototype = Object.create(Actor.prototype)

Actors.Capacitors.prototype.title = 'Capacitors'

Actors.Capacitors.prototype.init = function (attrs) {
  this.caps = [];
  for(var i = 0; i < 8; i++){
    this.caps.push(0);
  }
}

Actors.Capacitors.prototype.genAttrs = function (attrs) {
  return {
    time: 0,
    index: 0,
    value: 0,
    duration: this.opts.duration,
  };
}

Actors.Capacitors.prototype.defaults = [{
  key: 'max_x',
  value: 480,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 480,
  min: 32,
  max: 1024
}, {
  key: 'duration',
  value: 60,
  min: 1,
  max: 120
}, {
  key: 'scale',
  value: 250,
  min: 50,
  max: 500
}]

Actors.Capacitors.prototype.kill = function () {

  if (this.attrs.dead) {
    return
  }

  this.attrs.dead = true;

}

Actors.Capacitors.prototype.update = function (delta, intent) {
  this.attrs.time += this.env.diff
  if (this.attrs.time > this.attrs.duration) {
    this.attrs.time = 0;

    this.attrs.value --;
    if(this.attrs.value < 0){
      this.attrs.value = 255;
    }
    for(var i = 0; i < 8; i++){
      this.caps[i] = (this.attrs.value & Math.pow(2, i));
    }
  }
}

Actors.Capacitors.prototype.drawCap = function(gx, charge){

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
  
}

Actors.Capacitors.prototype.paint = function (gx) {

  for(var i = 0; i < 4; i++){
    gx.ctx.save();
    gx.ctx.translate((this.opts.max_x / 4) * i, this.opts.max_y * 0.4);
    gx.ctx.scale(0.3, 0.3);
    this.drawCap(gx, this.caps[i]);
    gx.ctx.restore()
  }
  
}
