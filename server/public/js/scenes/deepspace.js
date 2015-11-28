/* global Scenes, Scene, Actors, random0to */

Scenes.deepspace = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.deepspace.prototype = Object.create(Scene.prototype)

Scenes.deepspace.prototype.title = 'Deep Space'

Scenes.deepspace.prototype.init = function () {
  var i, ii

  this.systems = []
  this.species = []
  this.ships = []

  for (i = 0, ii = this.opts.system_count; i < ii; i++) {
    this.systems.push(new Actors.System(
      this.env,
      {
        scene: this,
        systems: this.systems
      },
      {
        x: this.opts.max_x * Math.random(),
        y: this.opts.max_y * Math.random(),
        z: this.opts.max_z * Math.random()
      }
    ))
  }

  for (i = 0, ii = this.opts.species_count; i < ii; i++) {
    this.species.push(this.makeSpecies({
      color: this.colors[i] || '#fff'
    }))
  }
}

Scenes.deepspace.prototype.colors = ['#0ff', '#f0f', '#ff0', '#0f0', '#f05', '#66f', '#f93']

Scenes.deepspace.prototype.getCast = function () {
  return {
    Species: Actors.Species,
    System: Actors.System,
    Star: Actors.Star,
    Planet: Actors.Planet,
    Ship: Actors.Ship,
    Boom: Actors.Boom
  }
}

Scenes.deepspace.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 1024,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 1024,
  min: 100,
  max: 1000
}, {
  key: 'max_z',
  info: 'Max Z',
  value: 100,
  min: 50,
  max: 500
}, {
  key: 'system_count',
  info: '',
  value: 5,
  min: 1,
  max: 50
}, {
  key: 'system_radius',
  info: '',
  value: 160,
  min: 10,
  max: 500
}, {
  key: 'species_count',
  info: '',
  value: 6,
  min: 0,
  max: 8
}, {
  key: 'gameover_restart_delay',
  info: 'Game Over restart delay',
  value: 5,
  min: 0,
  max: 30
}]

Scenes.deepspace.prototype.genAttrs = function () {
  return {
    max: Math.min(this.opts.max_x, this.opts.max_y)
  }
}

Scenes.deepspace.prototype.makeSpecies = function (attrs) {
  var species = new Actors.Species(
    this.env,
    {
      scene: this
    },
    attrs
  )

  var system
  var planet
  var ok = false
  while (!ok) {
    system = this.systems[random0to(this.systems.length)]
    planet = system.planets[random0to(system.planets.length)]
    if (!planet.species) {
      species.addPlanet(planet)
      ok = true
    }
  }
  return species
}

Scenes.deepspace.prototype.addShip = function (ship) {
  this.ships.push(ship)
}

Scenes.deepspace.prototype.removeShip = function (ship) {
  for (var i = 0, ii = this.ships.length; i < ii; i++) {
    if (this.ships[i] === ship) {
      this.ships.splice(i, 1)
      break
    }
  }
}

Scenes.deepspace.prototype.update = function (delta) {
  var i, ii
  for (i = 0, ii = this.systems.length; i < ii; i++) {
    this.systems[i].update(delta)
  }

  for (i = 0, ii = this.ships.length; i < ii; i++) {
    if (this.ships[i]) {
      this.ships[i].update(delta)
    }
  }

  // determine gameover

  if (this.env.gameover) {
    return
  }

  var colors = {}
  var count = 0
  var species = null

  for (i = 0, ii = this.systems.length; i < ii; i++) {
    if (!this.systems[i].attrs.species) {
      break
    }

    if (!colors.hasOwnProperty(this.systems[i].attrs.species.attrs.color)) {
      count++
      colors[this.systems[i].attrs.species.attrs.color] = 1
      species = this.systems[i].attrs.species
    } else {
      colors[this.systems[i].attrs.species.attrs.color]++
    }
  }

  // only one species found in system
  if (count === 1 && colors[species.attrs.color] === this.systems.length) {
    this.env.gameover = true
    setTimeout(this.env.restart, this.opts.gameover_restart_delay * 1000)
    this.attrs.species = species
  }
}

Scenes.deepspace.prototype.paint = function (fx, gx, sx) {
  this.paintMap(gx)

  if (this.env.gameover && Date.now() / 1000 % 1 > 0.5) {
    gx.ctx.fillStyle = this.attrs.species.attrs.color
    gx.ctx.font = '48pt ubuntu mono, monospace'
    gx.ctx.textBaseline = 'middle'
    gx.ctx.textAlign = 'center'
    gx.ctx.fillText('VICTORY', this.opts.max_x * 0.5, this.opts.max_y * 0.5)
  }
}

Scenes.deepspace.prototype.paintMap = function (view) {
  var i, ii
  var scale

  for (i = 0, ii = this.ships.length; i < ii; i++) {
    view.ctx.save()
    view.ctx.translate(this.ships[i].syspos.x, this.ships[i].syspos.y)

    view.ctx.lineWidth = 1
    view.ctx.fillStyle = this.ships[i].refs.species.attrs.color

    view.ctx.beginPath()
    view.ctx.arc(0, 0, 2, 0, 2 * Math.PI)
    view.ctx.fill()

    view.ctx.restore()
  }

  for (i = 0, ii = this.systems.length; i < ii; i++) {
    view.ctx.save()
    view.ctx.translate(this.systems[i].pos.x, this.systems[i].pos.y)
    scale = (this.opts.system_radius) / this.systems[i].attrs.radius
    view.ctx.scale(scale, scale)
    this.systems[i].paint(view)
    view.ctx.restore()
  }
}

Scenes.deepspace.prototype.help = [
  'Once species have colonized their home system, they hyperspace to distant stars in an attmpt to dominate the universe.'
]
