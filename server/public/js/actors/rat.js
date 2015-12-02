/* global Actors, Actor, Vec3 */

Actors.Rat = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Rat.prototype = Object.create(Actor.prototype)

Actors.Rat.prototype.title = 'Rat'

Actors.Rat.prototype.genAttrs = function (attrs) {
  return {
    cell_x: attrs.cell_x,
    cell_y: attrs.cell_y,
    velo: 1 + (5 * Math.random()),
    tick: 0,
    dead: false
  }
}

Actors.Rat.prototype.init = function () {
  var xf = this.refs.scene.opts.max_x / this.refs.maze.opts.cols
  var yf = this.refs.scene.opts.max_y / this.refs.maze.opts.rows
  this.pos = new Vec3(
    (xf * this.attrs.cell_x) + xf / 2,
    (xf * this.attrs.cell_y) + yf / 2,
    0
  )
}

Actors.Rat.prototype.defaults = [{
  key: 'tick',
  value: 30,
  min: 1,
  max: 240
}]

Actors.Rat.prototype.update = function (delta) {
  this.attrs.tick--
  if (this.attrs.tick > 0) {
    return
  }

  this.attrs.tick = this.opts.tick / 2 + (this.opts.tick * Math.random())

  var vec = this.refs.human.pos.minus(this.pos).normalize().scale(this.attrs.velo)
  this.pos.add(vec)

  var xf = this.refs.scene.opts.max_x / this.refs.maze.opts.cols
  var yf = this.refs.scene.opts.max_y / this.refs.maze.opts.rows
  var f = Math.min(xf, yf)
  var d = f / 4

  var cell_x = Math.floor(this.pos.x / f)
  var cell_y = Math.floor(this.pos.y / f)
  var x = this.pos.x % f
  var y = this.pos.y % f
  var cell = this.refs.maze.cells[cell_y][cell_x]
  if (cell[0] && y < d) {
    this.pos.y = (cell_y * f) + d
  }
  if (cell[1] && x > (f - d)) {
    this.pos.x = (cell_x * f) + f - d
  }
  if (cell[2] && y > (f - d)) {
    this.pos.y = (cell_y * f) + f - d
  }
  if (cell[3] && x < d) {
    this.pos.x = (cell_x * f) + d
  }

  this.attrs.cell_x = Math.floor(this.pos.x / f)
  this.attrs.cell_y = Math.floor(this.pos.y / f)
}

Actors.Rat.prototype.paint = function (view) {
  var xf = this.refs.scene.opts.max_x / this.refs.maze.opts.cols
  var yf = this.refs.scene.opts.max_y / this.refs.maze.opts.rows
  var f = Math.min(xf, yf)

  view.ctx.save()
  view.ctx.translate(
    (this.refs.scene.opts.max_x / 2) - (f * this.refs.maze.opts.cols / 2),
    (this.refs.scene.opts.max_y / 2) - (f * this.refs.maze.opts.rows / 2)
  )

  view.ctx.beginPath()
  view.ctx.fillStyle = '#fff'
  view.ctx.arc(this.pos.x, this.pos.y, f / 8, 0, 2 * Math.PI)

  view.ctx.fill()
  view.ctx.restore()
}

Actors.Rat.prototype.elevation = function (view) {
  var xf = this.refs.scene.opts.max_x / this.refs.maze.opts.cols
  var yf = this.refs.scene.opts.max_z / this.refs.maze.opts.rows
  var f = Math.min(xf, yf)

  view.ctx.save()
  view.ctx.translate(
    (this.refs.scene.opts.max_x / 2) - (f * this.refs.maze.opts.cols / 2),
    (f * this.refs.maze.opts.rows / 2)
  )

  view.ctx.beginPath()
  view.ctx.fillStyle = '#fff'
  view.ctx.arc((this.attrs.cell_x * f) + (f / 2), (this.attrs.cell_y * f) + (f / 2), f / 6, 0, 2 * Math.PI)

  view.ctx.fill()
  view.ctx.restore()
}
