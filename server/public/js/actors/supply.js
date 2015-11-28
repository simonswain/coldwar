/* global Actors, Actor, Vec3, hex2rgb */

Actors.Supply = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Supply.prototype = Object.create(Actor.prototype)

Actors.Supply.prototype.title = 'Supply'

Actors.Supply.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    radius: attrs.radius || this.opts.radius,
    color: attrs.color || '#f0f',
    dead: false,
    speed: 1,
    supply_range: 8,
    units: attrs.units || null,
    stock: attrs.stock || null
  }
}

Actors.Supply.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  )
  this.velo = new Vec3()
}

Actors.Supply.prototype.defaults = [{
  key: 'radius',
  info: '',
  value: 25,
  min: 10,
  max: 100
}]

Actors.Supply.prototype.update = function (delta) {
  if (!this.refs.target || this.refs.target.dead) {
    this.attrs.dead = true
    return
  }

  // distance to target
  var range = this.pos.rangeXY(this.refs.target.pos)

  if (range <= this.attrs.supply_range) {
    if (this.attrs.units) {
      this.refs.target.addUnits(this.attrs.units)
    }
    if (this.attrs.stock) {
      this.refs.target.addStock(this.attrs.stock)
    }
    this.attrs.dead = true
    return
  }

  var vector = this.refs.target.pos.minus(this.pos).normalize()
  vector.scale(this.attrs.speed)
  this.pos.add(vector)
}

Actors.Supply.prototype.paint = function (view) {
  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)

  view.ctx.fillStyle = 'rgba(' + hex2rgb(this.attrs.color) + ', 0.5)'
  // view.ctx.fillStyle = this.attrs.color
  view.ctx.beginPath()

  if (this.attrs.stock) {
    // munitions
    view.ctx.fillRect(-2, -2, 4, 4)
  } else {
    // raw materials
    view.ctx.beginPath()
    view.ctx.arc(0, 0, 2, 0, 2 * Math.PI)
    view.ctx.closePath()
    view.ctx.fill()
  }

  view.ctx.restore()
}

Actors.Supply.prototype.elevation = function (view) {
  view.ctx.save()
  view.ctx.translate(this.pos.x, ((this.refs.scene.opts.max_z - this.pos.z)))

  view.ctx.fillStyle = 'rgba(' + hex2rgb(this.attrs.color) + ', 0.5)'
  // view.ctx.fillStyle = this.attrs.color

  if (this.attrs.stock) {
    // munitions
    view.ctx.fillRect(-3, -3, 2, 2)
  } else {
    // raw materials
    view.ctx.beginPath()
    view.ctx.arc(-2, -2, 1, 0, 2 * Math.PI)
    view.ctx.closePath()
    view.ctx.fill()
  }

  view.ctx.restore()
}
