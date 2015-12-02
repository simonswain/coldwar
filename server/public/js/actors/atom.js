/* global Actors, Actor, Vec3 */

Actors.Atom = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Atom.prototype = Object.create(Actor.prototype)

Actors.Atom.prototype.title = 'Atom'

Actors.Atom.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    opacity: this.opts.opacity,
    oxygen: 0,
    carbon: 0,
    ozone: 0,
    temp: 16,
    rads: 0
  }
}

Actors.Atom.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  )

  this.velo = new Vec3(
    0,
    0,
    0
  )

  this.attrs.type = Math.floor(Math.random() * 5) - 2
  if (this.attrs.type < 0) {
    this.attrs.type = 0
  }
  // console.log(this.attrs.type)

  if (this.attrs.type === 1 && Math.random() < 0.5) {
    this.attrs.industry = true
  }

  if (this.attrs.type === 1 && Math.random() < 0.2) {
    this.attrs.city = true
  }

  if (this.attrs.type === 1 && Math.random() < 0.1) {
    this.attrs.reactor = true
  }
}

Actors.Atom.prototype.defaults = [{
  key: 'opacity',
  value: 0.6,
  min: 0,
  max: 1
}, {
  key: 'temp',
  value: 15.6,
  min: -50,
  max: 50
}, {
  key: 'oxygen',
  value: 0,
  min: 0,
  max: 100
}, {
  key: 'carbon',
  value: 0,
  min: 0,
  max: 100
}, {
  key: 'ozone',
  value: 0,
  min: 0,
  max: 100
}, {
  key: 'max_v',
  value: 0,
  min: 0,
  max: 0.1
}]

Actors.Atom.prototype.update = function (delta) {
  // this.attrs.opacity = (this.attrs.opacity === 1) ? 0 : 1

  var i, ii

  for (i = 0, ii = this.refs.jetstreams.length; i < ii; i++) {
    if (Math.abs(this.refs.jetstreams[i].pos.y - this.pos.y) < this.refs.jetstreams[i].attrs.width) {
      this.pos.x += 0.01 * this.refs.jetstreams[i].attrs.vel
    }
  }

  if (this.pos.x > this.refs.scene.opts.max_x) {
    this.pos.x = this.pos.x - this.refs.scene.opts.max_x
  }

  if (this.pos.x < 0) {
    this.pos.x = this.refs.scene.opts.max_x + this.pos.x
  }
}

Actors.Atom.prototype.paint = function (view) {
  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)

  // clean
  view.ctx.fillStyle = 'rgba(102, 153, 204, ' + this.attrs.opacity + ')'
  // radioactive
  // view.ctx.fillStyle = 'rgba(255, 0, 255, ' + this.attrs.opacity + ')'
  view.ctx.beginPath()
  view.ctx.rect(0, 0, 0.05, 0.05)
  view.ctx.fill()

  view.ctx.restore()
}
