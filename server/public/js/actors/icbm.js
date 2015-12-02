/* global Actors, Actor, Vec3, hex2rgb */

Actors.Icbm = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Icbm.prototype = Object.create(Actor.prototype)

Actors.Icbm.prototype.title = 'Icbm'

Actors.Icbm.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    color: attrs.color || '#f0f',
    dead: false,
    distance: 0,
    velo: new Vec3(),
    killrange: 8,
    range: 0,
    ttl: 1500,
    // speed: world.unit_speed * (0.005 + (Math.random() * 0.005)),
    speed: attrs.speed || this.opts.speed + (Math.random() * this.opts.speed_flux),
    phase: 0,
    phasec: 0,
    trail: [],
    tickCount: 0
  }
}

Actors.Icbm.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  )
  this.velo = new Vec3()
  this.attrs.distance = this.pos.range(this.refs.target.pos)
}

Actors.Icbm.prototype.defaults = [{
  key: 'speed',
  info: '',
  value: 0.01,
  min: 0.005,
  max: 1
}, {
  key: 'speed_flux',
  info: '',
  value: 0.01,
  min: 0,
  max: 2
}, {
  key: 'ttl',
  info: '',
  value: 1500,
  min: 100,
  max: 10000
}]

Actors.Icbm.prototype.update = function (delta) {
  this.attrs.ttl--

  if (this.attrs.ttl < 0) {
    this.refs.base.attrs.icbms_launched--
    this.attrs.dead = true
    this.refs.scene.booms.push(new Actors.Boom(
      this.env, {
        scene: this.refs.scene
      }, {
        radius: 10,
        ttl: 30,
        style: '',
        x: this.pos.x,
        y: this.pos.y,
        z: this.pos.z,
        color: hex2rgb(this.attrs.color, 8)
      }))
  }

  var accel = this.refs.target.pos.minus(this.pos).normalize().scale(this.attrs.speed)
  this.velo.add(accel)
  this.pos.add(this.velo)

  // trail
  if (this.attrs.tickCount === 0) {
    this.attrs.trail.push([this.pos.x, this.pos.y, this.pos.z])
    this.attrs.tickCount = 20
  }
  this.attrs.tickCount--

  // how far from target?
  this.attrs.range = this.pos.rangeXY(this.refs.target.pos)

  if (this.attrs.range < this.attrs.killrange) {
    this.attrs.dead = true
    this.refs.base.attrs.icbms_launched--

    if (this.refs.target.attrs.dead) {
      this.refs.scene.booms.push(new Actors.Boom(
        this.env, {
          scene: this.refs.scene
        }, {
          radius: 25,
          style: '',
          x: this.pos.x,
          y: this.pos.y,
          z: this.pos.z,
          color: hex2rgb(this.attrs.color)
        }
      ))
    } else {
      if (this.refs.target.capital) {
        this.refs.target.capital.assetDestroyed()
      }

      if (typeof this.refs.target.destroy === 'function') {
        this.refs.target.destroy()
      } else {
        this.refs.target.attrs.dead = true
      }

      this.env.flash = 2

      this.refs.scene.booms.push(new Actors.Boom(
        this.env, {
          scene: this.refs.scene
        }, {
          style: 'zoom',
          crater: true,
          radius: 45,
          x: this.refs.target.pos.x,
          y: this.refs.target.pos.y,
          z: this.refs.target.pos.z,
          color: hex2rgb('#f0f')
        }
      ))

      this.refs.scene.booms.push(new Actors.Boom(
        this.env, {
          scene: this.refs.scene
        }, {
          radius: 60,
          style: '',
          x: this.pos.x,
          y: this.pos.y,
          z: this.pos.z,
          color: hex2rgb('#fff')
        }
      ))
    }
  }

  // angle of missile
  if (this.attrs.distance > 0) {
    this.attrs.phase = Math.sin((this.attrs.range / this.attrs.distance) * Math.PI)
    this.attrs.phasec = Math.cos((this.attrs.range / this.attrs.distance) * Math.PI)
  }

  // apparant altitude
  this.pos.z = this.attrs.phase * this.refs.scene.opts.max_z * 0.8
}

Actors.Icbm.prototype.destroy = function () {
  if (!this.attrs.dead) {
    this.refs.base.attrs.icbms_launched--
    this.refs.scene.booms.push(new Actors.Boom(
      this.env, {
        scene: this.refs.scene
      }, {
        radius: 25,
        style: '',
        x: this.pos.x,
        y: this.pos.y,
        z: this.pos.z,
        color: hex2rgb(this.attrs.color)
      }
    ))
  }

  this.attrs.dead = true
}

Actors.Icbm.prototype.paint = function (view) {
  // line to ground
  // view.ctx.beginPath()
  // view.ctx.strokeStyle= '#666'
  // view.ctx.moveTo(this.pos.x, this.pos.y)
  // view.ctx.lineTo(this.pos.x, this.pos.y - this.pos.z)
  // view.ctx.stroke()

  // trail
  var i, ii, point

  if (this.attrs.trail.length > 0) {
    view.ctx.lineWidth = 1
    view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    view.ctx.beginPath()
    view.ctx.moveTo(this.attrs.trail[0][0], this.attrs.trail[0][1])
    for (i = 0, ii = this.attrs.trail.length; i < ii; i++) {
      point = this.attrs.trail[i]
      view.ctx.lineTo(point[0], point[1])
    }
    view.ctx.lineTo(this.pos.x, this.pos.y)
    view.ctx.stroke()
  }

  // flight object
  view.ctx.save()

  view.ctx.translate(this.pos.x, this.pos.y)
  view.ctx.rotate(this.refs.target.pos.angleXYto(this.pos))

  view.ctx.fillStyle = this.attrs.color

  var z = 1 + 4 * (this.pos.z / this.refs.scene.opts.max_z)

  view.ctx.beginPath()
  view.ctx.moveTo(2 * z, 0)
  view.ctx.lineTo(-z, -z)
  view.ctx.lineTo(-z, z)
  view.ctx.lineTo(2 * z, 0)
  view.ctx.closePath()
  view.ctx.fill()

  view.ctx.restore()
}

Actors.Icbm.prototype.elevation = function (view) {
  // trail
  var i, ii, point
  if (this.attrs.trail.length > 0) {
    view.ctx.lineWidth = 1
    view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    view.ctx.beginPath()
    view.ctx.moveTo(this.attrs.trail[0][0], (this.refs.scene.opts.max_z - (this.attrs.trail[0][2] * 2)))
    for (i = 0, ii = this.attrs.trail.length; i < ii; i++) {
      point = this.attrs.trail[i]
      view.ctx.lineTo(point[0], (this.refs.scene.opts.max_z - (point[2])))
    }
    view.ctx.lineTo(this.pos.x, (this.refs.scene.opts.max_z - (this.pos.z)))
    view.ctx.stroke()
  }

  // flight object

  var direction = this.refs.target.pos.x > this.pos.x ? 1 : -1

  view.ctx.save()
  view.ctx.translate(this.pos.x, (this.refs.scene.opts.max_z - this.pos.z))
  view.ctx.rotate(direction * this.attrs.phasec)

  view.ctx.fillStyle = this.attrs.color

  var z = 3
  view.ctx.lineWidth = 1
  view.ctx.beginPath()
  view.ctx.moveTo(direction * 2 * z, 0)
  view.ctx.lineTo(direction * -z, -z)
  view.ctx.lineTo(direction * -z, z)
  view.ctx.lineTo(direction * 2 * z, 0)
  view.ctx.closePath()
  view.ctx.fill()
  view.ctx.restore()
}
