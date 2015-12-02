/* global Actors, Actor, Vec3, hex2rgb, random0to, random1to, pickOne */

Actors.Ship = function (env, refs, attrs) {
  this.env = env
  this.refs = refs // species, planet, system
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Ship.prototype = Object.create(Actor.prototype)

Actors.Ship.prototype.title = 'Ship'

Actors.Ship.prototype.init = function (attrs) {
  this.pos = new Vec3(attrs.x, attrs.y, attrs.x)
  this.velo = new Vec3(0, 0, 0)

  this.syspos = null
}

Actors.Ship.prototype.defaults = [{
  key: 'max_pop',
  info: '',
  value: 3000,
  min: 0,
  max: 10000
}, {
  key: 'speed_limit',
  value: 10,
  min: 0.1,
  max: 50,
  step: 0.1
}, {
  key: 'speed_flux',
  value: 5,
  min: 0.1,
  max: 50,
  step: 0.1
}, {
  key: 'jump_point_impulse',
  value: 1,
  min: 0.1,
  max: 2,
  step: 0.1
}, {
  key: 'star_gravity',
  value: 20,
  min: 0,
  max: 200
}, {
  key: 'planet_gravity',
  value: 20,
  min: 0,
  max: 200
}, {
  key: 'avoid_enemy',
  info: '',
  value: 3,
  min: 0,
  max: 9
}, {
  key: 'thrust_base',
  info: '',
  value: 10,
  min: 1,
  max: 500
}, {
  key: 'thrust_flux',
  info: '',
  value: 5,
  min: 1,
  max: 100
}, {
  key: 'laser_probability',
  info: '',
  value: 0.75,
  min: 0,
  max: 1
}, {
  key: 'laser_range_base',
  info: '',
  value: 50,
  min: 1,
  max: 500
}, {
  key: 'laser_range_flux',
  info: '',
  value: 10,
  min: 1,
  max: 100
}, {
  key: 'laser_power_base',
  info: '',
  value: 85,
  min: 1,
  max: 500
}, {
  key: 'laser_power_flux',
  info: '',
  value: 10,
  min: 1,
  max: 100
}, {
  key: 'jump_range',
  info: '',
  value: 200,
  min: 100,
  max: 1000
}]

Actors.Ship.prototype.genAttrs = function (attrs) {
  var energy = 200 + random0to(200)

  return {
    state: attrs.state || null,

    // initial intent is to load population
    intent: 'load',
    dead: false,
    vx: 0, // system x velocity
    vy: 0, // system y velocity
    a: 0, // angle ship is facing when in system
    v: 0, // velocity
    pr: null, // orbital position radius when at planet
    pa: null, // orbital position angle when at planet

    speed_limit: this.opts.speed_limit + (Math.random() * this.opts.speed_flux),

    space_x: null, // position when in jumpspace
    space_y: null, // position when in jumpspace

    pop: 0, //  how many population the ship is carrying
    max_pop: this.opts.max_pop,

    // vector away from planet cw or ccw
    rot: ((Math.random() > 0.5) ? 1 : -1),

    // attributes
    jump_ready: false,
    jump_target: null,
    // jump_speed: 1,
    // jump_range: this.opts.jump_range, // warp drive range

    jump_pct: null, // % of jump complete
    hit: false, // ship is hit? (for animation)
    missiles: 0,
    // energy_max: 200,
    // energy: 200,
    damage: 0,
    shield: 0,

    jump_speed: random1to(5),
    jump_range: random1to(5),

    laser_range: this.opts.laser_range_base + (this.opts.laser_range_flux * Math.random()),
    laser_probability: this.opts.laser_probability,
    laser: false, // laser firing?
    laser_x: null,
    laser_y: null,

    // laser_power: this.opts.laser_power_base + (this.opts.laser_power_flux * Math.random()),
    // laser_accuracy: 0.1, // lower is better. error f of laser range
    laser_accuracy: random1to(10),
    laser_power: random0to(20) + 5,
    power: random0to(5),

    // thrust: this.opts.thrust_base + (this.opts.thrust_flux * Math.random()), // grav drive power
    thrust: 10 + random1to(10) / 10,
    recharge: 1 + (random1to(10)) / 10,
    energy_max: energy,
    energy: energy,

    target_planet: null
  }
}

Actors.Ship.prototype.update = function (delta) {
  if (this.attrs.dead) {
    return
  }

  // if syspos is set then ship is jumping. else it's in-system and
  // flying towards a jump point
  if (this.attrs.jump_target && this.syspos) {
    this.runSpace()
    return
  }

  // ship is destroyed!
  if (this.attrs.damage > this.attrs.energy_max) {
    this.attrs.dead = true
    if (this.refs.system) {
      this.refs.system.booms.push(new Actors.Boom(
        this.env, {
          scene: this.refs.scene
        }, {
          x: this.pos.x,
          y: this.pos.y,
          z: this.pos.z,
          color: hex2rgb(this.refs.species.attrs.color),
          radius: 20
        }
      ))
    }

    if (this.refs.planet) {
      this.refs.system.booms.push(new Actors.Boom(
        this.env, {
          scene: this.refs.scene
        }, {
          x: this.refs.planet.pos.x,
          y: this.refs.planet.pos.y,
          z: this.refs.planet.pos.z,
          // radius: this.refs.planet.attrs.radius,
          // color: hex2rgb(this.refs.species.attrs.color),
          radius: 10
        }
      ))
    }
    return
  }

  this.recharge()

  if (this.refs.planet) {
    this.runPlanet()
    return
  }

  if (this.refs.system) {
    this.runSystem()
    return
  }
}

Actors.Ship.prototype.recharge = function () {
  // basics
  this.attrs.energy = this.attrs.energy + (this.attrs.recharge * (1 - (1 / this.attrs.energy_max) * this.attrs.damage))
  if (this.attrs.energy > this.attrs.energy_max) {
    this.attrs.energy = this.attrs.energy_max
  }
  this.attrs.damage = this.attrs.damage - this.attrs.recharge

  if (this.attrs.damage < 0) {
    this.attrs.damage = 0
  }
}

Actors.Ship.prototype.runPlanet = function () {
  // things to do when the ship is locked in orbit at a planet

  if (!this.refs.planet) {
    return
  }

  if (this.refs.planet.attrs.fake_species) {
    return
  }

  // if there are any enemy ships in-system, leave the planet and
  // go fight them

  var system_enemies = 0
  var system_friends = 0

  for (var i = 0, ii = this.refs.system.ships.length; i < ii; i++) {
    if (!this.refs.system.ships[i]) {
      return
    }
    if (this.refs.species !== this.refs.system.ships[i].refs.species) {
      system_enemies++
    }
    if (this.refs.species === this.refs.system.ships[i].refs.species) {
      system_friends++
    }
  }

  if (system_enemies - system_friends > 0) {
    this.leavePlanet()
    return
  }

  // if enough low guard, leave planet and jump out system

  // should load pop too

  var planet_enemies = 0
  var planet_friends = 0

  for (var j = 0, jj = this.refs.planet.refs.ships.length; j < jj; j++) {
    if (!this.refs.planet.refs.ships[j]) {
      return
    }
    if (this.refs.species !== this.refs.planet.refs.ships[j].refs.species) {
      system_enemies++
    }
    if (this.refs.species === this.refs.planet.refs.ships[j].refs.species) {
      system_friends++
    }
  }

  if (planet_friends - planet_enemies > this.refs.planet.opts.low_guard) {
    this.leavePlanet()
    return
  }

  // fight enemy ships here...

  this.orbital_combat()
  this.colonize()

  if (this.refs.planet.refs.species !== this.refs.species) {
    // warfare against enemy pop and ships
  }

  if (this.refs.planet.refs.species === this.refs.species) {
    if (this.attrs.intent === 'load') {
      // load up some population
      var capacity = this.attrs.max_pop - this.attrs.pop
      if (capacity > 0) {
        var getpop = this.refs.planet.takePop(capacity)
        this.attrs.pop = this.attrs.pop + getpop
      }

      // for demo mode
      if (this.refs.system && this.refs.system.opts.easy_spawn) {
        this.leavePlanet()
        return
      }

      if (this.attrs.pop >= this.attrs.max_pop) {
        // ready to leave
        this.leavePlanet()
        return
      }
      return
    }
  }
}

Actors.Ship.prototype.colonize = function () {
  // own species, do nothing
  if (this.refs.planet.refs.species === this.refs.species) {
    return
  }

  // shoot at target planet to remove population

  if (this.refs.planet.attrs.pop > 0 &&
    this.attrs.energy > this.attrs.energy_max * 0.2 &&
    this.refs.planet.refs.species !== this.refs.species
  ) {
    // laser uses energy
    this.attrs.energy--
    this.refs.planet.killPop(this.attrs.laser_power)

    // do some fx
    // flickering
    if (this.refs.planet && Math.random() < 0.1) {
      this.refs.system.booms.push(new Actors.Boom(
        this.env, {
          scene: this.refs.scene
        }, {
          x: this.refs.planet.pos.x,
          y: this.refs.planet.pos.y,
          z: this.refs.planet.pos.z,
          radius: this.refs.planet.attrs.radius * 3,
          color: '255,255,255',
          // color: this.refs.species.attrs.color,
          ttl: 16
        }
      ))
    }

    // puff of smoke
    if (this.refs.system && Math.random() < 0.1) {
      this.refs.system.booms.push(new Actors.Boom(
        this.env, {
          scene: this.refs.scene
        }, {
          x: this.refs.planet.pos.x,
          y: this.refs.planet.pos.y,
          z: this.refs.planet.pos.z,
          radius: this.refs.planet.attrs.radius * 0.5,
          color: '255,255,255',
          // color: hex2rgb(this.refs.species.attrs.color),
          ttl: 50
        }
      ))
    }
  }

  // take over planet, consume all attacking ships and put their
  // pop on the planet

  if (this.refs.planet.attrs.pop <= 0) {
    this.refs.planet.refs.ships.forEach(function (ship) {
      if (ship.refs.species === this.refs.species) {
        this.refs.planet.attrs.pop += ship.attrs.pop
      }
    }, this)

    // colonize dead planet
    if (this.refs.planet.refs.species) {
      this.refs.planet.refs.species.removePlanet(this.refs.planet)
    }

    this.refs.species.addPlanet(this.refs.planet)

    if (this.refs.system) {
      this.refs.system.booms.push(new Actors.Boom(
        this.env, {
          scene: this.refs.scene
        }, {
          x: this.refs.planet.pos.x,
          y: this.refs.planet.pos.y,
          z: this.refs.planet.pos.z,
          style: 'zoom-lite',
          radius: this.refs.planet.attrs.radius * 3,
          color: this.refs.species.attrs.color,
          ttl: 20
        }
      ))
    }
  }
}

Actors.Ship.prototype.runSystem = function () {
  if (!this.refs.system) {
    return
  }

  // flying and fighting

  this.systemPhysics()

  // ship might have jumped after physics
  if (!this.refs.system) {
    return
  }

  // determine behaviour

  var enemies = []
  var friends = []
  var targets = []
  var enemy_ships = 0
  var friend_ships = 0
  // var fighting_friends = 0

  // if available planets, then colonize them

  if (this.attrs.intent === 'colonize') {
    return
  }

  if (!this.attrs.target_planet) {
    // ship will thrust towards target planet, attempt to colonize
    targets = []
    for (var i = 0, ii = this.refs.system.planets.length; i < ii; i++) {
      if (this.refs.system.planets[i].refs.species !== this.refs.species) {
        // if(!this.refs.system.planets[i].refs.species){
        targets.push(this.refs.system.planets[i])
      }
    }

    if (targets.length > 0) {
      this.attrs.target_planet = pickOne(targets)
      this.attrs.intent = 'colonize'
      return
    }
  }

  // if not busy colonizing, then fight your enemy or jump out-system
  // and colonize there too

  for (var j = 0, jj = this.refs.system.ships.length; j < jj; j++) {
    if (this.refs.system.ships[j] === this) {
      continue
    }
    if (this.refs.system.ships[j].refs.species !== this.refs.species) {
      enemies.push(this.refs.system.ships[j])
      enemy_ships++
    } else {
      friends.push(this.refs.system.ships[j])
      friend_ships++
    }
  }

  // if(friend_ships - enemy_ships > this.refs.system.opts.high_guard + this.refs.system.opts.jump_slots){
  if (friend_ships - enemy_ships > this.refs.system.opts.high_guard) {
    // console.log('advantage', friend_ships, enemy_ships, this.refs.system.opts.high_guard, this.refs.system.attrs.jump_slots)
    this.jump_prep()
  }
}

Actors.Ship.prototype.jump_prep = function () {
  if (!this.refs.scene.systems) {
    return
  }

  // select a target, and set jump intent to naviagte to the
  // outersystem

  // already jumping
  if (this.attrs.jump_target) {
    return
  }

  // only if there are other stars present
  if (this.refs.scene.systems.length < 2) {
    return
  }

  if (this.refs.system.attrs.jump_slots <= 0) {
    return
  }

  var target
  var enemies = []
  var friends = []
  var neutral = []
  // var contested = []

  // var planet_enemies = 0
  // var planet_friends = 0

  for (var i = 0, ii = this.refs.scene.systems.length; i < ii; i++) {
    var other = this.refs.scene.systems[i]

    if (other === this.refs.system) {
      continue
    }

    if (other.attrs.species === this.refs.species) {
      friends.push(other)
      continue
    }

    if (other.attrs.species !== this.refs.species) {
      enemies.push(other)
      continue
    }

    neutral.push(other)
  }

  if (neutral.length + enemies.length + friends.length === 0) {
    return
  }

  if (neutral.length > 0) {
    target = pickOne(neutral)
  } else if (enemies.length > 0) {
    target = pickOne(enemies)
  // } else if(friends.length > 0){
  //   target = pickOne(friends)
  }

  this.attrs.jump_target = target
  this.refs.system.attrs.jump_slots--

  this.refs.target_planet = null
  this.attrs.syspos = false // will be set when actually jumping
}

Actors.Ship.prototype.runSpace = function () {
  var chase = this.attrs.jump_target.pos.minus(this.syspos).normalize().scale(1)
  this.syspos.add(chase)

  var range = this.attrs.jump_target.pos.range(this.syspos)

  // unjump
  if (range < this.refs.scene.opts.system_radius) {
    if (!this.attrs.jump_target.pos) {
    }
    this.pos = this.syspos.minus(this.attrs.jump_target.pos).normalize().scale(this.attrs.jump_target.attrs.radius)
    this.refs.system = this.attrs.jump_target

    this.attrs.jump_target = null
    this.attrs.jump_origin = null
    this.attrs.jump_point = null
    this.syspos = null
    this.attrs.laser = false
    this.velo = new Vec3()

    this.refs.scene.removeShip(this)
    this.refs.system.addShip(this)
    return
  }
}

Actors.Ship.prototype.damage = function (hits) {
  this.attrs.hit = true
  this.attrs.energy = Math.max(0, this.attrs.energy - hits)
  this.attrs.damage += hits
}

Actors.Ship.prototype.boom = function (type, x, y) {
  if (this.attrs.dead) {
    return
  }

  if (!type) {
    type = true
  }

  if (!x) {
    x = this.get('x')
  }

  if (!y) {
    y = this.get('y')
  }

  this.set({
    x: x,
    y: y,
    boom: type,
    color: this.species.get('color')
  })
  this.species.ships.remove(this)
}

Actors.Ship.prototype.enterSystem = function (system) {
  this.refs.scene.removeShip(this)
  this.refs.system.addShip(this)
  this.refs.system = system
  this.attrs.state = 'system'
}

Actors.Ship.prototype.leaveSystem = function (system) {
  // this.system.removeShip(this)
  // this.system = null
  // this.system.universe.addShip(this)
  // this.set({state: 'space'})
}

Actors.Ship.prototype.enterPlanet = function (planet) {
  this.refs.planet = planet
  this.refs.state = 'planet'
  this.refs.system.removeShip(this)
  this.refs.planet.addShip(this)
}

Actors.Ship.prototype.leavePlanet = function () {
  if (!this.refs.planet) {
    return
  }
  if (this.refs.planet.attrs.fake_species) {
    this.refs.planet.refs.ships.remove(this)
    this.refs.planet = null
    return
  }

  this.pos.x = this.refs.planet.pos.x
  this.pos.y = this.refs.planet.pos.y
  this.pos.z = this.refs.planet.pos.z
  this.attrs.intent = null
  this.attrs.state = 'system'

  this.refs.planet.removeShip(this)
  this.refs.planet = null
  this.refs.system.addShip(this)
}

Actors.Ship.prototype.spacePhysics = function () {
  // universe manages this
}

Actors.Ship.prototype.systemPhysics = function (opts) {
  if (this.attrs.dead) {
    return
  }

  if (!this.refs.system) {
    return
  }

  var vec = new Vec3()
  vec.add(this.star_gravity())
  vec.add(this.planet_gravity())
  // vec.add(this.force_center())

  vec.add(this.flee_enemy())
  vec.add(this.chase_enemy())
  vec.add(this.fly_to_jump_point())
  vec.add(this.fly_to_target_planet())

  this.velo.add(vec)
  this.velo.scale(0.98)
  this.velo.limit(this.attrs.speed_limit)
  this.pos.add(this.velo)

  // angle ship is facing by velocity
  this.attrs.a = this.velo.angleXY()
}

Actors.Ship.prototype.star_gravity = function () {
  var vec = new Vec3()
  this.refs.system.stars.forEach(function (star) {
    var r = this.pos.range(star.pos)
    var g = star.pos.minus(this.pos).normalize().scale(this.opts.star_gravity).scale(1 / r)
    vec.add(g)

    // thrust vector across star's pull
    var t = new Vec3().copy(g)
    t.scale(0.5).rotateZ(Math.PI / 2)
    vec.add(t)
  }, this)
  return vec
}

Actors.Ship.prototype.planet_gravity = function () {
  var vec = new Vec3()
  this.refs.system.planets.forEach(function (planet) {
    var r = this.pos.range(planet.pos)
    var g = planet.pos.minus(this.pos).normalize().scale(this.opts.planet_gravity).scale(1 / r)
    vec.add(g)

    // thrust vector across planet's pull
    if (this.attrs.target_planet !== planet) {
      var t = new Vec3().copy(g)
      t.scale(0.5).rotateZ(Math.PI / 2)
      vec.add(t)
    }
  }, this)
  return vec
}

Actors.Ship.prototype.force_center = function () {
  // distance from center of system. turn back towards center
  // proportional to distance. at system radius, should be facing
  // system center

  var angle = this.pos.angleXY(new Vec3(0, 0, 0))
  var range = this.pos.rangeXY(new Vec3(0, 0, 0))

  // create force proportional to distance from cenetr
  var f = (range / this.refs.system.attrs.radius) * 0.25

  // max force
  // convert force to xy vector and apply
  this.attrs.vx -= (f * Math.cos(angle))
  this.attrs.vy -= (f * Math.sin(angle))
}

Actors.Ship.prototype.flee_enemy = function () {
  // desired vector
  var run = new Vec3()
  var radius = this.refs.system.attrs.radius * 0.2
  var count = 0
  this.refs.system.ships.forEach(function (other) {
    if (other === this) {
      return
    }

    if (other.attrs.state !== 'system') {
      return
    }

    if (this.refs.species !== other.refs.species) {
      return
    }

    var range = this.pos.rangeXY(other.pos)

    if (range < radius && other.attrs.energy >= this.attrs.energy) {
      run.add(this.pos.minus(other.pos).normalize())
      count++
    }
  }, this)
  run.normalize().scale(0.1)
  return run
}

Actors.Ship.prototype.chase_enemy = function () {
  var chase = new Vec3()
  // var radius = this.refs.system.attrs.radius * 0.2
  var enemy
  var closest = Infinity
  // var count

  this.refs.system.ships.forEach(function (other) {
    if (other === this) {
      return
    }

    if (other.attrs.state !== 'system') {
      return
    }

    if (this.refs.species === other.refs.species) {
      return
    }

    var range = this.pos.rangeXY(other.pos)

    // find closest weaker enemy
    if (range < closest) {
      enemy = other
      closest = range
    }
  }, this)

  // chase weaker nearby enemy
  if (enemy && enemy.attrs.energy < this.attrs.energy) {
    chase = enemy.pos.minus(this.pos).normalize().scale(0.1)
  }

  // if enemy nearby, then shoot it
  if (enemy && closest < this.attrs.laser_range && Math.random() < this.opts.laser_probability) {
    if (!this.attrs.laser && this.attrs.energy > this.attrs.energy_max * 0.1) {
      // laser uses energy
      this.attrs.energy = this.attrs.energy - 1
      this.attrs.laser = true
      this.attrs.laser = new Vec3(
        enemy.pos.x,
        enemy.pos.y,
        enemy.pos.z
      )
      var error = enemy.pos.rangeXY(this.attrs.laser)
      if (error < 10) {
        enemy.damage(this.attrs.laser_power)
      }
    }
  }

  return chase
}

Actors.Ship.prototype.fly_to_target_planet = function () {
  if (this.refs.planet) {
    return new Vec3()
  }

  if (!this.refs.system) {
    return new Vec3()
  }

  if (!this.attrs.target_planet) {
    return new Vec3()
  }

  // already colonized?
  if (this.attrs.target_planet.refs.species === this.refs.species) {
    this.attrs.target_planet = false
    this.attrs.intent = null
    return new Vec3()
  }

  var range = this.pos.rangeXY(this.attrs.target_planet.pos)

  // in orbit range
  if (range < (this.refs.system.opts.radius * 0.02)) {
    this.enterPlanet(this.attrs.target_planet)
    return new Vec3()
  }

  return this.attrs.target_planet.pos.minus(this.pos).normalize().scale(0.2)
}

// fly to edge of system in direction of jump target. if close to
// edge, then jump

Actors.Ship.prototype.fly_to_jump_point = function () {
  if (!this.attrs.jump_target) {
    return new Vec3()
  }

  this.attrs.jump_point = this.attrs.jump_target.pos.minus(this.refs.system.pos).normalize().scale(this.refs.system.opts.radius)

  var range = this.attrs.jump_point.rangeXY(this.pos)
  var vec = this.attrs.jump_point.minus(this.pos).normalize()

  this.attrs.jump_range = range

  // near enough to jump point?
  if (range < this.refs.system.opts.radius * 0.2) {
    this.attrs.jump_ready = true
  }

  return vec.scale(this.opts.jump_point_impulse)
}

Actors.Ship.prototype.do_jump = function () {
  // do jump
  // position in deep space
  this.attrs.jump_origin = this.refs.system
  // deep space position is edge of system in direction of target
  this.syspos = this.refs.system.pos.plus(this.attrs.jump_target.pos.minus(this.refs.system.pos).normalize().scale(this.refs.scene.opts.system_radius))
  this.attrs.velo = new Vec3()
  this.refs.system.removeShip(this)
  this.attrs.jump_point = null
  this.refs.system = null
  this.attrs.intent = null
  this.attrs.jump_ready = false
  this.refs.scene.addShip(this)
}

Actors.Ship.prototype.orbital_combat = function () {
  var enemy

  for (var i = 0, ii = this.refs.planet.refs.ships.length; i < ii; i++) {
    if (!this.refs.planet.refs.ships[i]) {
      return
    }
    if (this.refs.species !== this.refs.planet.refs.ships[i].refs.species) {
      enemy = this.refs.planet.refs.ships[i]
      break
    }
  }

  if (!enemy) {
    return
  }

  if (
    this.attrs.energy > this.attrs.energy_max * 0.1
  // && Math.random() < this.attrs.laser_probability
  ) {
    // laser uses energy
    this.attrs.energy = this.attrs.energy - 1
    this.attrs.laser = true
    enemy.damage(this.attrs.laser_power)

    if (this.refs.planet) {
      this.refs.system.booms.push(new Actors.Boom(
        this.env, {
          scene: this.refs.scene
        }, {
          x: this.refs.planet.pos.x,
          y: this.refs.planet.pos.y,
          z: this.refs.planet.pos.z,
          style: 'laser',
          radius: this.refs.planet.attrs.radius,
          color: '255,255,255',
          // color: this.refs.species.attrs.color,
          ttl: 20
        }
      ))
    }
  }
}

Actors.Ship.prototype.planetPhysics = function () {
  // orbit, space evenly with other ships in orbit
}

Actors.Ship.prototype.paint = function (view) {
  if (this.attrs.laser) {
    view.ctx.beginPath()
    view.ctx.lineWidth = 1
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.refs.species.attrs.color) + ',0.5)'
    view.ctx.moveTo(this.pos.x, this.pos.y)
    view.ctx.lineTo(this.attrs.laser.x, this.attrs.laser.y)
    view.ctx.stroke()
  }

  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)

  view.ctx.strokeStyle = '#fff'
  view.ctx.fillStyle = '#fff'

  if (this.refs.species) {
    view.ctx.strokeStyle = this.refs.species.attrs.color
    view.ctx.fillStyle = this.refs.species.attrs.color
  }

  view.ctx.save()
  view.ctx.rotate(this.attrs.a)

  // shield
  var z = 4
  var pct = (this.attrs.energy / this.attrs.energy_max)
  if (pct < 0) {
    pct = 0
  }

  view.ctx.lineWidth = 1
  view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.refs.species.attrs.color) + ',0.25)'
  view.ctx.beginPath()
  view.ctx.arc(0, 0, (z * 2) * pct, 0, 2 * Math.PI)
  view.ctx.stroke()

  // ship
  view.ctx.strokeStyle = '#000'
  view.ctx.lineWidth = 1
  view.ctx.beginPath()
  view.ctx.moveTo(z, 0)
  view.ctx.lineTo(-z, z)
  view.ctx.lineTo(-z * 0.5, 0)
  view.ctx.lineTo(-z, -z)
  view.ctx.lineTo(z, 0)
  view.ctx.closePath()
  view.ctx.stroke()
  view.ctx.fill()
  view.ctx.restore()

  // view.ctx.fillStyle = this.attrs.color
  // view.ctx.font = '9px ubuntu mono, monospace'
  // view.ctx.textBaseline = 'middle'
  // view.ctx.textAlign = 'center'
  // view.ctx.fillText(this.attrs.intent, 0, - 2*z)

  // if(this.attrs.jump_target && this.attrs.jump_range){
  //   view.ctx.fillStyle = this.attrs.color
  //   view.ctx.font = '9px ubuntu mono, monospace'
  //   view.ctx.textBaseline = 'middle'
  //   view.ctx.textAlign = 'center'
  //   view.ctx.fillText('JUMP ' + this.attrs.jump_range.toFixed(2), 0, - 2*z)
  // }

  view.ctx.restore()

  if (this.attrs.jump_point) {
    view.ctx.lineWidth = 1
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.refs.species.attrs.color) + ',1)'
    view.ctx.fillStyle = 'rgba(' + hex2rgb(this.refs.species.attrs.color) + ',1)'
    view.ctx.beginPath()
    view.ctx.arc(
      this.attrs.jump_point.x,
      this.attrs.jump_point.y,
      12 * (Date.now() / 1000 % 1),
      0, 2 * Math.PI)
    view.ctx.stroke()
    view.ctx.fill()
  }

  // consume animation flags
  this.attrs.hit = false
  this.attrs.laser = false
}
