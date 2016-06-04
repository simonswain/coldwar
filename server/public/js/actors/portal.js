/* global Actors, Actor */

Actors.Portal = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Portal.prototype = Object.create(Actor.prototype)

Actors.Portal.prototype.title = 'Portal'

Actors.Portal.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y
  }
}

Actors.Portal.prototype.init = function (attrs) {
  this.pos = new Vec3(attrs.x, attrs.y)
}

Actors.Portal.prototype.defaults = [{
  key: 'r',
  value: 96,
  min: 1,
  max: 128
}]

Actors.Portal.prototype.update = function (delta) {

}

Actors.Portal.prototype.paint = function (view) {
  var arc = Math.PI/3;
  
  view.ctx.fillStyle = 'rgba(0, 255, 0, 255, 0.9)'
  var p = (this.env.ms / 2000) + 0.5;

  if(this.refs.maze.attrs.escape && this.env.ms < 500){
    view.ctx.beginPath()
    view.ctx.arc(0, 0, this.opts.r, 0, 2*Math.PI)
    view.ctx.fill()

    view.ctx.strokeStyle = 'rgba(0, 255, 0, 1)'
    view.ctx.lineWidth = 24
    view.ctx.beginPath()
    view.ctx.rect(-this.opts.r* 0.66, -this.opts.r* 0.66, this.opts.r * 0.66 * 2, this.opts.r * 0.66 * 2)
    view.ctx.stroke()
  } else { 
    view.ctx.beginPath()
    view.ctx.arc(0, 0, this.opts.r, 0, 2*Math.PI)
    view.ctx.fill()

    view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
    view.ctx.lineWidth = 24
    view.ctx.beginPath()
    view.ctx.rect(-this.opts.r* 0.66, -this.opts.r* 0.66, this.opts.r * 0.66 * 2, this.opts.r * 0.66 * 2)
    view.ctx.stroke()
  } 
}
