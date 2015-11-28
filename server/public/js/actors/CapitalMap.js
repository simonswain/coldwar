/* global Actors, Actor, Vec3, hex2rgb */

Actors.CapitalMap = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.CapitalMap.prototype = Object.create(Actor.prototype)

Actors.CapitalMap.prototype.title = 'CapitalMap'

Actors.CapitalMap.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    color: attrs.color || '#f0f',
    title: attrs.title || false,
    outline: attrs.outline || false
  }
}

Actors.CapitalMap.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  )
}

Actors.CapitalMap.prototype.defaults = [{
  key: 'weight',
  info: '',
  value: 4,
  min: 1,
  max: 64
}]

Actors.CapitalMap.prototype.update = function (delta) {}

Actors.CapitalMap.prototype.paint = function (view) {
  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)

  if (this.attrs.outline) {
    view.ctx.save()
    view.ctx.translate(Math.random() - 0.5, Math.random() - 0.5)
    view.ctx.scale(1 + Math.random() * 0.02, 1 + Math.random() * 0.02)

    view.ctx.lineWidth = this.opts.weight

    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.7)'
    if (Math.random() < 0.1) {
      view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.25)'
    }
    if (Math.random() < 0.01) {
      view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.1)'
    }
    if (Math.random() < 0.01) {
      view.ctx.lineWidth = 2
    }
    view.ctx.beginPath()
    for (var i = 0, ii = this.attrs.outline.length; i < ii; i++) {
      if (this.attrs.outline[i][2]) {
        view.ctx.stroke()
        view.ctx.beginPath()
        view.ctx.moveTo(this.attrs.outline[i][0], this.attrs.outline[i][1])
      } else {
        view.ctx.lineTo(this.attrs.outline[i][0], this.attrs.outline[i][1])
      }
    }
    view.ctx.stroke()
    view.ctx.restore()
  }

  if (this.attrs.title) {
    view.ctx.fillStyle = '#fff' // this.attrs.color
    view.ctx.font = '24pt ubuntu mono, monospace'
    view.ctx.textBaseline = 'middle'
    view.ctx.textAlign = 'center'
    view.ctx.fillText(this.attrs.title, 0, -32)
  }

  view.ctx.restore()
}

Actors.CapitalMap.prototype.elevation = function (view) {}
