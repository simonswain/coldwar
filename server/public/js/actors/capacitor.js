/* global Actors, Actor, Vec3, VecR */

Actors.Capacitor = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Capacitor.prototype = Object.create(Actor.prototype)

Actors.Capacitor.prototype.title = 'Capacitor'

Actors.Capacitor.prototype.init = function (attrs) {
  this.caps = [];
  for(var i = 0; i < 8; i++){
    this.caps.push(0);
  }
}

Actors.Capacitor.prototype.genAttrs = function (attrs) {
  return {
    dead: false,
    disabled: false,
    time: 0,
    index: 0,
    value: 0,
    duration: this.opts.duration,
  };
}

Actors.Capacitor.prototype.defaults = [{
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

Actors.Capacitor.prototype.kill = function () {

  if (this.attrs.dead) {
    return
  }

  this.attrs.dead = true;

}

Actors.Capacitor.prototype.disable = function () {
  this.attrs.disabled = true;
}

Actors.Capacitor.prototype.update = function (delta, intent) {
  this.attrs.time += this.env.diff / 50
  if (this.attrs.time > this.attrs.duration) {
    this.attrs.time = 0;
  }
}

Actors.Capacitor.prototype.paint = function(gx){

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x/2, this.opts.max_y/2);
  gx.ctx.rotate(0.25 * Math.PI)
  
  gx.ctx.strokeStyle = '#0ff';
  gx.ctx.lineWidth = 16;

  if(!this.attrs.disabled){
    var a = 1-(this.attrs.time / this.attrs.duration);
    var c = 'rgba(255,0,255,' + a + ')';
    gx.ctx.fillStyle = 'rgba(255,0,255,' + a + ')';

    gx.ctx.shadowColor = c;
    gx.ctx.shadowBlur = 40;
    gx.ctx.shadowOffsetX = 0;
    gx.ctx.shadowOffsetY = 0;
    gx.ctx.shadowBlur = this.opts.max_x * 0.1;

    gx.ctx.fillStyle = c;
    gx.ctx.stroketyle = c;

    gx.ctx.beginPath();
    gx.ctx.rect(
      -this.opts.max_x * 0.15,
      -this.opts.max_y * 0.1,    
      this.opts.max_x * 0.3,
      this.opts.max_y * 0.2    
    )
    gx.ctx.fill();
    gx.ctx.shadowBlur = 0;
  }

  if(this.attrs.disabled){
    gx.ctx.strokeStyle = '#900';
  }
  
 
  gx.ctx.beginPath();
  gx.ctx.moveTo(0, -this.opts.max_y * 0.25) 
  gx.ctx.lineTo(0, -this.opts.max_y * 0.125)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(-this.opts.max_x * 0.15, -this.opts.max_y * 0.1) 
  gx.ctx.lineTo(this.opts.max_x * 0.15, -this.opts.max_y * 0.1)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(0, this.opts.max_y * 0.25) 
  gx.ctx.lineTo(0, this.opts.max_y * 0.125)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(-this.opts.max_x * 0.15, this.opts.max_y * 0.1) 
  gx.ctx.lineTo(this.opts.max_x * 0.15, this.opts.max_y * 0.1)
  gx.ctx.stroke();

  gx.ctx.restore();
  
}
