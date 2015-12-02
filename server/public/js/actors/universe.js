/* global Actors */

Actors.Universe = function (opts) {
  if (!opts) {
    opts = {}
  }

  this.setParams(opts)
  this.init()
}

Actors.Universe.prototype.title = 'Universe'

Actors.Universe.prototype.getParams = function () {
  return [{
    key: 'system_count',
    info: 'System',
    value: 10,
    min: 1,
    max: 1000
  }, {
    key: 'max_x',
    info: 'Max X',
    inherit: true
  }, {
    key: 'max_y',
    info: 'Max Y',
    inherit: true
  }, {
    key: 'max_z',
    info: 'Max Z',
    inherit: true
  }]
}

Actors.Universe.prototype.setParams = function (opts) {
  this.params = this.getParams()
  console.log(this.params)
  this.opts = {}
  this.params.forEach(function (param) {
    if (opts && opts.hasOwnProperty(param.key)) {
      this.opts[param.key] = Number(opts[param.key])
    } else {
      this.opts[param.key] = param.value
    }
  }, this)
}

Actors.Universe.prototype.x = function (f) {
  return this.opts.max_x * f
}

Actors.Universe.prototype.y = function (f) {
  return this.opts.max_y * f
}

Actors.Universe.prototype.z = function (f) {
  return this.opts.max_z * f
}

Actors.Universe.prototype.init = function () {
  this.systems = []
  for (var i = 0, ii = this.opts.system_count; i < ii; i++) {
    this.systems.push(new Actors.System({
      x: this.x(Math.random()),
      y: this.y(Math.random()),
      z: this.z(Math.random())
    }))
  }
}

Actors.Universe.prototype.update = function (delta) {
  for (var i = 0, ii = this.systems.length; i < ii; i++) {
    this.systems[i].update(delta)
  }
}

Actors.Universe.prototype.paint = function (view) {
  view.ctx.strokeStyle = '#222'
  view.ctx.lineWidth = 8
  view.ctx.beginPath()
  view.ctx.strokeRect(this.x(0), this.y(0), this.x(1), this.y(1))
  view.ctx.stroke()

  for (var i = 0, ii = this.systems.length; i < ii; i++) {
    this.systems[i].paint(view)
  }
}

Actors.Universe.prototype.elevation = function (view) {
  view.ctx.strokeStyle = '#222'
  view.ctx.lineWidth = 8
  view.ctx.beginPath()
  view.ctx.strokeRect(this.x(0), this.z(0), this.x(1), this.z(1))
  view.ctx.stroke()

  for (var i = 0, ii = this.systems.length; i < ii; i++) {
    this.systems[i].elevation(view)
  }
}
