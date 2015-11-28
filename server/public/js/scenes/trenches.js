/* global Scenes, Scene, Actors */

Scenes.trenches = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.trenches.prototype = Object.create(Scene.prototype)

Scenes.trenches.prototype.title = 'Trenches'
Scenes.trenches.prototype.layout = 'scanner'

Scenes.trenches.prototype.init = function () {
  this.armies = []
  this.soldiers = []
  this.guns = []

  this.armies.push(new Actors.Army(
    this.env,
    {
      scene: this,
      armies: this.armies,
      soldiers: this.soldiers,
      guns: this.guns
    },
    {
      x: this.opts.max_x * 0.1,
      y: this.opts.max_y * 0.5,
      z: 0,
      color: '#ff0'
    }
  ))

  this.armies.push(new Actors.Army(
    this.env,
    {
      scene: this,
      armies: this.armies,
      soldiers: this.soldiers,
      guns: this.guns
    },
    {
      x: this.opts.max_x * 0.9,
      y: this.opts.max_y * 0.5,
      z: 0,
      color: '#0ff'
    }
  ))
}

Scenes.trenches.prototype.getCast = function () {
  return {
    Army: Actors.Army,
    Soldier: Actors.Soldier
  }
}

Scenes.trenches.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 800,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 320,
  min: 100,
  max: 1000
}, {
  key: 'max_z',
  info: 'Max Z',
  value: 100,
  min: 50,
  max: 500
}]

Scenes.trenches.prototype.genAttrs = function () {
  return {
  }
}

Scenes.trenches.prototype.update = function (delta) {
  this.armies.forEach(function (army) {
    army.update(delta)
  }, this)

  this.soldiers.forEach(function (soldier) {
    soldier.update(delta)
  }, this)
}

Scenes.trenches.prototype.paint = function (fx, gx) {
  gx.ctx.fillStyle = '#111'
  gx.ctx.beginPath()
  gx.ctx.rect(0, 0, this.opts.max_x, this.opts.max_y)
  gx.ctx.stroke()
  gx.ctx.fill()

  this.armies.forEach(function (army) {
    army.paint(gx)
  }, this)

  this.soldiers.forEach(function (soldier) {
    soldier.paint(gx)
  }, this)
}

Scenes.trenches.prototype.help = []
