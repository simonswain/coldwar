/* global Actors, Actor, Vec3, VecR */

Actors.Hume = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Hume.prototype = Object.create(Actor.prototype)

Actors.Hume.prototype.title = 'Hume'

Actors.Hume.prototype.genAttrs = function (attrs) {

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
    escaped: false

  }
}

Actors.Hume.prototype.init = function (attrs) {

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

Actors.Hume.prototype.defaults = [{
  key: 'speed_base',
  value: 5,
  min: 1,
  max: 100
}, {
  key: 'speed_flux',
  value: 3,
  min: 0.2,
  max: 50
}, {
  key: 'velo_scale',
  value: 0.1,
  min: 0.1,
  max: 1,
  step: 0.1
}, {
  key: 'intent_scale',
  value: 20,
  min: 0,
  max: 100,
}, {
  key: 'separation_range',
  value: 50,
  min: 10,
  max: 500
}, {
  key: 'cohesion_range',
  value: 200,
  min: 10,
  max: 500
}, {
  key: 'alignment_range',
  value: 500,
  min: 10,
  max: 1000
}, {
  key: 'separation_force',
  value: 0.7,
  min: 0.1,
  max: 1.0,
  step: 0.05
}, {
  key: 'cohesion_force',
  value: 2,
  min: 0.1,
  max: 1.0,
  step: 0.05
}, {
  key: 'alignment_force',
  value: 2.25,
  min: 0.1,
  max: 5.0,
  step: 0.05
}, {
  key: 'predator_range',
  value: 130,
  min: 10,
  max: 500
}, {
  key: 'predator_force',
  value: 30,
  min: 0,
  max: 100
}, {
  key: 'reflect_force',
  value: 10,
  min: 0,
  max: 10
}, {
  key: 'show_params',
  value: 0,
  min: 0,
  max: 1
}, {
  key: 'laser_probability',
  value: 0.5,
  min: 0,
  max: 1
}, {
  key: 'laser_range_base',
  value: 240,
  min: 1,
  max: 500
}, {
  key: 'laser_range_flux',
  value: 32,
  min: 1,
  max: 100
}, {
  key: 'laser_power_base',
  value: 160,
  min: 1,
  max: 500
}, {
  key: 'laser_power_flux',
  value: 10,
  min: 1,
  max: 100
}, {
  key: 'flashbang_rats',
  value: 15,
  min: 1,
  max: 100
}, {
  key: 'flashbang_probability',
  value: 0.1,
  min: 0,
  max: 1,
  step:0.1
}]


Actors.Hume.prototype.update = function (delta) {

  var vec = new Vec3()
  var route

  this.recharge()
  this.shootKings()

  vec.add(this.flee().scale(this.opts.predator_force))
  vec.add(this.reflect().scale(this.opts.reflect_force))

  vec.scale(this.opts.velo_scale)

  this.velo.add(vec)
  this.velo.limit(this.attrs.speed)
  this.pos.add(this.velo)

}

Actors.Hume.prototype.recharge = function () {
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

Actors.Hume.prototype.shootKings = function () {

  if(this.attrs.escaped){
    return;
  }

  var enemy
  var closest = Infinity

  this.attrs.face_enemy = false;

  if(this.refs.scene.kings.length === 0){
    return;
  };

  this.refs.scene.kings.forEach(function (other) {
    if(!other){
      return;
    }
    var range = this.pos.rangeXY(other.pos)
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
    this.refs.scene.addShot(
      this.pos.x,
      this.pos.y,
      enemy.pos.x,
      enemy.pos.y
    )
  }

}


Actors.Hume.prototype.reflect = function () {

  var reflect = new Vec3()

  var max = Math.min(this.refs.scene.opts.max_x, this.refs.scene.opts.max_y)

  if (this.pos.x < this.refs.scene.opts.max_x * 0.01) {
    reflect.x = ((this.refs.scene.opts.max_x * 0.1) - this.pos.x ) / (this.refs.scene.opts.max_x * 0.1);
  }

  if (this.pos.y < this.refs.scene.opts.max_y * 0.01) {
    reflect.y = ((this.refs.scene.opts.max_y * 0.1) - this.pos.y ) / (this.refs.scene.opts.max_y * 0.1);
  }

  if (this.pos.x > this.refs.scene.opts.max_x * 0.99) {
    reflect.x = - (this.pos.x - (this.refs.scene.opts.max_x * 0.9) ) / (this.refs.scene.opts.max_x * 0.1);
  }

  if (this.pos.y > this.refs.scene.opts.max_y * 0.99
     ) {
    reflect.y = - (this.pos.y - (this.refs.scene.opts.max_y * 0.9) ) / (this.refs.scene.opts.max_y * 0.1);
  }

  return reflect

}


Actors.Hume.prototype.flee = function () {
  var i, ii
  var other
  var range

  var vec = new Vec3()

  if(this.refs.scene.kings.length === 0){
    return vec;
  }

  for (i = 0, ii = this.refs.scene.kings.length; i < ii; i++) {

    other = this.refs.scene.kings[i]

    if (!other) {
      continue
    }


    range = this.pos.rangeXY(other.pos)

    if (range === 0) {
      continue
    }

    if (range > this.opts.predator_range) {
      continue
    }

    vec.add(this.pos.minus(other.pos).normalize().scale(1 / range))
  }

  return vec.normalize()
}


Actors.Hume.prototype.paint = function (view) {

  if(this.attrs.escaped){
    return;
  }

  view.ctx.save()
  if(this.attrs.face_enemy){
    view.ctx.rotate(this.attrs.face_angle)
  } else {
    view.ctx.rotate(this.velo.angleXY())
  }

  view.ctx.fillStyle = '#022'
  view.ctx.strokeStyle = '#0ff'
  view.ctx.lineWidth = 1

  var z = 16
  view.ctx.lineWidth = 4

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

}
