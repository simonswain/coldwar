/* global Actors, Actor, Vec3, hex2rgb */

Actors.Fighter = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Fighter.prototype = Object.create(Actor.prototype)

Actors.Fighter.prototype.title = 'Fighter'

Actors.Fighter.prototype.genAttrs = function (attrs) {
  var hp = this.opts.hp_base + (this.opts.hp_flux * Math.random())

  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z || 0,
    color: attrs.color || '#f0f',
    dead: false,
    ttl: attrs.ttl || this.opts.ttl,
    speed: this.opts.speed_base + (this.opts.speed_flux * Math.random()),
    max_z: Math.floor((this.refs.scene.opts.max_z * 0.3) + ((this.refs.scene.opts.max_z * 0.1) * Math.random())),
    attack_z: 10,
    vel_z: 0,
    vel_z_max: 0.5,
    vel_z_speed: 0.01,
    z_accel: 0.1,
    z_vel_max: 0.1,

    separation_friend: this.refs.scene.opts.max * this.opts.separation_friend,
    separation_enemy: this.refs.scene.opts.max * this.opts.separation_enemy,
    avoidance_enemy: this.refs.scene.opts.max * this.opts.avoidance_enemy,
    attack_range: this.refs.scene.opts.max * this.opts.attack_range,

    hp: hp,
    hp_max: hp,

    laser: null,
    laser_range: this.refs.scene.opts.max * this.opts.laser_range,
    laser_max: this.opts.laser_base + (this.opts.laser_flux * Math.random()),
    laser_power: 0, // current laser charge
    laser_damage: 2,

    mode: 'station',

    station: new Vec3(
      this.refs.scene.opts.max_x / 2,
      this.refs.base.pos.y,
      Math.floor((this.refs.scene.opts.max_z * 0.3) + ((this.refs.scene.opts.max_z * 0.1) * Math.random())))
  }
}

Actors.Fighter.prototype.init = function () {
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    0
  )

  this.velo = new Vec3(
    Math.random() * this.attrs.speed,
    Math.random() * this.attrs.speed, 0
  )
}

Actors.Fighter.prototype.defaults = [{
  key: 'speed_base',
  info: '',
  value: 0.5,
  min: 0.1,
  max: 5
}, {
  key: 'speed_flux',
  info: '',
  value: 0.5,
  min: 0,
  max: 2,
  step: 0.1
}, {
  key: 'ttl',
  info: '',
  value: 100000,
  min: 100,
  max: 1000000
}, {
  key: 'show_vectors',
  info: '',
  value: 0,
  min: 0,
  max: 1
}, {
  key: 'show_flocking',
  info: '',
  value: 0,
  min: 0,
  max: 1
}, {
  key: 'hp_base',
  info: '',
  value: 10,
  min: 1,
  max: 100
}, {
  key: 'hp_flux',
  info: '',
  value: 10,
  min: 0,
  max: 100
}, {
  key: 'laser_range',
  info: '',
  value: 0.05,
  min: 0.001,
  max: 0.25,
  step: 0.001
}, {
  key: 'laser_base',
  info: '',
  value: 5,
  min: 1,
  max: 10
}, {
  key: 'laser_flux',
  info: '',
  value: 5,
  min: 0,
  max: 10
}, {
  key: 'attack_range',
  info: '.',
  value: 0.2,
  min: 0.4,
  max: 0.25,
  step: 0.001
}, {
  key: 'range',
  info: 'Max range from base',
  value: 200,
  min: 0,
  max: 1000
}, {
  key: 'separation_friend',
  info: 'Separation from Friend',
  value: 0.2,
  min: 0.05,
  max: 1,
  step: 0.05
}, {
  key: 'separation_enemy',
  info: 'Separation from Enemy',
  value: 0.1,
  min: 0.05,
  max: 1,
  step: 0.05
}, {
  key: 'gas',
  info: 'Gas',
  value: 600,
  min: 0,
  max: 1000
}]

