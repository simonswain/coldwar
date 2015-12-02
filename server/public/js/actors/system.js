/* global Actors, Actor, Vec3, random0to */

Actors.System = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.System.prototype = Object.create(Actor.prototype)

Actors.System.prototype.title = 'System'

Actors.System.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  )

  this.posNext = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  )

  var flip = function () {
    return Math.random() > 0.5 ? 1 : -1
  }

  this.velo = new Vec3(
    flip() * this.opts.velo_base + (this.opts.velo_flux * Math.random()),
    flip() * this.opts.velo_base + (this.opts.velo_flux * Math.random()),
    flip() * this.opts.velo_base + (this.opts.velo_flux * Math.random())
  )

  this.stars = []
  this.planets = []
  this.ships = []
  this.missiles = []
  this.lasers = []
  this.booms = []

  this.stars.push(new Actors.Star(
    this.env,
    {},
    {
      x: 0,
      y: 0,
      z: 0
    }
  ))

  this.attrs.orbit = flip()

  this.createPlanets()
}

Actors.System.prototype.defaults = [{
  key: 'radius',
  info: '',
  value: 250,
  min: 100,
  max: 1000
}, {
  key: 'velo_limit',
  info: '',
  value: 0.5,
  min: 0.1,
  max: 2
}, {
  key: 'velo_base',
  info: '',
  value: 0.01,
  min: 0,
  max: 1,
  step: 0.01
}, {
  key: 'velo_flux',
  info: '',
  value: 0.01,
  min: 0,
  max: 1,
  step: 0.01
}, {
  key: 'planets_min',
  info: '',
  value: 3,
  min: 1,
  max: 32
}, {
  key: 'planets_max',
  info: '',
  value: 5,
  min: 1,
  max: 32
}, {
  key: 'max_species_ships',
  info: '',
  value: 3,
  min: 1,
  max: 20
}, {
  key: 'defcon',
  info: 'Defcon',
  value: 5,
  min: 1,
  max: 5
}, {
  key: 'high_guard',
  info: 'How many friendlies to protect system',
  value: 5,
  min: 0,
  max: 20
}, {
  key: 'jump_slots',
  info: 'Have this many more ships than high guard before jumping',
  value: 10,
  min: 0,
  max: 20
}]

Actors.System.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    standalone: attrs.standalone,
    jump_slots: this.opts.jump_slots,
    // one species owns all planets
    species: null,
    // more than one species in orbit
    contested: false,
    speed: 0.1,
    radius: this.opts.radius,
    planet_count: this.opts.planets_min + random0to(this.opts.planets_max - this.opts.planets_min)
  }
}

Actors.System.prototype.createPlanets = function () {
  var min = (0.2 * this.opts.radius)
  var d = this.opts.radius * 0.8 / this.attrs.planet_count
  var q = min * 0.25

  for (var i = 0, ii = this.attrs.planet_count; i < ii; i++) {
    this.planets.push(new Actors.Planet(
      this.env, {
        scene: this.refs.scene,
        system: this
      }, {
        orbit: this.attrs.orbit,
        r: min + (i * d) - q + (Math.random() * 2 * q)
      }))
  }
}

Actors.System.prototype.addShip = function (ship) {
  this.ships.push(ship)
}

Actors.System.prototype.removeShip = function (ship) {
  for (var i = 0, ii = this.ships.length; i < ii; i++) {
    if (this.ships[i] === ship) {
      this.ships.splice(i, 1)
      break
    }
  }
}

Actors.System.prototype.x = function (f) {
  return this.opts.max_x * f
}

Actors.System.prototype.y = function (f) {
  return this.opts.max_y * f
}

Actors.System.prototype.z = function (f) {
  return this.opts.max_z * f
}

