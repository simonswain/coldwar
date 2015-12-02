/* global Actors, Actor, Vec3, hex2rgb, pickOne */

Actors.Base = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Base.prototype = Object.create(Actor.prototype)

Actors.Base.prototype.title = 'Base'

Actors.Base.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    color: attrs.color || '#f0f',
    title: attrs.title || '',
    dead: false,

    // launch fighters when bombers within this range
    danger_close: this.refs.scene.opts.max_x * this.opts.danger_close,

    // bomber_launch_max: Math.floor(this.bomber_launch_max * Math.random()),
    // fighter_launch_max: Math.floor(this.fighter_launch_max * Math.random()),
    // icbm_launch_max: this.icbm_launch_max,
    // abm_launch_max: this.abm_launch_max,

    bombers_launched: 0,
    bomber_launch_max: this.opts.bomber_launch_max || 0,
    bomber_launch_per_tick: this.opts.bomber_launch_per_tick || 1,

    fighters_launched: 0,
    fighter_launch_max: this.opts.fighter_launch_max || 0,
    fighter_launch_per_tick: this.opts.fighter_launch_per_tick || 1,

    icbms_launched: 0,
    icbm_launch_max: this.opts.icbm_launch_max || 0,
    icbm_launch_per_tick: this.opts.icbm_launch_per_tick || 1,

    abms_launched: 0,
    abm_launch_max: this.opts.abm_launch_max || 0,
    abm_launch_per_tick: this.opts.abm_launch_per_tick || 1,

    stock: {
      bombers: (attrs.stock && attrs.stock.bombers) ? attrs.stock.bombers : this.opts.stock_bombers,
      fighters: (attrs.stock && attrs.stock.fighters) ? attrs.stock.fighters : this.opts.stock_fighters,
      icbms: (attrs.stock && attrs.stock.icbms) ? attrs.stock.icbms : this.opts.stock_icbms,
      abms: (attrs.stock && attrs.stock.abms) ? attrs.stock.abms : this.opts.stock_abms
    }
  }
}

Actors.Base.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  )
}

Actors.Base.prototype.defaults = [{
  key: 'stock_bombers',
  info: '',
  value: 0,
  min: 10,
  max: 1000
}, {
  key: 'stock_fighters',
  info: '',
  value: 0,
  min: 0,
  max: 1000
}, {
  key: 'stock_icbms',
  info: '',
  value: 0,
  min: 0,
  max: 1000
}, {
  key: 'stock_abms',
  info: '',
  value: 0,
  min: 0,
  max: 10000
}, {
  key: 'sats_max',
  info: '',
  value: 1,
  min: 0,
  max: 10
}, {
  key: 'fighter_launch_max',
  info: '',
  value: 5,
  min: 0,
  max: 100
}, {
  key: 'bomber_launch_max',
  info: '',
  value: 3,
  min: 0,
  max: 100
}, {
  key: 'icbm_launch_max',
  info: '',
  value: 3,
  min: 0,
  max: 100
}, {
  key: 'abm_launch_max',
  info: '',
  value: 10,
  min: 0,
  max: 100
}, {
  key: 'danger_close',
  info: '',
  value: 0.2,
  min: 0.01,
  max: 0.5
}]

Actors.Base.prototype.update = function (delta) {
  this.launchBombers()
  this.launchFighters()
  this.launchIcbms()
  this.launchAbms()
}

// factory will add stock to base
Actors.Base.prototype.addStock = function (stock) {
  this.attrs.stock.bombers += stock.bombers || 0
  this.attrs.stock.fighters += stock.fighters || 0
  this.attrs.stock.icbms += stock.icbms || 0
  this.attrs.stock.abms += stock.abms || 0
}

