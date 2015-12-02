/* global Actors, Actor, Vec3, VecR */

Actors.Boid = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Boid.prototype = Object.create(Actor.prototype)

Actors.Boid.prototype.title = 'Boid'

Actors.Boid.prototype.init = function () {
  this.pos = new Vec3(
    this.refs.scene.opts.max_x / 2,
    this.refs.scene.opts.max_y / 2,
    0
  )

  this.velo = new VecR(
    Math.PI * 2 * Math.random(),
    this.attrs.speed
  ).vec3()
}

Actors.Boid.prototype.defaults = [{
  key: 'speed_base',
  info: '',
  value: 2,
  min: 1,
  max: 100
}, {
  key: 'speed_flux',
  info: '',
  value: 2,
  min: 0,
  max: 50
}, {
  key: 'velo_scale',
  info: '',
  value: 0.1,
  min: 0.1,
  max: 1,
  step: 0.1
}, {
  key: 'separation_range',
  info: '',
  value: 50,
  min: 10,
  max: 500
}, {
  key: 'cohesion_range',
  info: '',
  value: 200,
  min: 10,
  max: 500
}, {
  key: 'alignment_range',
  info: '',
  value: 500,
  min: 10,
  max: 1000
}, {
  key: 'separation_force',
  info: '',
  value: 0.7,
  min: 0.1,
  max: 1.0,
  step: 0.05
}, {
  key: 'cohesion_force',
  info: '',
  value: 2,
  min: 0.1,
  max: 1.0,
  step: 0.05
}, {
  key: 'alignment_force',
  info: '',
  value: 2.25,
  min: 0.1,
  max: 5.0,
  step: 0.05
}, {
  key: 'predator_range',
  info: '',
  value: 200,
  min: 10,
  max: 500
}, {
  key: 'predator_force',
  info: '',
  value: 6,
  min: 0,
  max: 10
}, {
  key: 'show_params',
  info: '',
  value: 0,
  min: 0,
  max: 1
}]

Actors.Boid.prototype.genAttrs = function (attrs) {
  return {
    speed: this.opts.speed_base + (Math.random() * this.opts.speed_flux),
    color: attrs.color || '#fff',
    dead: false
  }
}

Actors.Boid.prototype.update = function (delta) {
  var vec = new Vec3()

  vec.add(this.separation().scale(this.opts.separation_force))
  vec.add(this.alignment().scale(this.opts.alignment_force))
  vec.add(this.cohesion().scale(this.opts.cohesion_force))
  vec.add(this.flee().scale(this.opts.predator_force))

  vec.scale(this.opts.velo_scale)

  this.velo.add(vec)
  this.velo.limit(this.attrs.speed)
  this.pos.add(this.velo)

  // wrap
  if (this.pos.x < 0) {
    this.pos.x = this.refs.scene.opts.max_x
  }

  if (this.pos.x > this.refs.scene.opts.max_x) {
    this.pos.x = 0
  }

  if (this.pos.y < 0) {
    this.pos.y = this.refs.scene.opts.max_y
  }

  if (this.pos.y > this.refs.scene.opts.max_y) {
    this.pos.y = 0
  }
}

Actors.Boid.prototype.separation = function () {
  var i, ii
  var other
  var range

  var vec = new Vec3()

  for (i = 0, ii = this.refs.boids.length; i < ii; i++) {
    other = this.refs.boids[i]

    if (other === this) {
      continue
    }

    range = this.pos.rangeXY(other.pos)

    if (range === 0) {
      continue
    }

    if (range > this.opts.separation_range) {
      continue
    }

    vec.add(this.pos.minus(other.pos).normalize().scale(1 / range))
  }

  return vec.normalize()
}

Actors.Boid.prototype.alignment = function () {
  var i, ii
  var other
  var range

  var vec = new Vec3()

  for (i = 0, ii = this.refs.boids.length; i < ii; i++) {
    other = this.refs.boids[i]

    if (other === this) {
      continue
    }

    range = this.pos.rangeXY(other.pos)

    if (range === 0) {
      continue
    }

    if (range > this.opts.separation_range) {
      continue
    }

    vec.add(other.velo)
  }

  return vec.normalize()
}

Actors.Boid.prototype.cohesion = function () {
  var i, ii
  var other

  var x = 0
  var y = 0
  var c = 0

  for (i = 0, ii = this.refs.boids.length; i < ii; i++) {
    other = this.refs.boids[i]

    if (other === this) {
      continue
    }

    x += this.pos.x
    y += this.pos.y
    c++
  }

  var center = new Vec3(x / c, y / c)

  return this.pos.minus(center).normalize()
  // return center.minus(this.pos).normalize()
}

Actors.Boid.prototype.flee = function () {
  var i, ii
  var other
  var range

  var vec = new Vec3()

  for (i = 0, ii = this.refs.predators.length; i < ii; i++) {
    other = this.refs.predators[i]

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

Actors.Boid.prototype.steer = function () {
  var i, ii

  var dist
  var other
  var count = 0
  var vec, vector

  var alignment = new Vec3()
  var cohesion = new Vec3()
  var separation = new Vec3()

  for (i = 0, ii = this.refs.boids.length; i < ii; i++) {
    other = this.refs.boids[i]

    if (other === this) {
      continue
    }

    dist = this.pos.rangeXY(other.pos)

    if (dist === 0) {
      continue
    }

    if (dist <= this.opts.separation_range) {
      vec = other.pos.minus(this.pos)
      vec.normalize().scale(this.opts.separation_range / dist)
      separation.add(vec)
    }

    if (dist <= this.opts.cohesion_range) {
      vec = this.pos.minus(other.pos)
      vec.normalize().scale(this.opts.cohesion_range / dist)
      cohesion.add(vec)
    }

    if (dist <= this.opts.alignment_range) {
      vec = this.pos.minus(other.pos)
      alignment.add(vec)
      count++
    }
  }

  if (count === 0) {
    return new Vec3()
  }

  separation.normalize().scale(this.opts.separation_force)
  cohesion.normalize().scale(this.opts.cohesion_force)

  alignment = this.pos.minus(alignment)
  alignment.normalize().scale(this.opts.alignment_force)

  vector = new Vec3()
  vector.add(separation)
  vector.add(cohesion)
  vector.add(alignment)
  vector.normalize()

  return vector
}

Actors.Boid.prototype.paint = function (view) {
  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)
  view.ctx.rotate(this.velo.angleXY())

  view.ctx.fillStyle = '#fff'
  view.ctx.strokeStyle = '#666'
  view.ctx.lineWidth = 1

  if (this.opts.show_params) {
    view.ctx.beginPath()
    view.ctx.arc(0, 0, this.opts.separation_range, 0, 2 * Math.PI)
    view.ctx.stroke()
  }

  var z = 8
  view.ctx.lineWidth = 1
  view.ctx.beginPath()
  view.ctx.moveTo(z, 0)
  view.ctx.lineTo(-z, z)
  view.ctx.lineTo(-z * 0.5, 0)
  view.ctx.lineTo(-z, -z)
  view.ctx.lineTo(z, 0)
  view.ctx.closePath()
  view.ctx.fill()

  view.ctx.restore()
}