Actors.System.prototype.update = function (delta) {
  var i, ii

  for (i = 0, ii = this.planets.length; i < ii; i++) {
    this.planets[i].update(delta)
  }

  for (i = 0, ii = this.ships.length; i < ii; i++) {
    if (!this.ships[i]) {
      continue
    }
    this.ships[i].update(delta)
  }

  for (i = 0, ii = this.ships.length; i < ii; i++) {
    if (this.ships[i].attrs.dead) {
      this.ships.splice(i, 1)
      i--
      ii--
    }
  }

  this.ships.forEach(function (ship) {
    if (ship.attrs.jump_ready) {
      ship.do_jump()
    }
  }, this)

  this.attrs.jump_slots = this.opts.jump_slots

  for (i = 0, ii = this.booms.length; i < ii; i++) {
    this.booms[i].update(delta)
  }

  for (i = 0, ii = this.booms.length; i < ii; i++) {
    if (this.booms[i].attrs.dead) {
      this.booms.splice(i, 1)
      i--
      ii--
    }
  }

  // has one species dominated the system?

  var colors = {}
  var count = 0
  var species = null

  this.attrs.contested = false

  for (i = 0, ii = this.planets.length; i < ii; i++) {
    if (!this.planets[i].refs.species) {
      continue
    }

    if (!colors.hasOwnProperty(this.planets[i].refs.species.attrs.color)) {
      count++
      colors[this.planets[i].refs.species.attrs.color] = 1
      species = this.planets[i].refs.species
    } else {
      colors[this.planets[i].refs.species.attrs.color]++
    }
  }

  // only one species found in system
  if (count === 1 && colors[species.attrs.color] === this.planets.length) {
    this.attrs.species = species
  }

  if (count > 1) {
    this.attrs.species = null
    this.attrs.contested = true
  }

  if (count === 0) {
    this.attrs.species = null
    this.attrs.contested = false
  }

  if (this.attrs.standalone) {
    return
  }

  this.pos.copy(this.posNext)

  this.velo.add(this.separation())
  this.velo.add(this.reflect())

  this.velo.limit(this.opts.velo_limit)

  this.posNext = this.pos.plus(this.velo)
  this.posNext.z = this.refs.scene.opts.max_z / 2
}

Actors.System.prototype.separation = function () {
  var i, ii
  var separation = new Vec3()
  var dist
  var other
  var count = 0

  var max = this.refs.scene.opts.system_radius * 2

  for (i = 0, ii = this.refs.scene.systems.length; i < ii; i++) {
    other = this.refs.scene.systems[i]
    if (other === this) {
      continue
    }

    dist = this.pos.range(other.pos)

    if (dist === 0) {
      continue
    }

    if (dist > (max)) {
      continue
    }

    separation.add(this.pos.minus(other.pos).scale((max - dist) / max))
    count++
  }

  if (count === 0) {
    return new Vec3()
  }

  separation.limit(0.1)
  return separation
  // return separation.div(count)
}

Actors.System.prototype.reflect = function () {
  var reflect = new Vec3()

  var max = this.refs.scene.opts.system_radius

  if (this.pos.x < max) {
    reflect.x = (max - this.pos.x) / max
  }

  if (this.pos.y < max) {
    reflect.y = (max - this.pos.y) / max
  }

  if (this.refs.scene.opts.max_x - this.pos.x < max) {
    reflect.x = -1 * ((max - (this.refs.scene.opts.max_x - this.pos.x)) / max)
  }

  if (this.refs.scene.opts.max_y - this.pos.y < max) {
    reflect.y = -1 * ((max - (this.refs.scene.opts.max_y - this.pos.y)) / max)
  }

  return reflect
}

Actors.System.prototype.paint = function (view) {
  var i, ii

  view.ctx.save()

  view.ctx.lineWidth = 1
  view.ctx.strokeStyle = '#999'
  if (this.attrs.species) {
    view.ctx.strokeStyle = this.attrs.species.attrs.color
  }
  view.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  view.ctx.beginPath()
  view.ctx.arc(0, 0, this.opts.radius, 0, 2 * Math.PI)
  view.ctx.fill()
  view.ctx.stroke()

  view.ctx.lineWidth = 1
  view.ctx.strokeStyle = '#fff'
  view.ctx.beginPath()
  view.ctx.stroke()

  for (i = 0, ii = this.stars.length; i < ii; i++) {
    view.ctx.save()
    view.ctx.translate(this.stars[i].pos.x - this.opts.max_x / 2, this.stars[i].pos.y - this.opts.max_y / 2)
    this.stars[i].paint(view)
    view.ctx.restore()
  }

  for (i = 0, ii = this.planets.length; i < ii; i++) {
    view.ctx.lineWidth = 1
    view.ctx.strokeStyle = '#111'
    view.ctx.beginPath()
    view.ctx.arc(0, 0, this.planets[i].attrs.r, 0, 2 * Math.PI)
    view.ctx.stroke()
  }

  for (i = 0, ii = this.planets.length; i < ii; i++) {
    this.planets[i].paint(view)
  }

  for (i = 0, ii = this.ships.length; i < ii; i++) {
    this.ships[i].paint(view)
  }

  for (i = 0, ii = this.booms.length; i < ii; i++) {
    this.booms[i].paint(view)
  }

  // view.ctx.fillStyle = '#fff'
  // view.ctx.font = 'bold 36pt ubuntu mono, monospace'
  // view.ctx.textAlign = 'center'
  // view.ctx.textBaseline = 'middle'
  // view.ctx.fillText((this.attrs.jump_slots), 0, this.opts.radius/2)

  view.ctx.restore()
}
