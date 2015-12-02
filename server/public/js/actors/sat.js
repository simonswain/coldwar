/* global Actors, Actor, Vec3 */

Actors.Sat = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Sat.prototype = Object.create(Actor.prototype)

Actors.Sat.prototype.title = 'Sat'

Actors.Sat.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  )
}

Actors.Sat.prototype.defaults = [{
  key: 'laser_range',
  info: '.',
  value: 0.2,
  min: 0.2,
  max: 0.5,
  step: 0.01
}]

Actors.Sat.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    color: attrs.color || '#f0f',
    dead: false,
    phase_x: Math.PI * Math.random(),
    phase_y: Math.PI * Math.random(),
    speed_x: (Math.PI * 0.0025) + (Math.PI * 0.0025 * Math.random()),
    speed_y: (Math.PI * 0.0025) + (Math.PI * 0.0025 * Math.random()),
    angle: Math.PI * Math.random(),
    rotation: (Math.PI * 0.005) + (Math.PI * 0.005 * Math.random()),
    laser: null,
    laser_range: attrs.laser_range || this.refs.scene.opts.max * this.opts.laser_range,
    laser_max: Math.floor(30 + (10 * Math.random())),
    laser_power: 0 // current laser charge
  }
}

Actors.Sat.prototype.update = function (delta) {
  this.attrs.phase_x += this.attrs.speed_x
  this.attrs.phase_y += this.attrs.speed_y

  this.attrs.angle += this.attrs.rotation

  this.pos.x = (this.refs.scene.opts.max_x * 0.5) + (this.refs.scene.opts.max_x * 0.1 * Math.sin(this.attrs.phase_x))
  this.pos.y = (this.refs.scene.opts.max_y * 0.5) + (this.refs.scene.opts.max_y * 0.3 * Math.sin(this.attrs.phase_y))

  // reset laser
  this.attrs.laser = null

  // charge laser
  if (this.attrs.laser_power < this.attrs.laser_max) {
    this.attrs.laser_power++
  }

  this.shootLaser()
}

Actors.Sat.prototype.shootLaser = function () {
  var i, ii
  var target, other
  var dist, distX

  for (i = 0, ii = this.refs.scene.icbms.length; i < ii; i++) {
    other = this.refs.scene.icbms[i]
    if (other.refs.capital === this.refs.capital) {
      continue
    }
    distX = this.pos.range(other.pos)
    if (distX > this.attrs.laser_range) {
      continue
    }
    dist = this.pos.range(other.pos)
    if (dist < this.attrs.laser_range) {
      target = other
    }
  }

  if (target) {
    this.shoot(target)
  }
}

Actors.Sat.prototype.shoot = function (target) {
  if (this.attrs.laser_power <= 0) {
    return
  }

  // so it takes time to charge up
  this.attrs.laser_power -= 5

  this.attrs.laser = new Vec3().copy(target.pos)
  target.destroy()
}

Actors.Sat.prototype.paint = function (view) {
  if (this.attrs.laser) {
    view.ctx.beginPath()
    view.ctx.lineWidth = 2
    view.ctx.strokeStyle = '#fff'
    view.ctx.moveTo(this.pos.x, this.pos.y)
    // view.ctx.lineTo(this.attrs.laser.x, this.attrs.laser.y - this.attrs.laser.z) // fake3d
    view.ctx.lineTo(this.attrs.laser.x, this.attrs.laser.y) // fake3d
    view.ctx.stroke()
  }

  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)
  view.ctx.rotate(this.attrs.angle)

  // range
  // view.ctx.beginPath()
  // view.ctx.lineWidth = 1
  // view.ctx.arc(0, 0, this.attrs.laser_range, 0, 2*Math.PI)
  // view.ctx.strokeStyle = '#222'
  // view.ctx.stroke()

  view.ctx.fillStyle = '#000'
  view.ctx.fillRect(-6, -6, 12, 12)

  view.ctx.fillStyle = this.attrs.color
  view.ctx.strokeStyle = this.attrs.color
  view.ctx.lineWidth = 2

  view.ctx.beginPath()
  view.ctx.moveTo(-6, -6)
  view.ctx.lineTo(6, 6)
  view.ctx.stroke()

  view.ctx.beginPath()
  view.ctx.rect(-6, -6, 12, 12)
  view.ctx.stroke()

  view.ctx.restore()
}

Actors.Sat.prototype.elevation = function (view) {
  if (this.attrs.laser) {
    view.ctx.beginPath()
    view.ctx.lineWidth = 1
    view.ctx.strokeStyle = '#fff'
    view.ctx.moveTo(this.pos.x, (this.refs.scene.opts.max_z - this.pos.z))
    view.ctx.lineTo(this.attrs.laser.x, (this.refs.scene.opts.max_z - this.attrs.laser.z))
    view.ctx.stroke()
  }

  view.ctx.save()
  view.ctx.translate(this.pos.x, (this.refs.scene.opts.max_z - this.pos.z))

  view.ctx.fillStyle = this.attrs.color
  view.ctx.beginPath()
  view.ctx.fillRect(-2, -2, 4, 4)

  view.ctx.restore()
}
