/* global Actors, Actor, Vec3, VecR */

Actors.Demorat = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Demorat.prototype = Object.create(Actor.prototype)

Actors.Demorat.prototype.title = 'Demorat'

Actors.Demorat.prototype.genAttrs = function (attrs) {

  var hp = this.opts.hp_base + (this.opts.hp_flux * Math.random())

  var type = Math.floor(Math.random() * 3);
  //type = 1;
  
  if(attrs.type){
    type = attrs.type;
  }

  var speed = this.opts.speed_base + (Math.random() * this.opts.speed_flux)

  switch(type){
  case 0:
    break;
  case 1:
    speed *= 0.25
    break;
  case 2:
    speed *= 0.75
    break;
  }
  
  return {
    type: type,
    speed: speed,
    dead: false,
    hp: hp,
    hp_max: hp,
    ttl: 0
  }
  
}

Actors.Demorat.prototype.init = function (attrs) {

  this.pos = new Vec3(
    attrs.x,
    attrs.y,
    0
  );

  this.velo = new VecR(
    Math.PI * 2 * Math.random(),
    this.attrs.speed
  ).vec3()

  if(this.attrs.type === 1){
    this.attrs.ttl = 200 + Math.random() * 300
  }

  if(this.attrs.type === 2){
    this.attrs.ttl = 100 + Math.random() * 200
  }

}

