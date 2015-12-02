/* global Scenes, Scene */

Scenes.raster = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.raster.prototype = Object.create(Scene.prototype)

Scenes.raster.prototype.title = 'Raster'

Scenes.raster.prototype.layout = ''

Scenes.raster.prototype.init = function () {}

Scenes.raster.prototype.getCast = function () {
  return {
  }
}

Scenes.raster.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 1024,
  min: 640,
  max: 1024
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 1024,
  min: 640,
  max: 1024
}, {
  key: 'max_z',
  info: 'Max Z',
  value: 1,
  min: 1,
  max: 1
}]

Scenes.raster.prototype.genAttrs = function () {
  return {
    at: 0,
    time: 0,
    scan: 0,
    frame: 0,
    rate: 0.5,
    delta: 0
  }
}

Scenes.raster.prototype.frames = [
  [
    '011110'.split(''),
    '110001'.split(''),
    '011110'.split('')
  ],
  [
    '011110'.split(''),
    '101001'.split(''),
    '011110'.split('')
  ],
  [
    '011110'.split(''),
    '100101'.split(''),
    '011110'.split('')
  ],
  [
    '011110'.split(''),
    '100011'.split(''),
    '011110'.split('')
  ]
]

Scenes.raster.prototype.update = function (delta) {
  this.attrs.scan = this.attrs.scan + this.attrs.rate
  if (this.attrs.scan >= 18) {
    this.attrs.scan = 0
    this.attrs.frame++
    if (this.attrs.frame >= this.frames.length) {
      this.attrs.frame = 0
      this.attrs.rate = this.attrs.rate * 2
      if (this.attrs.rate > 1) {
        this.attrs.rate = 1
      }
    }
  }
}

Scenes.raster.prototype.paint = function (fx, gx, sx, ex) {
  this.paintMemory(fx, gx, sx, ex)

  var r = 96

  var pixels = this.frames[this.attrs.frame]
  var x, y

  x = Math.floor(this.attrs.scan % 6)
  y = Math.floor(this.attrs.scan / 6)

  ex.ctx.save()

  fx.ctx.save()
  fx.ctx.translate(this.opts.max_x / 2 - (r * 3), this.opts.max_y / 2 - (r * 1.5))
  fx.ctx.scale(r, r * 1.4)

  gx.ctx.save()
  gx.ctx.translate(this.opts.max_x / 2 - (r * 3), this.opts.max_y / 2 - (r * 1.5))
  gx.ctx.scale(r, r * 1.4)

  fx.lineWidth = 0
  gx.lineWidth = 0

  fx.ctx.lineWidth = 0.025
  fx.ctx.strokeStyle = '#fff'

  gx.ctx.lineWidth = 0.05
  gx.ctx.fillStyle = '#fff'
  gx.ctx.strokeStyle = '#fff'

  // tube

  fx.ctx.beginPath()
  fx.ctx.moveTo(-2, 0.5)
  fx.ctx.lineTo(-2, 1.5)
  fx.ctx.lineTo(0, 1.5)
  fx.ctx.lineTo(3, 3)
  fx.ctx.lineTo(3.2, 3)
  fx.ctx.lineTo(3.2, -1.5)
  fx.ctx.lineTo(3, -1.5)
  fx.ctx.lineTo(0, 0.5)
  fx.ctx.lineTo(-2, 0.5)
  gx.ctx.fillStyle = '#000'
  fx.ctx.fill()
  fx.ctx.stroke()

  gx.ctx.fillStyle = '#fff'

  fx.ctx.beginPath()
  fx.ctx.rect(3.2, -1.5, 4.5, 4.5)
  fx.ctx.stroke()

  if (pixels[y][x] === '1') {
    gx.ctx.lineWidth = 0.025
    gx.ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)'

    gx.ctx.beginPath()
    gx.ctx.moveTo(-0.5, 1)
    gx.ctx.lineTo(1.5, 1)
    gx.ctx.lineTo(3.8 + x * 0.6, y)
    gx.ctx.stroke()

    if (y === 0) {
      gx.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'
      gx.ctx.beginPath()
      gx.ctx.rect(1.3, 0.75, 0.4, 0.1)
      gx.ctx.fill()

      gx.ctx.fillStyle = 'rgba(0, 255, 0, .25)'
      gx.ctx.beginPath()
      gx.ctx.rect(1.3, 1.15, 0.4, 0.1)
      gx.ctx.fill()
    }

    if (y === 1) {
      gx.ctx.fillStyle = 'rgba(0, 255, 0, .25)'
      gx.ctx.beginPath()
      gx.ctx.rect(1.3, 0.75, 0.4, 0.1)
      gx.ctx.fill()
      gx.ctx.fillStyle = 'rgba(0, 255, 0, 0.25)'
      gx.ctx.beginPath()
      gx.ctx.rect(1.3, 1.15, 0.4, 0.1)
      gx.ctx.fill()
    }

    if (y === 2) {
      gx.ctx.fillStyle = 'rgba(0, 255, 0, .25)'
      gx.ctx.beginPath()
      gx.ctx.rect(1.3, 0.75, 0.4, 0.1)
      gx.ctx.fill()
      gx.ctx.fillStyle = 'rgba(0, 255, 0, 1)'
      gx.ctx.beginPath()
      gx.ctx.rect(1.3, 1.15, 0.4, 0.1)
      gx.ctx.fill()
    }

    fx.ctx.strokeStyle = '#fff'
    fx.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    fx.ctx.beginPath()
    fx.ctx.rect(3.8 + x * 0.6, y - 0.3, 0.4, 0.6)
    fx.ctx.fill()
    fx.ctx.stroke()

  // gx.ctx.beginPath()
  // gx.ctx.rect(3.8 + x * 0.6, y - 0.3, .4, .6)
  // gx.ctx.fill()
  // gx.ctx.stroke()
  }

  // tube cover line for electron bean

  fx.ctx.beginPath()
  fx.ctx.moveTo(3.2, 3)
  fx.ctx.lineTo(3.2, -1.5)
  fx.ctx.stroke()

  gx.ctx.restore()
  fx.ctx.restore()
  ex.ctx.restore()
}

