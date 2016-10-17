/* global Actors, Vec3 */

Actors.Demozap = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Demozap.prototype = Object.create(Actor.prototype)

Actors.Demozap.prototype.title = 'Demozap'

Actors.Demozap.prototype.init = function (attrs) {

  this.pos = new Vec3(
    attrs.x,
    attrs.y
  )

  this.origin = new Vec3(
    attrs.x,
    attrs.y
  )
  
  this.target = new Vec3(
    attrs.target_x,
    attrs.target_y
  )

  this.velo = new Vec3();
  this.velo = this.target.minus(this.pos).normalize().scale(this.attrs.speed)
  //this.velo = this.pos.minus(this.target).normalize().scale(this.attrs.speed)
}

Actors.Demozap.prototype.defaults = [{
  key: 'color',
  info: 'spectrum',
  value: 4,
  min: 0,
  max: 7
}, {
  key: 'sensitivity',
  info: '',
  value: 32,
  min: 0,
  max: 255
}, {
  key: 'speed',
  info: '',
  value: 30,
  min: 1,
  max: 255
}]

Actors.Demozap.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    ttl: 120,
    launched: 0,
    dead: false,
    speed: this.opts.speed,
    h: Math.floor(Math.random() * 3)
  }
}

Actors.Demozap.prototype.update = function (delta) {

  this.attrs.h = Math.floor(Math.random() * 3)
  // this.attrs.h ++
  // if(this.attrs.h > 2){
  //   this.attrs.h = 0;
  // }

  this.attrs.ttl -= delta;
  if(this.attrs.ttl < 0){
    this.attrs.dead = true;
    return
  }

  var accel = this.target.minus(this.pos).normalize().scale(this.attrs.speed)

  //this.velo.add(accel)
  //this.pos.add(this.velo)
  this.pos.add(accel)

  // hit target?
  var range = this.pos.range(this.target)

  if (range < this.opts.sensitivity) {
    this.attrs.dead = true
    this.refs.demo.booms.push(new Actors.Boom(
      this.env, {
      }, {
        style: '',
        radius: 4,
        x: this.pos.x,
        y: this.pos.y,
        color: '152,0,0'
      }
    ))
  }

  if(this.refs.demo.rats.length === 0){
    return;
  };
  
  var rat;
  var i ,ii, range;
  
  for (i = 0, ii = this.refs.demo.rats.length; i < ii; i++) {
    rat = this.refs.demo.rats[i]
    if(!rat){
      continue
    }
    range = this.pos.range(rat.pos)

    if (range < this.opts.sensitivity) {
      this.attrs.dead = true;
      rat.kill();
      break;
    }
    
  }

  
}

Actors.Demozap.prototype.paint = function (view) {
  view.ctx.save()

  var h = (Date.now()%360 * 0.22) - 10;

  var c;
  c = 'hsl(' + h + ', 100%, 50%)';
  
  if(Math.random() < 0.025){
    c = 'rgba(255,255,0,1)';
  }

  if(Math.random() < 0.025){
    c = 'rgba(255,255,255,1)';
  }
  
  view.ctx.strokeStyle = c;

  view.ctx.shadowColor = c;
  view.ctx.shadowBlur = 8;
  view.ctx.shadowOffsetX = 0;
  view.ctx.shadowOffsetY = 0;
  view.ctx.shadowBlur = 8;
  
  view.ctx.lineWidth = 8
  view.ctx.lineCap='round';
  view.ctx.rotate(this.origin.angleXYto(this.target))
  view.ctx.beginPath()
  view.ctx.moveTo(12, 0)
  view.ctx.lineTo(-12, 0)
  view.ctx.stroke()

  view.ctx.restore()
}