Actors.Fighter.prototype.update = function (delta) {
  this.attrs.ttl--

  // out of gas
  if (this.attrs.ttl < 0) {
    this.refs.base.attrs.fighters_launched--
    this.attrs.dead = true
  }

  // reset laser
  this.attrs.laser = null

  // charge laser
  if (this.attrs.laser_power < this.attrs.laser_max) {
    this.attrs.laser_power++
  }

  // reset damage, count down because bombers shoot fighters and the
  // hit needs to stay for an extra update

  if (this.attrs.hit) {
    this.attrs.hit--
    if (this.attrs.hit === 0) {
      this.attrs.hit = false
    }
  }

  if (this.refs.capital.defcon > 3) {
    this.attrs.mode = 'station'
  } else {
    this.attrs.mode = 'attack'
  }

  // altitude
  if (this.attrs.mode === 'station') {
    // if(this.pos.z < this.attrs.max_z){
    //   this.pos.z += this.attrs.vel_z
    //   this.attrs.vel_z += this.attrs.vel_z_speed
    //   if(this.attrs.vel_z > this.attrs.vel_z_max){
    //     this.attrs.vel_z = this.attrs.vel_z_max
    //   }
    // }
  }

  if (this.attrs.mode === 'attack') {
    if (this.pos.z < this.attrs.max_z) {
      this.pos.z += this.attrs.vel_z
      this.attrs.vel_z += this.attrs.vel_z_speed
      if (this.attrs.vel_z > this.attrs.vel_z_max) {
        this.attrs.vel_z = this.attrs.vel_z_max
      }
    }
  }

  // if(this.attrs.mode === 'return'){
  //   this.pos.z += this.attrs.vel_z
  //   this.attrs.vel_z -= this.attrs.vel_z_speed
  //   if(this.attrs.vel_z < -this.attrs.vel_z_max){
  //     this.attrs.vel_z = -this.attrs.vel_z_max
  //   }
  // }

  // chase closest enemy bomber, or fly to station
  var goal = this.chase()

  // flock away from comrades
  var separation = this.separation()
  // proportion and average all vectors

  // acceleration vector
  var vector = new Vec3()
  vector.add(goal.scale(0.5))
  vector.add(separation)

  vector.scale(this.attrs.speed)
  this.velo.add(vector)
  this.velo.limit(this.attrs.speed)

  this.pos.add(this.velo)
}

// find closest enemy aircraft and attack it. If no enemy in range,
// then fly towards station point
Actors.Fighter.prototype.chase = function () {
  var i, ii
  var target, other
  var dist, dist2, distX
  var range = this.attrs.attack_range
  var range2 = this.attrs.attack_range

  // work through bombers then fighters to find closest enemy

  // first look for enemy bombers in capital's side of the screen

  // next find any bomber in attack range

  // acquire a laser target if one is close enough

  for (i = 0, ii = this.refs.scene.bombers.length; i < ii; i++) {
    other = this.refs.scene.bombers[i]
    if (other.refs.capital === this.refs.capital) {
      continue
    }
    distX = this.pos.rangeX(other.pos)
    if (distX > this.attrs.attack_range) {
      continue
    }
    dist = this.pos.range(other.pos)
    if (dist < range) {
      target = other
      range = dist
    }
  }

  // if no bombers to target, then go for a fighter

  // if no laser target, use this loop to find any fighter close
  // enough and shoot at it

  if (!target) {
    for (i = 0, ii = this.refs.scene.fighters.length; i < ii; i++) {
      other = this.refs.scene.fighters[i]
      if (other.refs.capital === this.refs.capital) {
        continue
      }
      if (this.pos.rangeX(other.pos) > this.attrs.attack_range) {
        continue
      }
      dist2 = this.pos.range(other.pos)
      if (dist2 < range2) {
        target = other
        range2 = dist2
      }
    }
  }

  if (!target) {
    return this.attrs.station.minus(this.pos).normalize()
  }

  if (this.pos.range(target.pos) < this.attrs.laser_range) {
    this.shoot(target)
  }

  // just used to separation doesn't try to move away from target
  this.refs.target = target

  return target.pos.minus(this.pos).normalize()
}

Actors.Fighter.prototype.separation = function () {
  var i, ii
  var separation = new Vec3()
  var dist, distX
  var other
  var count = 0

  for (i = 0, ii = this.refs.scene.fighters.length; i < ii; i++) {
    other = this.refs.scene.fighters[i]

    if (other === this) {
      continue
    }

    if (other === this.refs.target) {
      continue
    }

    distX = this.pos.rangeX(other.pos)
    if (distX > this.attrs.separation_enemy) {
      continue
    }

    dist = this.pos.rangeXY(other.pos)
    if (dist === 0) {
      continue
    }

    if (other.refs.capital === this.refs.capital) {
      if (dist > this.attrs.separation_friend) {
        continue
      }
      separation.add(this.pos.minusXY(other.pos).normalize().scale(this.attrs.separation_friend / dist).scale(0.25))
    } else {
      if (dist > this.attrs.separation_enemy) {
        continue
      }
      separation.add(this.pos.minusXY(other.pos).normalize().scale(this.attrs.separation_enemy / dist).scale(0.25))
    }
    count++
  }

  for (i = 0, ii = this.refs.scene.bombers.length; i < ii; i++) {
    other = this.refs.scene.bombers[i]
    if (other === this) {
      continue
    }

    distX = this.pos.rangeX(other.pos)
    if (distX > this.attrs.separation_enemy) {
      continue
    }

    dist = this.pos.rangeXY(other.pos)

    if (dist === 0) {
      continue
    }

    if (other.refs.capital === this.refs.capital) {
      if (dist > this.attrs.separation_friend) {
        continue
      }
      separation.add(this.pos.minusXY(other.pos).normalize().scale(this.attrs.separation_friend / dist).scale(0.25))
    } else {
      if (dist > this.attrs.separation_enemy) {
        continue
      }
      separation.add(this.pos.minusXY(other.pos).normalize().scale(this.attrs.separation_enemy / dist).scale(0.25))
    }
    count++
  }

  // if no target, maintain separation from station
  if (!this.refs.target) {
    dist = this.pos.rangeXY(this.attrs.station)
    if (dist < this.attrs.separation_friend) {
      separation.add(this.pos.minusXY(this.attrs.station).normalize().scale(this.attrs.separation_friend / dist).scale(0.25))
    }
    count++
  }

  if (count === 0) {
    return new Vec3()
  }
  return separation.div(count)
  // return separation.normalize()
}

