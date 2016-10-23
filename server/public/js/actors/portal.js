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
    y: attrs.y,
    alpha: 0,    
    beta: 0,    
  }
}

Actors.Portal.prototype.init = function (attrs) {
  this.pos = new Vec3(attrs.x, attrs.y)
}

Actors.Portal.prototype.defaults = [{
  key: 'r',
  value: 160,
  min: 1,
  max: 128
}]

Actors.Portal.prototype.update = function (delta) {
  this.attrs.alpha += delta * 0.1;
  if(this.attrs.alpha > 1){
    this.attrs.alpha -= 1;
  }
  this.attrs.beta += delta * 0.03;
  if(this.attrs.beta > 1){
    this.attrs.beta -= 1;
  }
}

Actors.Portal.prototype.paint = function (view) {
  if(this.refs.maze.attrs.escape){
    view.ctx.strokeStyle = 'rgba(255, 0, 255, ' + ((0.5 * this.attrs.alpha)) + ')'
    view.ctx.beginPath()
    view.ctx.arc(0, 0, this.opts.r/2, -2*Math.PI * this.attrs.beta, -2*Math.PI * this.attrs.beta + Math.PI * 0.25)
    view.ctx.stroke()

    view.ctx.strokeStyle = 'rgba(0, 255, 255, ' + ((0.5 * this.attrs.alpha)) + ')'
    view.ctx.beginPath()
    view.ctx.arc(0, 0, this.opts.r/2, 2*Math.PI * this.attrs.beta, 2*Math.PI * this.attrs.alpha + Math.PI * 0.25)
    view.ctx.stroke()

    view.ctx.strokeStyle = 'rgba(0, 255, 255, ' + this.attrs.alpha + ')'
    view.ctx.lineWidth = 16
    view.ctx.beginPath()
    view.ctx.rect(-this.opts.r* 0.66, -this.opts.r* 0.66, this.opts.r * 0.66 * 2, this.opts.r * 0.66 * 2)
    view.ctx.stroke()
  } else {
    view.ctx.strokeStyle = 'rgba(0, 255, 255, ' + this.attrs.alpha * 0.5 + ')'
    view.ctx.lineWidth = 16
    view.ctx.beginPath()
    view.ctx.rect(-this.opts.r* 0.66, -this.opts.r* 0.66, this.opts.r * 0.66 * 2, this.opts.r * 0.66 * 2)
    view.ctx.stroke()
  } 
}