Actors.Demorat.prototype.defaults = [{
  key: 'type',
  info: '',
  value: 0,
  min: 0, // rat, mommy, baby, king
  max: 3
}, {
  key: 'babies_max',
  info: '',
  value: 3,
  min: 0,
  max: 10
}, {
  key: 'speed_base',
  info: '',
  value: 4,
  min: 1,
  max: 100
}, {
  key: 'speed_flux',
  info: '',
  value: 2,
  min: 0,
  max: 50
}, {
  key: 'velo_scale',
  info: '',
  value: 1,
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

Actors.Demorat.prototype.update = function (delta) {
  var vec = new Vec3()

  // white rats
  if(this.attrs.type === 0){
    //vec.add(this.cohesion().scale(2))
    vec.add(this.separation().scale(3)) 
    //vec.add(this.alignment().scale(this.opts.alignment_force))
    vec.add(this.chase().scale(3))
  }

  // grey rats stick together
  if(this.attrs.type === 1){
    vec.add(this.cohesion().scale(0.25))
    vec.add(this.separation().scale(0.25)) 
    vec.add(this.alignment())
  }

  // baby rats
  if(this.attrs.type === 2){
    vec.add(this.cohesion().scale(3))
    vec.add(this.separation().scale(1)) 
    vec.add(this.alignment().scale(2))
    vec.add(this.chase().scale(1))
  }

  // vec.add(this.separation().scale(this.opts.separation_force))
  // vec.add(this.alignment().scale(this.opts.alignment_force))
  // vec.add(this.cohesion().scale(this.opts.cohesion_force))
  // vec.add(this.chase().scale(this.opts.chase_force))

  vec.scale(this.opts.velo_scale)

  this.velo.add(vec)
  this.velo.scale(0.8 + (Math.random()*0.5))
  this.velo.limit(this.attrs.speed)
  this.pos.add(this.velo);
  
  if(this.pos.x < 0){
    this.dead = true;
  }

  if(this.pos.x > this.opts.max_x){
    this.dead = true;
  }

  if(this.pos.y < 0){
    this.dead = true;
  }

  if(this.pos.y > this.opts.max_y){
    this.dead = true;
  }


  // momma maturity
  
  if(this.attrs.type === 1){
    if(this.attrs.ttl>0){
      this.attrs.ttl --;
    }
    if(this.attrs.ttl <= 0){
      this.kill()
    }
  }

  // baby maturity
  
  if(this.attrs.type === 2){
    if(this.attrs.ttl>0){
      this.attrs.ttl --;
    }
    if(this.attrs.ttl <= 0){
      this.attrs.type = 0;
    }
  }
  
  
}


Actors.Demorat.prototype.chase = function () {
  // determine center position of all boids
  var xx = 0
  var yy = 0
  var c = 0

  if(!this.refs.demo.humans){
    return new Vec3();
  }

  if(this.refs.demo.humans.length === 0){
    return new Vec3();
  }

  var human;
  
  for (var i = 0, ii = this.refs.demo.humans.length; i < ii; i++) {
    human = this.refs.demo.humans[i];
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

Actors.Demorat.prototype.separation = function () {
  var i, ii
  var other
  var range

  var vec = new Vec3()

  for (i = 0, ii = this.refs.demo.rats.length; i < ii; i++) {
    other = this.refs.demo.rats[i]
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

Actors.Demorat.prototype.alignment = function () {
  var i, ii
  var other
  var range

  var vec = new Vec3()

  for (i = 0, ii = this.refs.demo.rats.length; i < ii; i++) {
    other = this.refs.demo.rats[i]

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

Actors.Demorat.prototype.cohesion = function () {

  var i, ii
  var other

  var x = 0
  var y = 0
  var c = 0

  for (i = 0, ii = this.refs.demo.rats.length; i < ii; i++) {

    other = this.refs.demo.rats[i]

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

Actors.Demorat.prototype.flee = function () {
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

Actors.Demorat.prototype.steer = function () {
  var i, ii

  var dist
  var other
  var count = 0
  var vec, vector

  var alignment = new Vec3()
  var cohesion = new Vec3()
  var separation = new Vec3()

  for (i = 0, ii = this.refs.demo.rats.length; i < ii; i++) {
    other = this.refs.demo.rats[i]

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

Actors.Demorat.prototype.damage = function (hp) {

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

  this.kill();
  
}

Actors.Demorat.prototype.kill = function () {

  if (this.attrs.dead) {
    return
  }

  this.attrs.dead = true;

  if(this.refs.breeder){
    for (i = 0, ii = this.refs.breeder.rats.length; i < ii; i++) {
      if (this.refs.breeder.rats[i] === this) {
        this.refs.breeder.rats[i] = null;
        break
      }
    }
  }

  for (i = 0, ii = this.refs.demo.rats.length; i < ii; i++) {
    if (this.refs.demo.rats[i] === this) {
      this.refs.demo.rats[i] = null;
      break
    }
  }

  this.refs.demo.booms.push(new Actors.Boom(
    this.env, {
    }, {
      style: '',
      radius: 16,
      x: this.pos.x,
      y: this.pos.y,
      color: '255,0,0'
    }
  ))

  var rat;
  if(this.attrs.type === 1){
    // mommy
    for(var i=2, ii = 4 + Math.floor(Math.random()*this.opts.babies_max)+1; i<ii; i++){
      rat = new Actors.Demorat(
        this.env, {
          breeder: this.refs.breeder,
          demo: this.refs.demo,
        }, {
          type: 2, // baby
          x: this.pos.x,
          y: this.pos.y,
        })
      this.refs.demo.rats.push(rat)
      if(this.refs.breeder){
        this.refs.breeder.rats.push(rat)  
      }
    }
  }
  
}


Actors.Demorat.prototype.paint = function (view) {

  view.ctx.save()
  view.ctx.rotate(this.velo.angleXY())
  
  view.ctx.fillStyle = '#fff'
  view.ctx.lineWidth = 1

  var z = 8
  switch (this.attrs.type) {
  case 0:
    // white rat

    // tail
    view.ctx.fillStyle = '#ccc'
    view.ctx.beginPath()
    view.ctx.moveTo(-z-z-z-z-z, 0)
    view.ctx.lineTo(0, z)
    view.ctx.lineTo(0, -z)
    view.ctx.lineTo(-z-z-z-z-z, 0)
    view.ctx.closePath()
    view.ctx.fill()

    // head
    view.ctx.fillStyle = '#fff'
    view.ctx.beginPath()
    //view.ctx.arc(z*2, 0, z, 0, 2*Math.PI);
    view.ctx.ellipse(z*2, 0, z * 1.2, z * 0.8, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    // body
    view.ctx.fillStyle = '#eee'
    view.ctx.lineWidth = 1
    view.ctx.beginPath()
    //view.ctx.arc(0, 0, 2*z, 0, 2*Math.PI);
    view.ctx.ellipse(0, 0, z * 2.2, z * 1.6, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    //eyes
    view.ctx.fillStyle = '#f00'
    view.ctx.beginPath()
    view.ctx.arc(z * 2.5, -z*0.2, z*0.1, 0, 2*Math.PI);
    view.ctx.closePath()

    view.ctx.fill() 
    view.ctx.beginPath()
    view.ctx.arc(z * 2.5, z*0.2, z*0.1, 0, 2*Math.PI);
    view.ctx.closePath()
    view.ctx.fill()

    break;

  case 1:
    // momma rat

    // tail
    view.ctx.fillStyle = '#ccc'
    view.ctx.beginPath()
    view.ctx.moveTo(-z-z-z-z-z, 0)
    view.ctx.lineTo(0, z)
    view.ctx.lineTo(0, -z)
    view.ctx.lineTo(-z-z-z-z-z, 0)
    view.ctx.closePath()
    view.ctx.fill()

    // body
    view.ctx.fillStyle = '#444'
    view.ctx.lineWidth = 1
    view.ctx.beginPath()
    view.ctx.ellipse(0, 0, z * 2.8, z * 2.2, 0, 2*Math.PI, 0);
    //view.ctx.arc(0, 0, 3*z, 0, 2*Math.PI);
    view.ctx.closePath()
    view.ctx.fill()
    // head
    view.ctx.fillStyle = '#fff'
    view.ctx.beginPath()
    view.ctx.arc(z*2, 0, z, 0, 2*Math.PI);
    view.ctx.closePath()
    view.ctx.fill()

       //eyes
    view.ctx.fillStyle = '#f00'
    view.ctx.beginPath()
    view.ctx.arc(z * 2.5, -z*0.2, z*0.1, 0, 2*Math.PI);
    view.ctx.closePath()

    view.ctx.fill() 
    view.ctx.beginPath()
    view.ctx.arc(z * 2.5, z*0.2, z*0.1, 0, 2*Math.PI);
    view.ctx.closePath()
    view.ctx.fill()

    break;

  case 2:
    // baby rat

    // tail
    view.ctx.fillStyle = '#fff'
    view.ctx.beginPath()
    view.ctx.moveTo(-z-z-z, 0)
    view.ctx.lineTo(0, z*0.25)
    view.ctx.lineTo(0, -z*0.25)
    view.ctx.lineTo(-z-z-z, 0)
    view.ctx.closePath()
    view.ctx.fill()

    // body
    view.ctx.fillStyle = '#fff'
    view.ctx.lineWidth = 1
    view.ctx.beginPath()
    view.ctx.ellipse(0, 0, z * 1.1, z * 0.8, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    // head
    view.ctx.fillStyle = '#fff'
    view.ctx.beginPath()
    view.ctx.arc(z, 0, z*0.4, 0, 2*Math.PI);
    view.ctx.closePath()
    view.ctx.fill()

           //eyes
    view.ctx.fillStyle = '#f00'
    view.ctx.beginPath()
    view.ctx.arc(z * 1.1, -z*0.2, z*0.08, 0, 2*Math.PI);
    view.ctx.closePath()

    view.ctx.fill() 
    view.ctx.beginPath()
    view.ctx.arc(z * 1.1, z*0.2, z*0.08, 0, 2*Math.PI);
    view.ctx.closePath()
    view.ctx.fill()

    break;
  default:

    // tail
    view.ctx.fillStyle = '#ccc'
    view.ctx.beginPath()
    view.ctx.moveTo(-z-z-z-z, 0)
    view.ctx.lineTo(0, z)
    view.ctx.lineTo(0, -z)
    view.ctx.lineTo(-z-z-z-z, 0)
    view.ctx.closePath()
    view.ctx.fill()

    // body
    view.ctx.fillStyle = '#eee'
    view.ctx.lineWidth = 1
    view.ctx.beginPath()
    view.ctx.arc(0, 0, 2*z, 0, 2*Math.PI);
    view.ctx.closePath()
    view.ctx.fill()

    // head
    view.ctx.fillStyle = '#fff'
    view.ctx.beginPath()
    view.ctx.arc(z*2, 0, z, 0, 2*Math.PI);
    view.ctx.closePath()
    view.ctx.fill()
    break;
  }

  view.ctx.restore()
}
