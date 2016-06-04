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
    primed: false,
    dead: false
  }
}

Actors.Reactor.prototype.init = function (attrs) {

  this.pos = new Vec3(attrs.x, attrs.y)

}

Actors.Reactor.prototype.defaults = [{
  key: 'r',
  value: 180,
  min: 1,
  max: 128
}]

Actors.Reactor.prototype.update = function (delta) {

}

Actors.Reactor.prototype.paint = function (view) {
  var arc = Math.PI/3;
  
  view.ctx.fillStyle = 'rgba(255, 0, 255, 0.9)'
  view.ctx.fillStyle = 'rgba(255, 0, 255, 0.3)'
  var p = (this.env.ms / 2000) + 0.5;


  view.ctx.beginPath()
  view.ctx.arc(0, 0, this.opts.r, 0, 2*Math.PI)
  view.ctx.fill()

  view.ctx.strokeStyle = 'rgba(51, 0, 51, 1)'
  view.ctx.lineWidth = 24
  view.ctx.beginPath()
  view.ctx.rect(-this.opts.r* 0.66, -this.opts.r* 0.66, this.opts.r * 0.66 * 2, this.opts.r * 0.66 * 2)
  view.ctx.stroke()

  
  view.ctx.strokeStyle = 'rgba(255, 0, 255, ' + p + ')'
  view.ctx.lineWidth = 48
  view.ctx.beginPath()
  view.ctx.arc(0, 0, this.opts.r/2, 0, arc)
  view.ctx.stroke()

  view.ctx.beginPath()
  view.ctx.arc(0, 0, this.opts.r/2, 2*arc, 3*arc)
  view.ctx.stroke()

  view.ctx.beginPath()
  view.ctx.arc(0, 0, this.opts.r/2, 4*arc, 5*arc)
  view.ctx.stroke()




  
  var z = this.opts.r * 2;
  if(this.attrs.primed && this.env.ms / 100 < 1){
    view.ctx.strokeStyle = '#fff'
    view.ctx.lineWidth = 8
    view.ctx.beginPath()
    view.ctx.rect(-z/2, -z/2, z, z)
    view.ctx.stroke()
  }
}
