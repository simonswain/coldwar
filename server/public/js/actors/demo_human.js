/* global Actors, Actor, Vec3, VecR */

Actors.Demohuman = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Demohuman.prototype = Object.create(Actor.prototype)

Actors.Demohuman.prototype.title = 'Demohuman'

Actors.Demohuman.prototype.init = function (attrs) {

  this.pos = new Vec3(
    attrs.x,
    attrs.y,
    0
  );

  this.velo = new VecR(
    Math.PI * 2 * Math.random(),
    this.attrs.speed
  ).vec3()
  
}

Actors.Demohuman.prototype.defaults = [{
  key: 'speed_base',
  value: 5,
  min: 1,
  max: 100
}, {
  key: 'speed_flux',
  value: 5,
  min: 0,
  max: 50
}, {
  key: 'velo_scale',
  value: 0.1,
  min: 0.1,
  max: 1,
  step: 0.1
}, {
  key: 'show_params',
  value: 0,
  min: 0,
  max: 1
}, {
  key: 'laser_probability',
  value: 0.05,
  min: 0,
  max: 1
}, {
  key: 'laser_range_base',
  value: 60,
  min: 1,
  max: 500
}, {
  key: 'laser_range_flux',
  value: 32,
  min: 1,
  max: 100
}, {
  key: 'laser_power_base',
  value: 250,
  min: 1,
  max: 500
}, {
  key: 'laser_power_flux',
  value: 10,
  min: 1,
  max: 100
}]

Actors.Demohuman.prototype.genAttrs = function (attrs) {

  var energy = 10 + random0to(10)

  return {
    face_enemy: false,
    face_angle: 0,
    speed: this.opts.speed_base + (Math.random() * this.opts.speed_flux),
    color: attrs.color || '#fff',
    dead: false,
    recharge: 1 + (random1to(10)) / 10,
    energy_max: energy,
    energy: energy,
    damage: 0,
    
  }
}

Actors.Demohuman.prototype.update = function (delta) {

  var vec = new Vec3()
  var route 

  this.recharge()
  this.shoot()

}

Actors.Demohuman.prototype.recharge = function () {
  // basics
  this.attrs.energy = this.attrs.energy + (this.attrs.recharge * (1 - (1 / this.attrs.energy_max) * this.attrs.damage))
  if (this.attrs.energy > this.attrs.energy_max) {
    this.attrs.energy = this.attrs.energy_max
  }
  this.attrs.damage = this.attrs.damage - this.attrs.recharge

  if (this.attrs.damage < 0) {
    this.attrs.damage = 0
  }
}

Actors.Demohuman.prototype.shoot = function () {

  var enemy
  var closest = Infinity
  
  this.attrs.face_enemy = false;

  if(this.refs.demo.rats.length === 0){
    return;
  };
  
  this.refs.demo.rats.forEach(function (other) {

    if(!other){
      return;
    }
    
    var range = this.pos.rangeXY(other.pos)

    // find closest weaker enemy
    if (range < closest) {
      enemy = other
      closest = range
    }
  }, this)

  if(enemy){
    this.attrs.face_angle = enemy.pos.angleXYto(this.pos)
    this.attrs.face_enemy = true;
  }
  
  if (enemy && this.attrs.energy > 0 && Math.random() < this.opts.laser_probability) {
    this.attrs.energy = this.attrs.energy - 1
    this.refs.demo.addZap(
      this.pos.x,
      this.pos.y,
      enemy.pos.x,
      enemy.pos.y
    )
  }
}

Actors.Demohuman.prototype.flashbang = function () {

  if(this.refs.demo.rats.length > this.opts.flashbang_rats){
    this.env.play('superzap')
    if(Math.random() < this.opts.flashbang_probability){
      this.refs.demo.attrs.flash = 4;
      this.refs.demo.rats.forEach(function (other) {
        if(!other){
          return;
        }
        other.kill();
      }, this);
    }
  }; 
}



Actors.Demohuman.prototype.paint = function (view) {

  view.ctx.save()
  view.ctx.rotate(this.attrs.face_angle)
  
  view.ctx.fillStyle = '#022'
  view.ctx.strokeStyle = '#0ff'
  view.ctx.lineWidth = 1

  var z = 32
  view.ctx.lineWidth = 8

  view.ctx.beginPath()
  view.ctx.rect(-z ,-z-z, z, z+z+z+z)
  view.ctx.stroke()

  view.ctx.beginPath()
  view.ctx.moveTo(z, 0)
  view.ctx.lineTo(-z, z)
  view.ctx.lineTo(-z, -z)
  view.ctx.lineTo(z, 0)
  view.ctx.closePath()
  view.ctx.fill()
  view.ctx.stroke()

  view.ctx.restore()
  
  if(this.attrs.intent === 0){
    view.ctx.strokeStyle = '#f00'
    view.ctx.beginPath()
    view.ctx.moveTo(0, 0)
    view.ctx.lineTo(0, -2*z)
    view.ctx.stroke()
  }

  if(this.attrs.intent === 1){
    view.ctx.strokeStyle = '#f00'
    view.ctx.beginPath()
    view.ctx.moveTo(0, 0)
    view.ctx.lineTo(2*z, 0)
    view.ctx.stroke()
  }

  if(this.attrs.intent === 2){
    view.ctx.strokeStyle = '#f00'
    view.ctx.beginPath()
    view.ctx.moveTo(0, 0)
    view.ctx.lineTo(0, 2*z)
    view.ctx.stroke()
  }

  if(this.attrs.intent === 3){
    view.ctx.strokeStyle = '#f00'
    view.ctx.beginPath()
    view.ctx.moveTo(0, 0)
    view.ctx.lineTo(-2*z, 0)
    view.ctx.stroke()
  }
  
}
