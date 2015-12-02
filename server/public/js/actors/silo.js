/* global Actors, Vec3, pickOne */

Actors.Silo = function (env, opts, attrs) {
  this.env = env
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)

  this.world = opts.world
  // access via world
  // this.booms = opts.booms
  // this.bombs = opts.bombs
  // this.interceptors = opts.interceptors

  this.init()
}

Actors.Silo.prototype.title = 'Silo'

Actors.Silo.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  )
  this.attrs.stock = this.opts.stock
}

Actors.Silo.prototype.defaults = [{
  key: 'launch_max',
  info: '',
  value: 2,
  min: 1,
  max: 100
}, {
  key: 'launch_per_tick',
  info: '',
  value: 1,
  min: 1,
  max: 100
}, {
  key: 'color',
  info: 'spectrum',
  value: 4,
  min: 0,
  max: 7
}, {
  key: 'stock',
  info: '',
  value: 1000,
  min: 0,
  max: 10000
}]

// spectrum 000 00f f00 f0f 0f0 0ff ff0 fff

Actors.Silo.prototype.getParams = function () {
  return this.defaults
}

Actors.Silo.prototype.genOpts = function (args) {
  var opts = {}
  var params = this.getParams()
  params.forEach(function (param) {
    if (args && args.hasOwnProperty(param.key)) {
      opts[param.key] = Number(args[param.key])
    } else {
      opts[param.key] = param.value
    }
  }, this)
  return opts
}

Actors.Silo.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    launched: 0,
    stock: this.opts.stock,
    dead: false,
    flash: false
  }
}

Actors.Silo.prototype.x = function (f) {
  return this.opts.max_x * f
}

Actors.Silo.prototype.y = function (f) {
  return this.opts.max_y * f
}

Actors.Silo.prototype.z = function (f) {
  return this.opts.max_z * f
}

Actors.Silo.prototype.update = function (delta) {
  var bomb
  var launched_this_tick = 0
  while (this.attrs.stock > 0 && this.attrs.launched < this.opts.launch_max && launched_this_tick < this.opts.launch_per_tick) {
    bomb = pickOne(this.world.bombs)

    if (!bomb) {
      break
    }

    if (bomb.h > this.h * 0.8) {
      launched_this_tick++
      continue
    }

    this.world.interceptors.push(new Actors.Interceptor(
      this.env, {
        world: this.world,
        silo: this,
        target: bomb
      }, {
        x: this.pos.x,
        y: this.pos.y,
        z: this.pos.z
      }
    ))

    this.attrs.launched++
    launched_this_tick++
    this.attrs.stock--
  }

  // if(this.env.timer > 10){
  //   this.attrs.flash = false
  // }

  // if(this.env.timer > 75){
  //   this.timer = 0
  //   this.flash = true
  // }
}

Actors.Silo.prototype.paint = function (view) {
  view.ctx.strokeStyle = this.color
  view.ctx.strokeStyle = '#fff'
  view.ctx.fillStyle = '#000'
  view.ctx.lineWidth = 2

  if (this.flash) {
    view.ctx.fillStyle = this.color
  } else {
    view.ctx.fillStyle = '#000'
  }

  view.ctx.beginPath()
  view.ctx.fillRect(-16, -16, 32, 32)
  view.ctx.strokeRect(-16, -16, 32, 32)

  view.ctx.fillStyle = '#0cc'
  view.ctx.font = '12pt monospace'
  view.ctx.textBaseline = 'middle'
  view.ctx.textAlign = 'center'
  view.ctx.fillText(this.attrs.stock, 0, 32)
}

Actors.Silo.prototype.elevation = function (view) {
  view.ctx.strokeStyle = this.color
  view.ctx.strokeStyle = '#fff'
  view.ctx.fillStyle = '#000'
  view.ctx.lineWidth = 2

  if (this.flash) {
    view.ctx.fillStyle = this.color
  } else {
    view.ctx.fillStyle = '#000'
  }

  view.ctx.beginPath()
  view.ctx.fillRect(-16, -16, 32, 32)
  view.ctx.strokeRect(-16, -16, 32, 32)

  view.ctx.fillStyle = '#0cc'
  view.ctx.font = '12pt monospace'
  view.ctx.textBaseline = 'middle'
  view.ctx.textAlign = 'center'
  view.ctx.fillText(this.attrs.stock, 0, 32)
}
