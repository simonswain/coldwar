/* global Actors, Actor, Vec3, VecR */

Actors.Rat = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Rat.prototype = Object.create(Actor.prototype)

Actors.Rat.prototype.title = 'Rat'

Actors.Rat.prototype.init = function (attrs) {

  this.pos = new Vec3(
    attrs.x,
    attrs.y,
    0
  );

  this.velo = new VecR(
    Math.PI * 2 * Math.random(),
    this.attrs.speed
  ).vec3()
  
}

Actors.Rat.prototype.defaults = [{
  key: 'speed_base',
  info: '',
  value: 0.5,
  min: 1,
  max: 100
}, {
  key: 'speed_flux',
  info: '',
  value: 0.25,
  min: 0,
  max: 50
}, {
  key: 'velo_scale',
  info: '',
  value: 0.1,
  min: 0.1,
  max: 1,
  step: 0.1
}, {
  key: 'separation_range',
  info: '',
  value: 50,
  min: 10,
  max: 500
}, {
  key: 'cohesion_range',
  info: '',
  value: 200,
  min: 10,
  max: 500
}, {
  key: 'alignment_range',
  info: '',
  value: 500,
  min: 10,
  max: 1000
}, {
  key: 'separation_force',
  info: '',
  value: 0.7,
  min: 0.1,
  max: 1.0,
  step: 0.05
}, {
  key: 'cohesion_force',
  info: '',
  value: 2,
  min: 0.1,
  max: 1.0,
  step: 0.05
}, {
  key: 'alignment_force',
  info: '',
  value: 2.25,
  min: 0.1,
  max: 5.0,
  step: 0.05
}, {
  key: 'predator_range',
  info: '',
  value: 200,
  min: 10,
  max: 500
}, {
  key: 'reflect_force',
  info: '',
  value: 15,
  min: 0,
  max: 10
}, {
  key: 'predator_force',
  info: '',
  value: 6,
  min: 0,
  max: 10
}, {
  key: 'chase_force',
  info: '',
  value: 1,
  min: 0.1,
  max: 1.0
}, {
  key: 'show_params',
  info: '',
  value: 0,
  min: 0,
  max: 1
}]

Actors.Rat.prototype.genAttrs = function (attrs) {

  var hp = this.opts.hp_base + (this.opts.hp_flux * Math.random())

  return {
    speed: this.opts.speed_base + (Math.random() * this.opts.speed_flux),
    color: attrs.color || '#fff',
    dead: false,
    hp: hp,
    hp_max: hp,
  }
}

Actors.Rat.prototype.update = function (delta) {
  var vec = new Vec3()

  vec.add(this.separation().scale(this.opts.separation_force))
  vec.add(this.alignment().scale(this.opts.alignment_force))
  vec.add(this.cohesion().scale(this.opts.cohesion_force))
  vec.add(this.chase().scale(this.opts.chase_force))
  vec.add(this.reflect().scale(this.opts.reflect_force))

  vec.scale(this.opts.velo_scale)

  this.velo.add(vec)
  this.velo.limit(this.attrs.speed)
  this.pos.add(this.velo)

  // exit
  var other, cell;

  if (this.pos.x < 0) {
    other = this.refs.cell.exits[3];
    if(other){
      this.pos.x += this.refs.cell.opts.max_x
    } else {
      this.velo = new Vec3(-this.velo.x, this.velo.y, 0);
      this.pos.x = 0
    }
  } else if (this.pos.x > this.refs.cell.opts.max_x) {
    other = this.refs.cell.exits[1]; 
    if(other){
      this.pos.x = this.pos.x - this.refs.cell.opts.max_x
    } else {
      this.velo = new Vec3(-this.velo.x, this.velo.y, 0);
      this.pos.x = this.refs.cell.opts.max_x
    }
  }

  if (this.pos.y < 0) {
    other = this.refs.cell.exits[0];
    if(other){
      this.pos.y += this.refs.cell.opts.max_y
    } else {
      this.velo = new Vec3(this.velo.x, - this.velo.y, 0);
      this.pos.y = 0
    }
  } else if (this.pos.y > this.refs.cell.opts.max_y) {
    other = this.refs.cell.exits[2]; 
    if(other){
      this.pos.y = this.pos.y - this.refs.cell.opts.max_y
    } else {
      this.velo = new Vec3(this.velo.x, -this.velo.y, 0);
      this.pos.y = this.refs.cell.opts.max_y
    }
  }

  cell = this.refs.cell;

  if(other){
    for (var i = 0, ii = cell.rats.length; i < ii; i++) {
      if (cell.rats[i] === this) {
        cell.rats[i] = null;
        break
      }
    }
    this.refs.cell = other;
    other.rats.push(this);    
  }
  
}