Actors.Fighter.prototype.shoot = function (target) {
  if (this.attrs.laser_power <= 0) {
    return
  }

  this.attrs.laser_power -= 2

  this.attrs.laser = new Vec3().copy(target.pos)
  if (target && typeof target.damage === 'function') {
    target.damage()
  }
}

Actors.Fighter.prototype.damage = function (hp) {
  if (!hp) {
    hp = 1
  }

  this.attrs.hp -= hp
  this.attrs.hit = 2

  if (this.attrs.hp > 0) {
    return
  }

  if (this.attrs.dead) {
    return
  }

  this.refs.base.attrs.fighters_launched--
  this.attrs.dead = true
  this.refs.scene.booms.push(new Actors.Boom(
    this.env, {
      scene: this.refs.scene
    }, {
      radius: 15,
      ttl: 25,
      style: '',
      x: this.pos.x,
      y: this.pos.y,
      z: this.pos.z,
      color: hex2rgb(this.attrs.color)
    }))
}

Actors.Fighter.prototype.paint = function (view) {
  // show vector to target
  if (this.opts.show_vectors) {
    if (this.refs.target) {
      view.ctx.beginPath()
      view.ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      view.ctx.moveTo(this.pos.x, this.pos.y)
      view.ctx.lineTo(this.refs.target.pos.x, this.refs.target.pos.y)
      view.ctx.stroke()
    }
  }

  if (this.attrs.laser) {
    view.ctx.beginPath()
    view.ctx.lineWidth = 1
    view.ctx.strokeStyle = this.attrs.color
    view.ctx.moveTo(this.pos.x, this.pos.y)
    view.ctx.lineTo(this.attrs.laser.x, this.attrs.laser.y)
    view.ctx.stroke()
  }

  view.ctx.save()
  view.ctx.translate(this.pos.x, this.pos.y)
  view.ctx.rotate(this.velo.angleXY())

  if (this.attrs.hit) {
    view.ctx.strokeStyle = '#f00'
  } else {
    view.ctx.strokeStyle = this.attrs.color
  }

  var z = 2 + 8 * (this.pos.z / this.refs.scene.opts.max_z)

  view.ctx.lineWidth = 2

  view.ctx.beginPath()
  view.ctx.moveTo(-z, -z)
  view.ctx.lineTo(0, 0)
  view.ctx.lineTo(-z, z)
  view.ctx.stroke()

  view.ctx.beginPath()
  view.ctx.lineTo(0, 0)
  view.ctx.lineTo(z, 0)
  view.ctx.stroke()

  view.ctx.restore()
}

Actors.Fighter.prototype.elevation = function (view) {
  // show vector to target
  if (this.opts.show_vectors) {
    if (this.refs.target) {
      view.ctx.beginPath()
      view.ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      view.ctx.moveTo(this.pos.x, (this.refs.scene.opts.max_z - this.pos.z))
      view.ctx.lineTo(this.refs.target.pos.x, (this.refs.scene.opts.max_z - this.refs.target.pos.z))
      view.ctx.stroke()
    }
  }

  view.ctx.save()
  view.ctx.translate(this.pos.x, (this.refs.scene.opts.max_z - this.pos.z))

  view.ctx.fillStyle = this.attrs.color
  view.ctx.beginPath()
  view.ctx.fillRect(-1, -1, 2, 2)

  view.ctx.restore()

  if (this.attrs.laser) {
    view.ctx.beginPath()
    view.ctx.lineWidth = 1
    view.ctx.strokeStyle = this.attrs.color
    view.ctx.moveTo(this.pos.x, (this.refs.scene.opts.max_z - this.pos.z))
    view.ctx.lineTo(this.attrs.laser.x, (this.refs.scene.opts.max_z - this.attrs.laser.z))
    view.ctx.stroke()
  }
}
