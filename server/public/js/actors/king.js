/* global Actors, Actor, Vec3, VecR */

Actors.King = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.King.prototype = Object.create(Actor.prototype)

Actors.King.prototype.title = 'King'

Actors.King.prototype.init = function (attrs) {

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

Actors.King.prototype.genAttrs = function (attrs) {
  var hp = 20 + (10 * Math.random())

  var speed = this.opts.speed_base + (Math.random() * this.opts.speed_flux)

  return {
    phase: Math.random() * 2 * Math.PI,
    phase_v: Math.random() * 0.5,
    speed: speed,
    dead: false,
    hp: hp,
    hp_max: hp
  }
}


Actors.King.prototype.init = function (attrs) {

  this.pos = new Vec3(
    attrs.x,
    attrs.y,
    0
  );

  this.velo = new VecR(
    Math.PI * 2 * Math.random(),
    this.attrs.speed
  ).vec3();

}

Actors.King.prototype.defaults = [{
  key: 'speed_base',
  info: '',
  value: 10,
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
  value: 128,
  min: 10,
  max: 500
}, {
  key: 'cohesion_range',
  info: '',
  value: 128,
  min: 10,
  max: 500
}, {
  key: 'alignment_range',
  info: '',
  value: 240,
  min: 10,
  max: 1000
}, {
  key: 'separation_force',
  info: '',
  value: 1,
  min: 0.1,
  max: 1.0,
  step: 0.05
}, {
  key: 'cohesion_force',
  info: '',
  value: 0.2,
  min: 0.1,
  max: 1.0,
  step: 0.05
}, {
  key: 'alignment_force',
  info: '',
  value: 1,
  min: 0.1,
  max: 5.0,
  step: 0.05
}, {
  key: 'predator_range',
  info: '',
  value: 240,
  min: 10,
  max: 500
}, {
  key: 'reflect_force',
  info: '',
  value: 1,
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
  key: 'intent_scale',
  value: 35,
  min: 0,
  max: 100,
}]

Actors.King.prototype.update = function (delta) {

  this.attrs.phase += this.attrs.phase_v;
  if(this.attrs.phase > 2*Math.PI){
    this.attrs.phase - 2*Math.PI;
  }
  
  var vec = new Vec3()
  vec.add(this.alignment().scale(0.1))
  vec.add(this.separation().scale(0.2))
  vec.add(this.chase().scale(0.2))
  vec.add(this.reflect())

  this.velo.add(vec);
  this.velo.limit(1);
  this.pos.sub(this.center().scale(1))
  this.pos.add(this.velo)
}

Actors.King.prototype.chase = function () {
  if(!this.refs.scene.hume){
    return new Vec3();
  }
  return this.refs.scene.hume.pos.minus(this.pos).normalize()
}

Actors.King.prototype.alignment = function () {
  var i, ii
  var other
  var range

  var center = new Vec3()
  c = 0;
  for (i = 0, ii = this.refs.scene.kings.length; i < ii; i++) {
    other = this.refs.scene.kings[i]
    if (!other) {
      continue
    }

    if (other === this) {
      continue
    }

    c ++;
    center.add(other.pos);
  }
  if(c === 0){
    return new Vec3();
  }
  center.div(c);
  return this.pos.minus(center).normalize();
}

Actors.King.prototype.center = function () {
  var i, ii
  var other
  var range

  var center = new Vec3()
  c = 0;
  for (i = 0, ii = this.refs.scene.kings.length; i < ii; i++) {
    other = this.refs.scene.kings[i]
    if (!other) {
      continue
    }

    if (other === this) {
      continue
    }

    c ++;
    center.add(other.pos);
  }
  if(c === 0){
    return new Vec3();
  }
  center.div(c);

  range = this.pos.rangeXY(center)

  if (range === 0) {
    return new Vec3();
  }

  if (range < 56) {
    return new Vec3();
  }

  //return this.pos.minus(center).normalize();;
  return this.pos.minus(center).normalize().scale(128 / range)

}

Actors.King.prototype.separation = function () {
  var i, ii
  var other
  var range

  var vec = new Vec3()

  for (i = 0, ii = this.refs.scene.kings.length; i < ii; i++) {
    other = this.refs.scene.kings[i]
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

    if (range > 100) {
      continue
    }

    vec.add(this.pos.minus(other.pos).normalize().scale(1 / range))
  }

  return vec.normalize()
}



Actors.King.prototype.reflect = function () {

  var reflect = new Vec3()

  var max = Math.min(this.refs.scene.opts.max_x, this.refs.scene.opts.max_y)

  if (this.pos.y < this.refs.scene.opts.max_y * 0.1) {
    reflect.y = ((this.refs.scene.opts.max_y * 0.1) - this.pos.y ) / (this.refs.scene.opts.max_y * 0.1);
  }

  if (this.pos.x > this.refs.scene.opts.max_x * 0.9) {
    reflect.x = - (this.pos.x - (this.refs.scene.opts.max_x * 0.9) ) / (this.refs.scene.opts.max_x * 0.1);
  }

  if (this.pos.x < this.refs.scene.opts.max_x * 0.1) {
    reflect.x = ((this.refs.scene.opts.max_x * 0.1) - this.pos.x ) / (this.refs.scene.opts.max_x * 0.1);
  }

  if (this.pos.y > this.refs.scene.opts.max_y * 0.9) {
    reflect.y = - (this.pos.y - (this.refs.scene.opts.max_y * 0.9) ) / (this.refs.scene.opts.max_y * 0.1);
  }

  return reflect

}


Actors.King.prototype.damage = function (hp) {

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

Actors.King.prototype.kill = function (terminal) {

  if (this.attrs.dead) {
    return
  }

  this.attrs.dead = true;

  if(this.refs.scene){
    for (i = 0, ii = this.refs.scene.kings.length; i < ii; i++) {
      if (this.refs.scene.kings[i] === this) {
        this.refs.scene.kings[i] = null;
        break
      }
    }
  }


  this.refs.scene.booms.push(new Actors.Boom(
    this.env, {
    }, {
      style: '',
      radius: 16,
      x: this.pos.x,
      y: this.pos.y,
      color: '255,0,0'
    }
  ))

  if(terminal){
    return;
  }

}

Actors.King.prototype.paint = function (view) {

  view.ctx.save()
  view.ctx.rotate(this.velo.angleXY())

  var ccc = '#c00'

  if(this.attrs.hit){
    this.attrs.hit = false;
    ccc = '#ff0';
  }
  
  view.ctx.fillStyle = '#c00'
  view.ctx.strokeStyle = '#c00'
  view.ctx.lineWidth = 1

  
  var z = 8

  // for tails
  var q1 = (Math.sin(this.attrs.phase/2) % (2*Math.PI));
  var q2 = (Math.sin(this.attrs.phase/3) % (2*Math.PI));

  // tail
  view.ctx.fillStyle = ccc
  view.ctx.strokeStyle = ccc
  view.ctx.save()
  view.ctx.translate(-1.5*z, 0)
  view.ctx.beginPath()
  view.ctx.moveTo(0, 0.5*z)
  view.ctx.quadraticCurveTo(-5*z, z * q1, -5 * z, 0)
  view.ctx.quadraticCurveTo(-5*z, z * q1, 0, -0.5*z)
  view.ctx.closePath()
  view.ctx.stroke()
  view.ctx.fill()
  view.ctx.restore()

  // body
  view.ctx.fillStyle = ccc
  view.ctx.lineWidth = 1
  view.ctx.beginPath()
  view.ctx.ellipse(0, 0, z * 2.5, z * 1.2, 0, 2*Math.PI, 0);
  view.ctx.closePath()
  view.ctx.fill()

  // head
  view.ctx.save()
  view.ctx.translate(2.2*z, 0)
  view.ctx.rotate(q2 * 0.3)

  // whiskers
  view.ctx.strokeStyle = ccc
  view.ctx.lineWidth=0.5

  view.ctx.beginPath()
  view.ctx.moveTo(z*0.8, 0)
  view.ctx.lineTo(z*0.7, -z)
  view.ctx.stroke()

  view.ctx.beginPath()
  view.ctx.moveTo(z*0.8, 0)
  view.ctx.lineTo(z*0.9, -z)
  view.ctx.stroke()

  view.ctx.beginPath()
  view.ctx.moveTo(z*0.8, 0)
  view.ctx.lineTo(z*0.7, z)
  view.ctx.stroke()

  view.ctx.beginPath()
  view.ctx.moveTo(z*0.8, 0)
  view.ctx.lineTo(z*0.9, z)
  view.ctx.stroke()

  // skull
  view.ctx.fillStyle = ccc
  view.ctx.beginPath()
  view.ctx.ellipse(0, 0, z * 1.2, z * 0.7, 0, 2*Math.PI, 0);
  view.ctx.closePath()
  view.ctx.fill()

  //eyes
  view.ctx.fillStyle = '#ff0'
  // blink
  if(Math.random() < 0.1){
    view.ctx.fillStyle = '#000'
  }
  view.ctx.beginPath()
  view.ctx.ellipse(z * 0.8, -z*0.2, z * 0.1, z * 0.05, 0, 2*Math.PI, 0);
  view.ctx.closePath()

  view.ctx.fill()
  view.ctx.beginPath()
  view.ctx.ellipse(z * 0.8, z*0.2, z * 0.1, z * 0.05, 0, 2*Math.PI, 0);
  view.ctx.closePath()
  view.ctx.fill()

  view.ctx.restore()
  // end head


  view.ctx.restore()
}