Actors.Base.prototype.launchBombers = function () {
  if (!this.refs.capital) {
    return
  }

  if (this.refs.capital.attrs.defcon > 3 && !this.refs.capital.attrs.strike) {
    return
  }

  var launched_this_tick = 0
  var targets, target

  var i, ii

  if (this.attrs.stock.bombers <= 0 || this.attrs.bombers_launched >= this.attrs.bomber_launch_max) {
    return
  }
  targets = []

  if (targets.length === 0) {
    for (i = 0, ii = this.refs.scene.factories.length; i < ii; i++) {
      if (this.refs.scene.factories[i].refs.capital !== this.refs.capital) {
        targets.push(this.refs.scene.factories[i])
      }
    }
  }

  if (targets.length === 0) {
    for (i = 0, ii = this.refs.scene.cities.length; i < ii; i++) {
      if (this.refs.scene.cities[i].refs.capital !== this.refs.capital) {
        targets.push(this.refs.scene.cities[i])
      }
    }
  }

  // only attack capital if nothing else left
  if (targets.length === 0) {
    for (i = 0, ii = this.refs.scene.capitals.length; i < ii; i++) {
      if (this.refs.scene.capitals[i].refs !== this.refs.capital) {
        targets.push(this.refs.scene.capitals[i])
      }
    }
  }

  if (targets.length === 0) {
    for (i = 0, ii = this.refs.scene.bases.length; i < ii; i++) {
      if (this.refs.scene.bases[i].refs.capital !== this.refs.capital) {
        targets.push(this.refs.scene.bases[i])
      }
    }
  }

  if (targets.length === 0) {
    return
  }

  while (this.attrs.stock.bombers > 0 && this.attrs.bombers_launched < this.attrs.bomber_launch_max && launched_this_tick < this.attrs.bomber_launch_per_tick) {
    target = pickOne(targets)

    this.refs.scene.bombers.push(new Actors.Bomber(
      this.env, {
        scene: this.refs.scene,
        base: this,
        capital: this.refs.capital,
        target: target
      }, {
        x: this.pos.x,
        y: this.pos.y,
        color: this.attrs.color
      }
    ))
    launched_this_tick++
    this.attrs.bombers_launched++
    this.attrs.stock.bombers--
  }
}

Actors.Base.prototype.launchFighters = function () {
  if (this.refs.capital.defcon > 4) {
    return
  }

  var targets, target
  var i, ii

  var launched_this_tick = 0

  if (!this.refs.capital) {
    return
  }

  if (this.attrs.stock.fighters <= 0 || this.attrs.fighter_launch_max < this.attrs.fighters_launched) {
    return
  }

  targets = []

  // if any bomber is in range, then attack. Later, this logic should
  // use warnings from sats or capital

  // incoming bomber detection
  for (i = 0, ii = this.refs.scene.bombers.length; i < ii; i++) {
    target = this.refs.scene.bombers[i]

    if (target.refs.capital === this.refs.capital) {
      continue
    }

    if (this.pos.range(target.pos) < this.attrs.danger_close) {
      targets.push(target)
      break
    }
  }

  if (targets.length === 0) {
    return
  }

  while (this.attrs.stock.fighters > 0 && this.attrs.fighters_launched < this.attrs.fighter_launch_max && launched_this_tick < this.attrs.fighter_launch_per_tick) {
    // fighter will pick it's own target
    this.refs.scene.fighters.push(new Actors.Fighter(
      this.refs, {
        base: this,
        scene: this.refs.scene,
        capital: this.refs.capital
      }, {
        x: this.pos.x,
        y: this.pos.y,
        color: this.attrs.color
      }
    ))
    launched_this_tick++
    this.attrs.fighters_launched++
    this.attrs.stock.fighters--
  }
}

Actors.Base.prototype.launchIcbms = function () {
  if (this.refs.capital.attrs.defcon > 3) {
    return
  }

  // 1% chance if defcon 3 or 2
  if (this.refs.capital.attrs.defcon > 1 && Math.random() > 0.001) {
    return
  }

  var launched_this_tick = 0
  var targets, target

  var i, ii

  if (!this.refs.capital) {
    return
  }

  if (this.attrs.stock.icbms <= 0 || this.attrs.icbms_launched > this.attrs.icbm_launch_max) {
    return
  }

  targets = []

  if (targets.length === 0) {
    for (i = 0, ii = this.refs.scene.capitals.length; i < ii; i++) {
      if (this.refs.scene.capitals[i] !== this.refs.capital) {
        targets.push(this.refs.scene.capitals[i])
      }
    }
  }

  for (i = 0, ii = this.refs.scene.factories.length; i < ii; i++) {
    if (this.refs.scene.factories[i].refs.capital !== this.refs.capital && !this.refs.scene.factories[i].dead) {
      targets.push(this.refs.scene.factories[i])
    }
  }

  for (i = 0, ii = this.refs.scene.bases.length; i < ii; i++) {
    if (this.refs.scene.bases[i].refs.capital !== this.refs.capital && !this.refs.scene.bases[i].dead) {
      targets.push(this.refs.scene.bases[i])
    }
  }

  for (i = 0, ii = this.refs.scene.cities.length; i < ii; i++) {
    if (this.refs.scene.cities[i].refs.capital !== this.refs.capital && !this.refs.scene.cities[i].dead) {
      targets.push(this.refs.scene.cities[i])
    }
  }

  if (targets.length === 0) {
    return
  }

  while (this.attrs.stock.icbms > 0 && this.attrs.icbms_launched < this.attrs.icbm_launch_max && launched_this_tick < this.attrs.icbm_launch_per_tick) {
    target = pickOne(targets)
    this.refs.scene.icbms.push(new Actors.Icbm(
      this.env, {
        scene: this.refs.scene,
        base: this,
        capital: this.refs.capital,
        target: target
      }, {
        x: this.pos.x,
        y: this.pos.y,
        color: this.attrs.color
      }
    ))

    launched_this_tick++
    this.attrs.icbms_launched++
    this.attrs.stock.icbms--
  }
}

