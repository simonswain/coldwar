/* global Actors, Actor, Vec3, hex2rgb */

Actors.Boom = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Boom.prototype = Object.create(Actor.prototype)

Actors.Boom.prototype.title = 'Boom'

Actors.Boom.prototype.colors = ['#000', '#00f', '#f00', '#f0f', '#0f0', '#0ff', '#ff0', '#fff']

Actors.Boom.prototype.styles = [
  'default',
  'splat',
  'zoom',
  'zoom-lite',
  'spinner',
  'expand',
  'laser',
  'colonize',
  'decolonize',
  'nuke',
  'nuke2'
]

Actors.Boom.prototype.genAttrs = function (attrs) {
  var color
  var style

  if (!attrs.color) {
    color = Actors.Boom.prototype.colors[this.opts.color]
  } else if (typeof attrs.color === 'number' &&
    attrs.color < Actors.Boom.prototype.colors.length) {
    color = Actors.Boom.prototype.colors[attrs.color]
  } else if (attrs.color) {
    color = attrs.color
  }

  // console.log(attrs.color, color, typeof color)

  if (color.substr(0, 1) === '#') {
    color = hex2rgb(color)
  }

  if (Actors.Boom.prototype.styles.indexOf(attrs.style) > -1) {
    style = Actors.Boom.prototype.styles.indexOf(attrs.style)
  } else if (typeof Actors.Boom.prototype.styles[attrs.style] !== 'undefined') {
    style = attrs.style
  } else {
    style = this.opts.style
  }

  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    color: color,
    style: style,
    fatness: attrs.fatness || this.opts.fatness,
    clock: 0,
    crater: attrs.crater || this.opts.crater,
    radius: attrs.radius || this.opts.radius,
    initial_radius: attrs.radius || this.opts.radius,
    ttl: attrs.ttl || this.opts.ttl,
    initial_ttl: attrs.ttl || this.opts.ttl,
    dead: false,
    rate: this.opts.rate_base + (Math.random() * this.opts.rate_flux)
  }
}

Actors.Boom.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  )
}

Actors.Boom.prototype.defaults = [{
  key: 'style',
  value: 0,
  min: 0,
  max: Actors.Boom.prototype.styles.length
}, {
  key: 'color',
  value: 7,
  min: 0,
  max: 7
}, {
  key: 'radius',
  value: 100,
  min: 10,
  max: 500
}, {
  key: 'fatness',
  value: 2,
  min: 1,
  max: 32
}, {
  key: 'ttl',
  value: 60,
  min: 1,
  max: 300
}, {
  key: 'rate_base',
  value: 0.5,
  min: 0,
  max: 10,
  step: 0.1
}, {
  key: 'rate_flux',
  value: 0.5,
  min: 0,
  max: 10,
  step: 0.1
}, {
  key: 'crater',
  value: 0,
  min: 0,
  max: 1
}]

Actors.Boom.prototype.update = function (delta) {
  this.attrs.ttl -= delta

  this.attrs.clock = 1 - (this.attrs.ttl / this.attrs.initial_ttl)

  if (this.attrs.ttl <= 0) {
    if (this.attrs.crater) {
      this.attrs.style = 'crater'
      this.attrs.ttl = this.attrs.initial_ttl
    } else {
      this.attrs.dead = true
    }
  }
}

