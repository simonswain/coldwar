/* global Scenes, Scene, Actors */

Scenes.booms = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.booms.prototype = Object.create(Scene.prototype)

Scenes.booms.prototype.title = 'Booms'

Scenes.booms.prototype.layout = ''

Scenes.booms.prototype.init = function () {
  this.booms = []
}

Scenes.booms.prototype.getCast = function () {
  return {
    Boom: Actors.Boom
  }
}

Scenes.booms.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 1024,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 1024,
  min: 32,
  max: 1024
}, {
  key: 'count',
  info: '',
  value: 10,
  min: 1,
  max: 32
}, {
  key: 'probability',
  info: '',
  value: 0.9,
  min: 0,
  max: 1,
  step: 0.1
}, {
  key: 'rainbow',
  info: '',
  value: 1,
  min: 0,
  max: 1
}, {
  key: 'unpredictable',
  info: '',
  value: 1,
  min: 0,
  max: 1
}]

Scenes.booms.prototype.genAttrs = function () {
  return {
  }
}

Scenes.booms.prototype.update = function (delta) {
  this.booms.forEach(function (boom) {
    boom.update(delta)
  })

  this.booms.forEach(function (boom, i) {
    if (boom.attrs.dead) {
      this.booms.splice(i, 1)
    }
  }, this)

  var x, y, style

  while (this.booms.length < this.opts.count) {
    if (Math.random() < this.opts.probability) {
      return
    }

    x = Math.random() * this.opts.max_x
    y = Math.random() * this.opts.max_y

    if (this.opts.unpredictable) {
      style = Math.floor(Math.random() * Actors.Boom.prototype.styles.length)
    }

    this.booms.push(new Actors.Boom(
      this.env, {
        scene: this
      }, {
        x: x,
        y: y,
        style: style,
        color: this.opts.rainbow ? Math.floor(Actors.Boom.prototype.colors.length * Math.random()) : false
      }
    ))
  }
}

Scenes.booms.prototype.onClick = function (x, y, e) {
  this.booms.push(new Actors.Boom(
    this.env, {
      scene: this
    }, {
      x: x,
      y: y
    }
  ))
}

Scenes.booms.prototype.paint = function (fx, gx, sx) {
  this.booms.forEach(function (boom, i) {
    boom.paint(gx)
  }, this)
}

Scenes.booms.prototype.paintHist = function (view) {
  view.ctx.save()
  // view.ctx.translate(0, this.opts.max_y / 2)
  view.ctx.translate(this.opts.max_x * 0.25, this.opts.max_y * 0.5)

  view.ctx.strokeStyle = '#444'
  view.ctx.lineWidth = 2

  var t = this.attrs.hist[0][0]
  var x = 0
  var y = this.attrs.hist[0][2]

  view.ctx.beginPath()
  view.ctx.moveTo(x, y)
  for (var i = 0, ii = this.attrs.hist.length; i < ii; i++) {
    x -= (this.attrs.hist[i][0] - t)
    t = this.attrs.hist[i][0]
    y = this.attrs.hist[i][2]
    view.ctx.lineTo(x, y)
  }
  view.ctx.stroke()

  view.ctx.restore()
}

Scenes.booms.prototype.getHelp = function () {
  return ''
}
