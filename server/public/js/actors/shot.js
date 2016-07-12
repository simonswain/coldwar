/* global Actors, Vec3 */

Actors.Shot = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Shot.prototype = Object.create(Actor.prototype)

Actors.Shot.prototype.title = 'Shot'

Actors.Shot.prototype.init = function (attrs) {

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

Actors.Shot.prototype.defaults = [{
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

Actors.Shot.prototype.genAttrs = function (attrs) {
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

Actors.Shot.prototype.update = function (delta) {

  this.attrs.h = Math.floor(Math.random() * 3);
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
    this.refs.scene.booms.push(new Actors.Boom(
      this.env, {
      }, {
        style: '',
        radius: 8,
        x: this.pos.x,
        y: this.pos.y,
        color: '255,255,255'
      }
    ))
  }

  var enemy;
  var i ,ii, range;

  if(this.refs.scene.kings.length > 0){
    
    for (i = 0, ii = this.refs.scene.kings.length; i < ii; i++) {
      enemy = this.refs.scene.kings[i]
      if(!enemy){
        continue
      }
      range = this.pos.range(enemy.pos)

      if (range < this.opts.sensitivity) {
        enemy.damage();
        return;
      }    
    }
  }
  
}

Actors.Shot.prototype.paint = function (view) {
  view.ctx.save()

  var h = (Date.now()%360 * 0.22) - 10;
  view.ctx.strokeStyle = 'hsl(' + h + ', 100%, 50%)';
  
  if(Math.random() < 0.025){
    view.ctx.strokeStyle = 'rgba(255,255,0,0.5)';
  }

  if(Math.random() < 0.025){
    view.ctx.strokeStyle = 'rgba(255,255,255,1)';
  }
  
  view.ctx.lineWidth = 4
  view.ctx.lineCap='round';
  view.ctx.rotate(this.origin.angleXYto(this.target))
  view.ctx.beginPath()
  view.ctx.moveTo(12, 0)
  view.ctx.lineTo(-12, 0)
  view.ctx.stroke()

  view.ctx.restore()
}