Actors.Base.prototype.launchAbms = function () {
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

Actors.Base.prototype.paint = function (view) {
  var val, mod
  var yf = 4
  var xf = 10
  var xo = 4 // offset for values
  var limit = 16
  var yh = 3
  var tip_color = '#000'
  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)

  view.ctx.strokeStyle = this.attrs.color
  view.ctx.lineWidth = 2

  view.ctx.beginPath()
  view.ctx.rect(-xf, -xf, xf * 2, xf * 2)
  view.ctx.fillStyle = '#000'
  view.ctx.fill()
  view.ctx.stroke()

  // show danger close
  // view.ctx.beginPath()
  // view.ctx.arc(0, 0, this.attrs.danger_close, 0, 2*Math.PI)
  // view.ctx.strokeStyle = '#222'
  // view.ctx.stroke()

  view.ctx.fillStyle = this.attrs.color
  view.ctx.font = '9px ubuntu mono, monospace'
  view.ctx.textBaseline = 'middle'

  view.ctx.textAlign = 'right'
  if (this.attrs.stock.bombers > 0) {
    // view.ctx.fillText(this.attrs.stock.bombers, -14, -7)
    val = this.attrs.stock.bombers
    mod = val % limit
    if (val > limit) {
      val = limit
    }

    view.ctx.fillStyle = this.attrs.color
    view.ctx.beginPath()
    view.ctx.rect(-val - xf - xo, -yf, val, yh)
    view.ctx.fillStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.5)'
    view.ctx.fill()

    view.ctx.fillStyle = tip_color
    view.ctx.beginPath()
    view.ctx.rect(-xf - mod - xo, -yf, yh, yh)
    view.ctx.fill()
  }

  if (this.attrs.stock.fighters > 0) {
    // view.ctx.fillText(this.attrs.stock.fighters, -20, 7)
    val = this.attrs.stock.fighters
    mod = val % limit
    if (val > limit) {
      val = limit
    }
    view.ctx.fillStyle = this.attrs.color
    view.ctx.beginPath()
    view.ctx.rect(-val - xf - xo, yf, val, yh)
    view.ctx.fillStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.5)'
    view.ctx.fill()

    view.ctx.fillStyle = tip_color
    view.ctx.beginPath()
    view.ctx.rect(-xf - mod - xo, yf, yh, yh)
    view.ctx.fill()
  }

  view.ctx.textAlign = 'left'
  if (this.attrs.stock.icbms > 0) {
    // view.ctx.fillText(this.attrs.stock.icbms, 20, -7)
    val = this.attrs.stock.icbms
    mod = val % limit
    if (val > limit) {
      val = limit
    }
    view.ctx.fillStyle = this.attrs.color
    view.ctx.beginPath()
    view.ctx.rect(xf + xo, -yf, val, yh)
    view.ctx.fillStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.5)'
    view.ctx.fill()

    view.ctx.fillStyle = tip_color
    view.ctx.beginPath()
    view.ctx.rect(xf + mod + xo, -yf, yh, yh)
    view.ctx.fill()
  }
  if (this.attrs.stock.abms > 0) {
    // view.ctx.fillText(this.attrs.stock.abms, 20, 7)
    val = this.attrs.stock.abms
    mod = val % limit
    if (val > limit) {
      val = limit
    }
    view.ctx.fillStyle = this.attrs.color
    view.ctx.beginPath()
    view.ctx.rect(xf + xo, yf, val, yh)
    view.ctx.fillStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.5)'
    view.ctx.fill()

    view.ctx.fillStyle = tip_color
    view.ctx.beginPath()
    view.ctx.rect(xf + mod + xo, yf, yh, yh)
    view.ctx.fill()
  }

  if (this.attrs.title) {
    view.ctx.fillStyle = this.attrs.color
    view.ctx.font = '10pt monospace'
    view.ctx.textBaseline = 'middle'
    view.ctx.textAlign = 'center'
    view.ctx.fillText(this.attrs.title, 0, 32)
  }

  view.ctx.restore()
}

Actors.Base.prototype.elevation = function (view) {
  var xf = 8

  view.ctx.save()
  view.ctx.translate(this.pos.x, ((this.refs.scene.opts.max_z - this.pos.z)))

  view.ctx.lineWidth = 2
  view.ctx.strokeStyle = this.attrs.color
  view.ctx.fillStyle = '#000'

  view.ctx.beginPath()
  view.ctx.rect(-xf / 2, -xf / 2, xf, xf)
  view.ctx.stroke()
  view.ctx.fill()

  view.ctx.restore()
}
