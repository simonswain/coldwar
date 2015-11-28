/* global Actors, Vec3 */

Actors.Bomb = function (env, opts, attrs) {
  this.env = env
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.world = opts.world
  this.target = opts.target
  this.init()
}

Actors.Bomb.prototype.title = 'Bomb'

Actors.Bomb.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y
  )
  // target was destroyed before we could aim at it
  if (!this.target) {
    this.dead = true
    return
  }

  this.velo = this.target.pos.minus(this.pos).normalize().scale(this.attrs.speed * 5)
  this.gravity = new Vec3(0, 0.01)
}

Actors.Bomb.prototype.defaults = [{
  key: 'color',
  info: 'spectrum',
  value: 4,
  min: 0,
  max: 7
}, {
  key: 'sensitivity',
  info: '',
  value: 64,
  min: 0,
  max: 255
}]

// spectrum 000 00f f00 f0f 0f0 0ff ff0 fff

Actors.Bomb.prototype.getParams = function () {
  return this.defaults
}

Actors.Bomb.prototype.genOpts = function (args) {
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

Actors.Bomb.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    launched: 0,
    dead: false,
    speed: 0.05 + (Math.random() * 0.05)
  }
}

Actors.Bomb.prototype.x = function (f) {
  return this.opts.max_x * f
}

Actors.Bomb.prototype.y = function (f) {
  return this.opts.max_y * f
}

Actors.Bomb.prototype.z = function (f) {
  return this.opts.max_z * f
}

Actors.Bomb.prototype.update = function (delta) {
  if (!this.target) {
    this.dead = true
    return
  }

  var accel = this.target.pos.minus(this.pos).normalize().scale(this.attrs.speed)
  this.velo.add(accel)
  this.pos.add(this.velo)
  this.velo.add(this.gravity)

  // hit target?
  var range = this.pos.range(this.target.pos)

  if (range < this.opts.sensitivity) {
    this.attrs.dead = true
    this.world.booms.push(new Actors.Boom(
      this.env, {
      }, {
        style: '',
        radius: 50,
        x: this.pos.x,
        y: this.pos.y,
        z: this.pos.z,
        color: '255,255,255'
      }
    ))

    if (!this.target.attrs.dead) {
      // ensure only boom on targe, in case another bomb has already
      // destroyed it
      this.target.attrs.dead = true
      this.env.flash = 2
      this.world.booms.push(new Actors.Boom(
        this.env, {
        }, {
          style: 'zoom',
          radius: 100,
          ttl: 120,
          x: this.target.pos.x,
          y: this.target.pos.y,
          z: this.target.pos.z,
          color: '255,0,255'
        }
      ))
    }
  }

  // gone past target
  if (this.pos.y > this.target.pos.y) {
    this.attrs.dead = true
    this.world.booms.push(new Actors.Boom(
      this.env, {
        world: this,
        color: '4'
      }, {
        style: '',
        radius: 35,
        x: this.pos.x,
        y: this.pos.y,
        color: '127,127,127'
      }
    ))
  }
}

Actors.Bomb.prototype.paint = function (view) {
  if (!this.velo) {
    return
  }
  view.ctx.save()
  view.ctx.rotate(this.velo.angleXY())
  view.ctx.fillStyle = '#f0f'
  view.ctx.beginPath()
  // draw the object horizontally!
  view.ctx.rect(-12, -2, 24, 4)
  view.ctx.fill()
  view.ctx.restore()
}

Actors.Bomb.prototype.elevation = function (view) {
  view.ctx.save()
  view.ctx.rotate(this.velo.angleXY())
  view.ctx.fillStyle = '#f0f'
  view.ctx.beginPath()
  // draw the object horizontally!
  view.ctx.rect(-12, -2, 24, 4)
  view.ctx.fill()
  view.ctx.restore()
}