Actors.Rat.prototype.reflect = function () {

  var reflect = new Vec3()

  var max = Math.min(this.refs.cell.opts.max_x, this.refs.cell.opts.max_y)

  if (!this.refs.cell.exits[3] && this.pos.x < this.refs.cell.opts.max_x * 0.1) {
    reflect.x = ((this.refs.cell.opts.max_x * 0.1) - this.pos.x ) / (this.refs.cell.opts.max_x * 0.1);
  }

  if (!this.refs.cell.exits[0] && this.pos.y < this.refs.cell.opts.max_y * 0.1) {
    reflect.y = ((this.refs.cell.opts.max_y * 0.1) - this.pos.y ) / (this.refs.cell.opts.max_y * 0.1);
  }

  if (!this.refs.cell.exits[1] && this.pos.x > this.refs.cell.opts.max_x * 0.9) {
    reflect.x = - (this.pos.x - (this.refs.cell.opts.max_x * 0.9) ) / (this.refs.cell.opts.max_x * 0.1);
  }

  if (!this.refs.cell.exits[2] && this.pos.y > this.refs.cell.opts.max_y * 0.9) {
    reflect.y = - (this.pos.y - (this.refs.cell.opts.max_y * 0.9) ) / (this.refs.cell.opts.max_y * 0.1);
  }

  return reflect

}

Actors.Rat.prototype.chase = function () {
  // determine center position of all boids
  var xx = 0
  var yy = 0
  var c = 0


  if(this.refs.cell.humans.length === 0){
    return new Vec3();
  }

  var human;
  
  for (var i = 0, ii = this.refs.cell.humans.length; i < ii; i++) {
    human = this.refs.cell.humans[i];
    if(!human){
      continue;
    }
    xx += human.pos.x
    yy += human.pos.y
    c++
  }
  
  var target = new Vec3(xx / c, yy / c)
  return target.minus(this.pos).normalize()
}

Actors.Rat.prototype.separation = function () {
  var i, ii
  var other
  var range

  var vec = new Vec3()

  for (i = 0, ii = this.refs.cell.rats.length; i < ii; i++) {
    other = this.refs.cell.rats[i]
    if(!other){
      continue;
    }

    if (other === this) {
      continue
    }

    range = this.pos.rangeXY(other.pos)

    if (range === 0) {
      continue
    }

    if (range > this.opts.separation_range) {
      continue
    }

    vec.add(this.pos.minus(other.pos).normalize().scale(1 / range))
  }

  return vec.normalize()
}

Actors.Rat.prototype.alignment = function () {
  var i, ii
  var other
  var range

  var vec = new Vec3()

  for (i = 0, ii = this.refs.cell.rats.length; i < ii; i++) {
    other = this.refs.cell.rats[i]

    if (!other) {
      continue
    }
    
    if (other === this) {
      continue
    }

    range = this.pos.rangeXY(other.pos)

    if (range === 0) {
      continue
    }

    if (range > this.opts.separation_range) {
      continue
    }

    vec.add(other.velo)
  }

  return vec.normalize()
}

