/* global Actors, Actor, Vec3, hex2rgb */

Actors.Template = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Template.prototype = Object.create(Actor.prototype)

Actors.Template.prototype.title = 'Template'

Actors.Template.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    radius: attrs.radius || this.opts.radius,
    color: attrs.color || '#f0f',
    dead: false
  }
}

Actors.Template.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  )
}

Actors.Template.prototype.defaults = [{
  key: 'radius',
  info: '',
  value: 25,
  min: 10,
  max: 100
}]

Actors.Template.prototype.update = function (delta) {}

Actors.Template.prototype.paint = function (view) {
  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)

  view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ', 0.5)'
  view.ctx.fillStyle = 'rgba(' + hex2rgb(this.attrs.color) + ', 0.5)'
  view.ctx.lineWidth = 1

  view.ctx.beginPath()
  view.ctx.arc(0, 0, this.attrs.radius, 0, 2 * Math.PI)
  view.ctx.fill()
  view.ctx.stroke()

  view.ctx.restore()
}

Actors.Template.prototype.elevation = function (view) {
  view.ctx.save()
  view.ctx.translate(this.pos.x, ((this.refs.scene.opts.max_z - this.pos.z)))

  view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ', 0.5)'
  view.ctx.fillStyle = 'rgba(' + hex2rgb(this.attrs.color) + ', 0.5)'
  view.ctx.lineWidth = 1

  view.ctx.beginPath()
  view.ctx.arc(0, 0, this.attrs.radius, 0, 2 * Math.PI)
  view.ctx.fill()
  view.ctx.stroke()

  view.ctx.restore()
}