Scenes.raster.prototype.paintMemory = function (view) {
  var r = 48

  var pixels = this.frames[this.attrs.frame]
  var x, y

  x = Math.floor(this.attrs.scan % 6)
  y = Math.floor(this.attrs.scan / 6)

  view.ctx.save()
  // view.ctx.translate(this.opts.max_x * 0.1, this.opts.max_y * 0.2)
  // view.ctx.scale(r, r)

  view.lineWidth = 0

  view.ctx.lineWidth = 0.025
  view.ctx.strokeStyle = '#000'

  view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  view.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'

  if (pixels[y][x] === '1') {
    view.ctx.beginPath()
    view.ctx.rect((this.opts.max_x * 0.05) + (x * r) - (r * 0.3), (this.opts.max_y * 0.2) + (y * r) - (r * 0.3), r * 0.6, r * 0.6)
    // view.ctx.rect(x * 0.6, y - 0.3, .4, .6)
    view.ctx.fill()
    view.ctx.stroke()
  }

  view.ctx.restore()

  if (pixels[y][x] === '1') {
    view.ctx.strokeStyle = 'rgba(255, 0, 96, 0.4)'
    view.ctx.beginPath()
    view.ctx.moveTo((this.opts.max_x * 0.05) + (x * r), (this.opts.max_y * 0.2) + (y * r))
    view.ctx.lineTo(this.opts.max_x * 0.172, this.opts.max_y * 0.49)
    view.ctx.fill()
    view.ctx.stroke()
  }
}

Scenes.raster.prototype.help = [
  'In the 80s, computer displays were made from a glass tube. One end of that tube was large and rectangular. On the interior surface of that large rectangle was painted a coating of phosphor. At the rear end of the tube there was an electron gun. It would fire electrons down the tube towards the phosphor coated surface. When the electrons strike the phosphor they would cause it to glow temporarily. Wrapped around this stream of electrons was a set of magnets. These could cause the beam to be deflected horizontally and vertically, to any location on the front of the glass tube.',
  'Now, if you have a region of memory, and sequentially read the values of the bits held in that memory, and use the values of those bits to modulate the electron beam on an off as you scan it across and down the front of the glass tube, you can cause a representation of the values held in those bits to be painted to the front of your screen. This is how a bitmap display works. We call this a Raster Scan Display. The foundation of all computer displays in use today.'
]
