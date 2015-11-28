/* global Scenes, Scene, Actors, pickOne */

Scenes.interception = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.interception.prototype = Object.create(Scene.prototype)

Scenes.interception.prototype.title = 'Interception'

Scenes.interception.prototype.init = function () {
  this.attrs = this.genAttrs()

  this.silos = []
  this.bombs = []
  this.booms = []
  this.interceptors = []

  var x
  var xx = (this.opts.max_x / (this.opts.silos_max + 1))
  for (var i = 0; i < this.opts.silos_max; i++) {
    x = xx + (xx * i)
    this.silos.push(new Actors.Silo(
      this.env,
      {
        world: this,
        color: '4'
      },
      {
        x: x,
        y: this.opts.max_y * 0.9,
        z: this.opts.max_z * 0.2
      }
    ))
  }
}

Scenes.interception.prototype.getCast = function () {
  return {
    Silo: Actors.Silo,
    Bomb: Actors.Bomb,
    Interceptor: Actors.Interceptor,
    Boom: Actors.Boom
  }
}

Scenes.interception.prototype.defaults = [{
  key: 'screen_mode',
  value: 1,
  min: 1,
  max: 1
}, {
  key: 'max_x',
  info: 'Max X',
  value: 600,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 960,
  min: 100,
  max: 1000
}, {
  key: 'max_z',
  info: 'Max Z',
  value: 100,
  min: 50,
  max: 500
}, {
  key: 'silos_max',
  info: '',
  value: 3,
  min: 1,
  max: 10
}, {
  key: 'bombs_max',
  info: '',
  value: 3,
  min: 1,
  max: 50
}, {
  key: 'bombs_per_tick',
  info: '',
  value: 1,
  min: 1,
  max: 10
}]

Scenes.interception.prototype.genAttrs = function () {
  return {
  }
}

Scenes.interception.prototype.update = function (delta) {
  var i, ii
  var bombs_this_tick = 0
  delta = 1

  while (this.bombs.length < this.opts.bombs_max && bombs_this_tick < this.opts.bombs_per_tick) {
    bombs_this_tick++
    this.bombs.push(new Actors.Bomb(
      this.env,
      {
        world: this,
        color: '7',
        target: pickOne(this.silos)
      },
      {
        x: (this.opts.max_x * 0.125) + (this.opts.max_x * Math.random() * 0.75),
        y: this.opts.max_x * 0.1,
        z: 0
      }
    ))
  }

  for (i = 0, ii = this.bombs.length; i < ii; i++) {
    this.bombs[i].update(delta)
    if (this.bombs[i].attrs.dead) {
      this.bombs.splice(i, 1)
      i--
      ii--
    }
  }

  for (i = 0, ii = this.booms.length; i < ii; i++) {
    this.booms[i].update(delta)
    if (this.booms[i].attrs.dead) {
      this.booms.splice(i, 1)
      i--
      ii--
    }
  }

  for (i = 0, ii = this.silos.length; i < ii; i++) {
    this.silos[i].update(delta)
    if (this.silos[i].attrs.dead) {
      this.silos.splice(i, 1)
      i--
      ii--
    }
  }

  for (i = 0, ii = this.interceptors.length; i < ii; i++) {
    this.interceptors[i].update(delta)
    if (this.interceptors[i].attrs.dead) {
      this.interceptors.splice(i, 1)
      i--
      ii--
    }
  }

  if (this.silos.length === 0 && !this.env.gameover) {
    this.env.gameover = true
    setTimeout(this.env.restart, 2500)
  }
}

Scenes.interception.prototype.paint = function (fx, gx) {
  var i, ii
  for (i = 0, ii = this.silos.length; i < ii; i++) {
    gx.ctx.save()
    gx.ctx.translate(this.silos[i].pos.x, this.silos[i].pos.y)
    this.silos[i].paint(gx)
    gx.ctx.restore()
  }

  for (i = 0, ii = this.bombs.length; i < ii; i++) {
    gx.ctx.save()
    gx.ctx.translate(this.bombs[i].pos.x, this.bombs[i].pos.y)
    this.bombs[i].paint(gx)
    gx.ctx.restore()
  }

  for (i = 0, ii = this.interceptors.length; i < ii; i++) {
    gx.ctx.save()
    gx.ctx.translate(this.interceptors[i].pos.x, this.interceptors[i].pos.y)
    this.interceptors[i].paint(gx)
    gx.ctx.restore()
  }

  for (i = 0, ii = this.booms.length; i < ii; i++) {
    this.booms[i].paint(gx)
  }
}

Scenes.interception.prototype.getHelp = function () {
  var s = ''
  s += '<h1>Interception</h1>'
  s += '<p>'
  s += 'Basics.'
  s += '</p>'
  return s
}
