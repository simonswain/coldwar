/* global Scenes, Scene, Actors */

Scenes.crt = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.crt.prototype = Object.create(Scene.prototype)

Scenes.crt.prototype.title = 'Crt'

Scenes.crt.prototype.init = function () {
  this.crt = new Actors.Crt(
    this.env, {
      scene: this
    }, {
    })
}

Scenes.crt.prototype.getCast = function () {
  return {
    Crt: Actors.Crt
  }
}

Scenes.crt.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 640,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 480,
  min: 100,
  max: 1000
}]

Scenes.crt.prototype.genAttrs = function () {
  return {
  }
}

Scenes.crt.prototype.update = function (delta) {
  this.crt.update(delta)
}

Scenes.crt.prototype.flash = function (fx, gx) {
  this.crt.flash(fx, gx)
}

Scenes.crt.prototype.paint = function (fx, gx, sx) {
  this.crt.paint(fx, gx)
}

Scenes.crt.prototype.getHelp = function () {
  return ''
}
