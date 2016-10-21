/* global Actors, Actor, Vec3, VecR */

Actors.Powerup = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Powerup.prototype = Object.create(Actor.prototype)

Actors.Powerup.prototype.title = 'Powerup'

Actors.Powerup.prototype.init = function (attrs) {
  this.pos = new Vec3(attrs.x, attrs.y)
}

Actors.Powerup.prototype.genAttrs = function (attrs) {
  return {
    time: 0,
    index: 0,
    value: 0,
    duration: this.opts.duration,
  };
}

Actors.Powerup.prototype.defaults = [{
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

Actors.Powerup.prototype.kill = function () {

  if (this.attrs.dead) {
    return
  }

  this.attrs.dead = true;

}

Actors.Powerup.prototype.update = function (delta, intent) {
}

Actors.Powerup.prototype.paint = function (gx) {


  var z = this.opts.scale;

  var alpha = (0.5-(Math.sin(Math.PI * (Date.now()%4000)/2000)/2));

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x/2, this.opts.max_y/2)
  //gx.ctx.scale(0.9, 0.9)

  //gx.ctx.font = this.opts.font_size + '28pt ubuntu mono';
  gx.ctx.font = '48pt robotron';
  gx.ctx.textAlign = 'center';
  gx.ctx.textBaseline = 'middle';

  var h = (Date.now()%360 * 0.22) - 10;
  gx.ctx.fillStyle = 'hsl(' + h + ', 100%, 50%)';
  
  if(Math.random() < 0.025){
    gx.ctx.fillStyle = 'rgba(255,255,0,0.5)';
  }

  if(Math.random() < 0.025){
    gx.ctx.fillStyle = 'rgba(255,255,255,1)';
  }
  
  gx.ctx.fillText('POW', 0, 0)
  
  gx.ctx.restore();

}
