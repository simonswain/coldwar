/* global Actors, Actor, Vec3 */

Actors.Army = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Army.prototype = Object.create(Actor.prototype)
Actors.Army.prototype.title = 'Army'

Actors.Army.prototype.init = function (attrs) {
  this.pos = new Vec3(
    attrs.x,
    attrs.y,
    attrs.z
  )

  this.soldiers = []
}

Actors.Army.prototype.genAttrs = function (attrs) {
  return {
    color: attrs.color || '#f0f'
  }
}

Actors.Army.prototype.defaults = [{
  key: 'max_soldiers',
  info: '',
  value: 50,
  min: 0,
  max: 500
}]

Actors.Army.prototype.update = function (delta) {
  if (this.soldiers.length < this.opts.max_soldiers) {
    this.addSoldier()
  }
}

Actors.Army.prototype.addSoldier = function () {
  var soldier = new Actors.Soldier(
    this.env, {
      army: this,
      scene: this.refs.scene
    }, {
      x: this.pos.x,
      y: this.refs.scene.opts.max_x * Math.random(),
      z: 0,
      color: this.attrs.color
    })
  this.soldiers.push(soldier)
  this.refs.scene.soldiers.push(soldier)
}

Actors.Army.prototype.paint = function (view) {
  var xf = 12

  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)

  view.ctx.lineWidth = 2
  view.ctx.strokeStyle = this.attrs.color

  view.ctx.beginPath()
  view.ctx.rect(-xf, -xf, xf * 2, xf * 2)
  view.ctx.fill()
  view.ctx.stroke()

  view.ctx.restore()
}

Actors.Army.prototype.elevation = function (view) {}
