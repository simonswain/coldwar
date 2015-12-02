/* global Vec3 */

function Streamer (opts) {
  this.booms = opts.booms

  this.pos = new Vec3(
    opts.x,
    opts.y
  )

  this.target = opts.target

  // target was destroyed before we could aim at it
  if (!this.target) {
    this.dead = true
    return
  }

  this.speed = 0.05 + (Math.random() * 0.05)

  // initial velo
  this.velo = this.target.pos.minus(this.pos).normalize().scale(this.speed * 5)

  this.gravity = new Vec3(0, 0.01)
  this.sensitivity = 64

  this.dead = false
}

Streamer.prototype.update = function (delta) {
  if (!this.target) {
    this.dead = true
    return
  }

  var accel = this.target.pos.minus(this.pos).normalize().scale(this.speed)
  this.velo.add(accel)
  this.pos.add(this.velo)
  this.velo.add(this.gravity)

  // gone past target
  if (this.pos.y > this.target.pos.y) {
    this.dead = true
  }
}

Streamer.prototype.paint = function (view) {
  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)
  view.ctx.rotate(this.velo.angleXY())
  view.ctx.fillStyle = '#fff'
  view.ctx.beginPath()
  view.ctx.rect(-12, -2, 24, 4)
  view.ctx.fill()
  view.ctx.restore()
}
