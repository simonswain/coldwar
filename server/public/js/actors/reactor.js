/* global Actors, Actor */

Actors.Reactor = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Reactor.prototype = Object.create(Actor.prototype)

Actors.Reactor.prototype.title = 'Reactor'

Actors.Reactor.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    dead: false
  }
}

Actors.Reactor.prototype.init = function (attrs) {

  this.pos = new Vec3(attrs.x, attrs.y)

}

Actors.Reactor.prototype.defaults = [{
  key: 'z',
  value: 16,
  min: 1,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 16,
  min: 100,
  max: 1000
}]

Actors.Reactor.prototype.update = function (delta) {

}

Actors.Reactor.prototype.paint = function (view) {
  var z = this.opts.z;
  view.ctx.beginPath()
  view.ctx.fillStyle = '#fff'
  view.ctx.arc(0, 0, z / 4, 0, 2 * Math.PI)

  view.ctx.fillRect(-z/2, -z/2, z, z)
  view.ctx.fill()

}
