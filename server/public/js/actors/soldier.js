/* global Actors, Actor, Vec3 */

Actors.Soldier = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Soldier.prototype = Object.create(Actor.prototype)

Actors.Soldier.prototype.title = 'Soldier'

Actors.Soldier.prototype.genAttrs = function (attrs) {
  return {
    velo: 1 + (5 * Math.random()),
    color: attrs.color,
    dead: false
  }
}

Actors.Soldier.prototype.init = function (attrs) {
  this.pos = new Vec3(
    attrs.x,
    attrs.y,
    0
  )
}

Actors.Soldier.prototype.defaults = [{
}]

Actors.Soldier.prototype.update = function (delta) {}

Actors.Soldier.prototype.paint = function (view) {
  var f = 8

  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)

  view.ctx.beginPath()
  view.ctx.fillStyle = this.attrs.color
  view.ctx.arc(0, 0, f / 8, 0, 2 * Math.PI)

  view.ctx.fill()
  view.ctx.restore()
}

Actors.Soldier.prototype.elevation = function (view) {}