Actors.Rat.prototype.cohesion = function () {

  var i, ii
  var other

  var x = 0
  var y = 0
  var c = 0

  for (i = 0, ii = this.refs.cell.rats.length; i < ii; i++) {

    other = this.refs.cell.rats[i]

    if (!other) {
      continue
    }
    

    if (other === this) {
      continue
    }

    x += this.pos.x
    y += this.pos.y
    c++
  }

  if(!c){
    return new Vec3();
  }
  
  var center = new Vec3(x / c, y / c)

  return this.pos.minus(center).normalize()
  // return center.minus(this.pos).normalize()
}

Actors.Rat.prototype.flee = function () {
  var i, ii
  var other
  var range

  var vec = new Vec3()

  // for (i = 0, ii = this.refs.predators.length; i < ii; i++) {
  //   other = this.refs.predators[i]

  //   range = this.pos.rangeXY(other.pos)

  //   if (range === 0) {
  //     continue
  //   }

  //   if (range > this.opts.predator_range) {
  //     continue
  //   }

  //   vec.add(this.pos.minus(other.pos).normalize().scale(1 / range))
  // }

  return vec.normalize()
}

Actors.Rat.prototype.steer = function () {
  var i, ii

  var dist
  var other
  var count = 0
  var vec, vector

  var alignment = new Vec3()
  var cohesion = new Vec3()
  var separation = new Vec3()

  for (i = 0, ii = this.refs.cell.rats.length; i < ii; i++) {
    other = this.refs.cell.rats[i]

    if (other === this) {
      continue
    }

    dist = this.pos.rangeXY(other.pos)

    if (dist === 0) {
      continue
    }

    if (dist <= this.opts.separation_range) {
      vec = other.pos.minus(this.pos)
      vec.normalize().scale(this.opts.separation_range / dist)
      separation.add(vec)
    }

    if (dist <= this.opts.cohesion_range) {
      vec = this.pos.minus(other.pos)
      vec.normalize().scale(this.opts.cohesion_range / dist)
      cohesion.add(vec)
    }

    if (dist <= this.opts.alignment_range) {
      vec = this.pos.minus(other.pos)
      alignment.add(vec)
      count++
    }
  }

  if (count === 0) {
    return new Vec3()
  }

  separation.normalize().scale(this.opts.separation_force)
  cohesion.normalize().scale(this.opts.cohesion_force)

  alignment = this.pos.minus(alignment)
  alignment.normalize().scale(this.opts.alignment_force)

  vector = new Vec3()
  vector.add(separation)
  vector.add(cohesion)
  vector.add(alignment)
  vector.normalize()

  return vector
}

Actors.Rat.prototype.damage = function (hp) {
  if (!hp) {
    hp = 1
  }

  this.attrs.hp -= hp
  this.attrs.hit = true

  if (this.attrs.hp > 0) {
    return
  }

  if (this.attrs.dead) {
    return
  }

  if (this.refs.base) {
    this.refs.base.attrs.bombers_launched--
  }
  this.attrs.dead = true

  // this.refs.scene.booms.push(new Actors.Boom(
  //   this.env, {
  //     scene: this.refs.scene
  //   }, {
  //     radius: 20,
  //     ttl: 35,
  //     style: '',
  //     x: this.pos.x,
  //     y: this.pos.y,
  //     z: this.pos.z,
  //     color: hex2rgb(this.attrs.color)
  //   }
  // ))
  
}


Actors.Rat.prototype.paint = function (view) {

  view.ctx.save()
  view.ctx.rotate(this.velo.angleXY())
  
  view.ctx.fillStyle = '#fff'
  view.ctx.strokeStyle = '#666'
  view.ctx.lineWidth = 1

  var z = 8
  view.ctx.lineWidth = 1
  view.ctx.beginPath()
  view.ctx.moveTo(z, 0)
  view.ctx.lineTo(-z, z)
  view.ctx.lineTo(-z * 0.5, 0)
  view.ctx.lineTo(-z, -z)
  view.ctx.lineTo(z, 0)
  view.ctx.closePath()
  view.ctx.fill()

  view.ctx.restore()
}
