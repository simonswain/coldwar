/* global Scenes, Scene */

Scenes.tone = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.tone.prototype = Object.create(Scene.prototype)

Scenes.tone.prototype.title = 'Tone'

Scenes.tone.prototype.layout = ''

Scenes.tone.prototype.stop = function () {
  this.analyser.disconnect(0)
  this.analyser = null

  this.filter.disconnect(0)
  this.filter = null

  this.mix.disconnect(0)
  this.mix = null

  this.amp1.disconnect(0)
  this.amp1 = null

  this.amp2.disconnect(0)
  this.amp2 = null

  this.osc1.stop(0)
  this.osc1.disconnect(0)
  this.osc1 = null

  this.osc2.stop(0)
  this.osc2.disconnect(0)
  this.osc2 = null
}

Scenes.tone.prototype.init = function () {
  this.maze = new Actors.Maze(
    this.env, {
      scene: this
    }, {
    })


}

Scenes.tone.prototype.getCast = function () {
  return {
    Tone: Actors.tone
  }
}

Scenes.tone.prototype.defaults = [{
  key: 'max_x',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 480,
  min: 32,
  max: 1024
}]

Scenes.tone.prototype.genAttrs = function () {
  return {
  }
}

Scenes.tone.prototype.update = function (delta) {}

Scenes.tone.prototype.paint = function (fx, gx, sx) {
}
