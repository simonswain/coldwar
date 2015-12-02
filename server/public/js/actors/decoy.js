/* global Actors, Actor, Vec3, pickOne */

// dummy target for attract mode
Actors.Decoy = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Decoy.prototype = Object.create(Actor.prototype)

Actors.Decoy.prototype.title = 'Decoy'

Actors.Decoy.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,

    color: attrs.color || '#f0f',
    title: attrs.title || '',
    dead: false,

    hidden: attrs.hidden,

    bombers_launched: 0,
    fighters_launched: 0,
    icbms_launched: 0,
    abms_launched: 0,

    bombers: attrs.bombers,
    fighters: attrs.fighters,
    icbms: attrs.icbms,
    abms: attrs.abms,

    danger_close: this.refs.scene.opts.max * this.opts.danger_close,

    abm_launch_max: this.opts.abm_launch_max || 0,
    abm_launch_per_tick: this.opts.abm_launch_per_tick || 1
  }
}

Actors.Decoy.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  )
}

Actors.Decoy.prototype.defaults = [{
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

Actors.Decoy.prototype.update = function (delta) {
  this.launch()
  this.launchAbms()
}

Actors.Decoy.prototype.launch = function () {
  var targets, target

  var i, ii

  targets = []

  for (i = 0, ii = this.refs.scene.decoys.length; i < ii; i++) {
    if (this.refs.scene.decoys[i].refs.capital !== this.refs.capital) {
      targets.push(this.refs.scene.decoys[i])
    }
  }

  if (targets.length > 0 && this.attrs.bombers_launched < this.attrs.bombers) {
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
      }))

    this.attrs.bombers_launched++
  }

  if (targets.length > 0 && this.attrs.icbms_launched < this.attrs.icbms) {
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
      }))

    this.attrs.icbms_launched++
  }

  if (this.attrs.fighters_launched < this.attrs.fighters) {
    target = pickOne(targets)

    this.refs.scene.fighters.push(new Actors.Fighter(
      this.env, {
        scene: this.refs.scene,
        base: this,
        capital: this.refs.capital,
        target: target
      }, {
        x: this.pos.x,
        y: this.pos.y,
        color: this.attrs.color
      }))

    this.attrs.fighters_launched++
  }
}

Actors.Decoy.prototype.launchAbms = function () {
  var launched_this_tick = 0
  var targets, target

  if (this.attrs.abms <= 0 || this.attrs.abms_launched >= this.attrs.abm_launch_max) {
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

  while (this.attrs.abms > 0 && this.attrs.abms_launched < this.attrs.abm_launch_max && launched_this_tick < this.attrs.abm_launch_per_tick) {
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
      }
    ))

    launched_this_tick++
    this.attrs.abms_launched++
    this.attrs.abms--
  }
}

Actors.Decoy.prototype.paint = function (view) {
  if (this.attrs.hidden) {
    return
  }

  var xf = 12

  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)

  view.ctx.strokeStyle = this.attrs.color
  view.ctx.lineWidth = xf / 6

  view.ctx.beginPath()
  view.ctx.moveTo(xf, -xf)
  view.ctx.lineTo(-xf, xf)
  view.ctx.stroke()

  view.ctx.beginPath()
  view.ctx.moveTo(xf, xf)
  view.ctx.lineTo(-xf, -xf)
  view.ctx.stroke()

  view.ctx.restore()
}

Actors.Decoy.prototype.elevation = function (view) {
  if (this.attrs.hidden) {
    return
  }

  var xf = 6

  view.ctx.save()
  view.ctx.translate(this.pos.x, ((this.refs.scene.opts.max_z - this.pos.z)))

  view.ctx.strokeStyle = this.attrs.color
  view.ctx.lineWidth = xf / 3

  view.ctx.beginPath()
  view.ctx.moveTo(xf, -xf)
  view.ctx.lineTo(-xf, xf)
  view.ctx.stroke()

  view.ctx.beginPath()
  view.ctx.moveTo(xf, xf)
  view.ctx.lineTo(-xf, -xf)
  view.ctx.stroke()

  view.ctx.restore()
}
