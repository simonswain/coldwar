/* global Actors, Actor, Vec3, pickOne */

Actors.City = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.City.prototype = Object.create(Actor.prototype)

Actors.City.prototype.title = 'City'

Actors.City.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    color: attrs.color || '#f0f',
    title: attrs.title || '',
    dead: false,
    // production units
    units: 0,
    unit_rate: this.opts.unit_rate || 0,
    pop: 5 + Math.floor(Math.random() * 5),
    timer: 0,
    checkpoint: 90 + (20 * Math.random()),
    abms_launched: 0,
    abm_launch_max: this.opts.abm_launch_max || 0,
    abm_launch_per_tick: this.opts.abm_launch_per_tick || 1,
    stock: {
      abms: (attrs.stock && attrs.stock.abms) ? attrs.stock.abms : this.opts.stock_abms
    }
  }
}

Actors.City.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  )
}

Actors.City.prototype.defaults = [{
  key: 'unit_rate',
  info: 'Unit Production Rate for Factories',
  value: 1,
  min: 0,
  max: 5
}, {
  key: 'stock_abms',
  info: '',
  value: 100,
  min: 10,
  max: 1000
}, {
  key: 'abm_launch_max',
  info: 'Number of ABMs each Base can have in air at any time',
  value: 10,
  min: 0,
  max: 100
}]

Actors.City.prototype.update = function (delta) {
  this.attrs.timer += delta
  this.launchAbms()
  this.attrs.units += this.attrs.unit_rate
  if (this.attrs.timer > this.attrs.checkpoint) {
    this.attrs.timer = 0
    this.distributeUnits()
  }
}

// for receiving stock from factory
Actors.City.prototype.addStock = function (stock) {
  this.stock.abms += stock.abms || 0
}

// distribute production units to factories
Actors.City.prototype.distributeUnits = function () {
  if (this.attrs.units === 0) {
    return
  }

  if (!this.refs.capital) {
    return
  }

  var i, ii

  var targets = []

  this.refs.scene.factories.forEach(function (factory) {
    if (factory.refs.capital === this.refs.capital) {
      targets.push(factory)
    }
  }, this)

  if (targets.length === 0) {
    return
  }

  var units = Math.floor(this.attrs.units / targets.length)

  for (i = 0, ii = targets.length; i < ii; i++) {
    this.refs.scene.supplies.push(new Actors.Supply(
      this.env, {
        scene: this.refs.scene,
        capital: this.refs.capital,
        target: targets[i]
      }, {
        x: this.pos.x,
        y: this.pos.y,
        color: this.attrs.color,
        units: units
      }
    ))
    this.attrs.units -= units
  }
}

Actors.City.prototype.launchAbms = function () {
  var launched_this_tick = 0
  var targets, target

  if (this.attrs.stock.abms <= 0 || this.attrs.abms_launched >= this.attrs.abm_launch_max) {
    return
  }

  targets = []

  var icbm

  for (var i = 0, ii = this.refs.scene.icbms.length; i < ii; i++) {
    icbm = this.refs.scene.icbms[i]

    if (icbm.attrs.dead) {
      continue
    }

    if (icbm.refs.capital === this.refs.capital) {
      continue
    }

    if (Math.abs(icbm.pos.x - this.pos.x) < this.attrs.danger_close) {
      targets.push(icbm)
    }
  }

  if (targets.length === 0) {
    return
  }

  while (this.attrs.stock.abms > 0 && this.attrs.abms_launched < this.attrs.abm_launch_max && launched_this_tick < this.attrs.abm_launch_per_tick) {
    target = pickOne(targets)

    this.refs.scene.abms.push(new Actors.Abm(
      this.env, {
        scene: this.refs.scene,
        target: target,
        base: this
      }, {
        x: this.pos.x,
        y: this.pos.y,
        color: this.attrs.color
      }))

    launched_this_tick++
    this.attrs.abms_launched++
    this.attrs.stock.abms--
  }
}

Actors.City.prototype.paint = function (view) {
  var xf = 8

  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)

  view.ctx.strokeStyle = this.attrs.color
  view.ctx.lineWidth = xf / 2

  view.ctx.beginPath()
  view.ctx.arc(0, 0, xf, 0, 2 * Math.PI)
  view.ctx.stroke()
  view.ctx.fillStyle = '#000'
  view.ctx.fill()

  view.ctx.lineWidth = xf / 8

  if (this.attrs.units > 0) {
    view.ctx.beginPath()
    view.ctx.arc(0, 0, xf * 0.8, 0, (2 * Math.PI) * ((this.attrs.timer * 2) / this.attrs.checkpoint))
    view.ctx.stroke()
  }

  if (this.attrs.timer > (this.attrs.checkpoint / 2)) {
    view.ctx.strokeStyle = '#000'
    view.ctx.beginPath()
    view.ctx.arc(0, 0, xf * 0.8, 0, (2 * Math.PI) * (((this.attrs.timer * 2) - this.attrs.checkpoint) / this.attrs.checkpoint))
    view.ctx.stroke()
  }

  // view.ctx.fillStyle = this.attrs.color
  // view.ctx.font = '9pt monospace'
  // view.ctx.textBaseline = 'middle'
  // view.ctx.textAlign = 'center'

  // if (this.attrs.units > 0) {
  //   view.ctx.fillText(this.attrs.units.toFixed(0), 0, -24)
  // }

  if (this.attrs.title) {
    view.ctx.fillStyle = this.attrs.color
    view.ctx.font = '10pt monospace'
    view.ctx.textBaseline = 'middle'
    view.ctx.textAlign = 'center'
    view.ctx.fillText(this.attrs.title, 0, 32)
  }

  view.ctx.restore()
}

Actors.City.prototype.elevation = function (view) {
  var xf = 8

  view.ctx.save()
  view.ctx.translate(this.pos.x, ((this.refs.scene.opts.max_z - this.pos.z)))

  view.ctx.lineWidth = 2
  view.ctx.strokeStyle = this.attrs.color
  view.ctx.fillStyle = '#000'
  view.ctx.beginPath()
  view.ctx.arc(0, 0, xf / 2, 0, 2 * Math.PI)
  view.ctx.stroke()
  view.ctx.fill()

  view.ctx.restore()
}