Actors.Boom.prototype.paint = function (view) {

  view.ctx.save()
  //view.ctx.translate(this.pos.x, this.pos.y)

  var i
  // var div = 2
  var f = this.attrs.ttl / this.attrs.initial_ttl
  var radius = this.attrs.radius * (this.attrs.ttl / this.attrs.initial_ttl)
  if (radius < 0) {
    radius = 0
  }
  view.ctx.lineWidth = this.opts.fatness

  if (this.attrs.crater) {
    view.ctx.strokeStyle = 'rgba(' + this.attrs.color + ',' + ((Math.random() * 0.5)) + ')'
    view.ctx.beginPath()
    view.ctx.arc(0, 0, this.attrs.radius * 0.5, 0, 2 * Math.PI)
    view.ctx.stroke()
  }

  switch (this.attrs.style) {
    case 1:
    case 'splat':
      view.ctx.lineWidth = this.opts.fatness
      view.ctx.strokeStyle = 'rgba(' + this.attrs.color + ', ' + f.toFixed(2) + ')'
      view.ctx.beginPath()
      view.ctx.arc(0, 0, radius, 0, 2 * Math.PI)
      view.ctx.stroke()
      break

    case 2:
    case 'zoom':
      for (i = 0; i < 10; i++) {
        view.ctx.strokeStyle = 'rgba(' + this.attrs.color + ', ' + (1 - (i / 10).toFixed(2)) + ')'
        view.ctx.beginPath()
        view.ctx.lineWidth = 8
        view.ctx.arc(0, 0, (this.attrs.radius - radius / 1) * i, 0, 2 * Math.PI)
        view.ctx.stroke()
      }
      break

    case 3:
    case 'zoom-lite':
      for (i = 0; i < 5; i++) {
        view.ctx.strokeStyle = 'rgba(' + this.attrs.color + ',1)'
        view.ctx.beginPath()
        view.ctx.lineWidth = this.opts.fatness
        view.ctx.arc(0, 0, (radius) * i / 5, 0, 2 * Math.PI)
        view.ctx.stroke()
      }
      break

    case 4:
    case 'spinner':
      view.ctx.strokeStyle = 'rgba(' + this.attrs.color + ',1)'
      view.ctx.beginPath()
      view.ctx.lineWidth = this.opts.fatness
      view.ctx.arc(0, 0, this.attrs.initial_radius, 0, 2 * Math.PI * this.attrs.clock)
      view.ctx.stroke()
      view.ctx.fill()
      break

    case 5:
    case 'expand':

      radius = this.attrs.initial_radius - (this.attrs.radius * (this.attrs.ttl / this.attrs.initial_ttl))

      view.ctx.fillStyle = 'rgba(' + this.attrs.color + ',' + f.toFixed(2) + ')'
      view.ctx.beginPath()
      view.ctx.arc(0, 0, radius, 0, 2 * Math.PI)
      view.ctx.fill()
      break

  case 6:
  case 'laser':
    view.ctx.save()
    view.ctx.rotate(2 * Math.PI * Math.random())
    view.ctx.lineCap = 'round'
    view.ctx.lineWidth = 16
    view.ctx.strokeStyle = '#f0f'
    if(Math.random() < 0.25){
      view.ctx.strokeStyle = '#0ff'
    }
    if(Math.random() < 0.25){
      view.ctx.strokeStyle = '#fff'
    }
    view.ctx.beginPath()
    view.ctx.moveTo(-this.attrs.initial_radius, 0)
    view.ctx.lineTo(this.attrs.initial_radius, 0)
    view.ctx.stroke()

    view.ctx.restore()
    break

  case 7:
  case 'colonize':
    view.ctx.lineWidth = this.opts.fatness
    view.ctx.strokeStyle = 'rgba(' + this.attrs.color + ',' + (2 * f.toFixed(2)) + ')'
    view.ctx.beginPath()
    view.ctx.rect(-radius / 2, -radius / 2, radius, radius)
    view.ctx.stroke()
    break

  case 8:
  case 'decolonize':
    view.ctx.lineWidth = this.opts.fatness
    view.ctx.strokeStyle = 'rgba(' + this.attrs.color + ',' + (2 * f.toFixed(2)) + ')'
    view.ctx.beginPath()
    view.ctx.rect(
      (this.attrs.radius/2) - (this.attrs.radius - radius / 2),
      (this.attrs.radius/2) - (this.attrs.radius - radius / 2),
      this.attrs.radius - radius,
      this.attrs.radius - radius
    )    
    view.ctx.stroke()
    break

  case 9:
  case 'nuke':
    for (i = 20; i > 0; i--) {
      view.ctx.strokeStyle = '#f00'
      if(Math.random() < 0.25){
        view.ctx.strokeStyle = '#ff0'
      }
      if(Math.random() < 0.25){
        view.ctx.strokeStyle = '#0ff'
      }
      if(Math.random() < 0.25){
        view.ctx.strokeStyle = '#000'
      }
      view.ctx.lineWidth = 16
      view.ctx.lineCap='round'

      view.ctx.beginPath()
      view.ctx.arc(0, 0, (this.attrs.initial_radius - radius / i), 2 * Math.PI * Math.random(), 2 * Math.PI * Math.random())
      view.ctx.stroke()
    }
    break
    
  case 'crater':
      // nop
      break

    case 0:
      view.ctx.fillStyle = 'rgba(' + this.attrs.color + ', ' + f.toFixed(2) + ')'
      view.ctx.beginPath()
      view.ctx.arc(0, 0, radius, 0, 2 * Math.PI)
      view.ctx.fill()
      break

  default:
      view.ctx.fillStyle = 'rgba(' + this.attrs.color + ', ' + f.toFixed(2) + ')'
      view.ctx.strokeStyle = 'rgba(' + this.attrs.color + ', ' + f.toFixed(2) + ')'
      view.ctx.beginPath()
      view.ctx.arc(0, 0, radius, 0, 2 * Math.PI)
      view.ctx.fill()
      view.ctx.stroke()
      break
  }

  view.ctx.restore()
}

