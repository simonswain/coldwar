/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true, pickOne */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Bomber = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Bomber.prototype = Object.create(Actor.prototype);

Actors.Bomber.prototype.title = 'Bomber';

Actors.Bomber.prototype.genAttrs = function(attrs){

  var hp = this.opts.hp_base + (this.opts.hp_flux * Math.random());

  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    color: attrs.color || '#f0f',
    dead: false,
    ttl: attrs.ttl || this.opts.ttl,
    speed: attrs.speed || this.opts.speed - (this.opts.speed_flux/2) + (Math.random()*this.opts.speed_flux),
    //speed: attrs.speed || this.opts.speed - (this.opts.speed_flux/2) + (Math.random()*this.opts.speed_flux),
    max_z: Math.floor((this.refs.scene.opts.max_z * 0.3) + ((this.refs.scene.opts.max_z * 0.2) * Math.random())),
    attack_z: 10,
    vel_z: 0,
    vel_z_max: 0.5,
    vel_z_speed: 0.01,

    separation_friend: this.refs.scene.opts.max * this.opts.separation_friend,
    separation_enemy: this.refs.scene.opts.max * this.opts.separation_enemy,
    avoidance_enemy: this.refs.scene.opts.max * this.opts.avoidance_enemy,

    hp: hp,
    hp_max: hp,

    laser: null,
    laser_range: this.refs.scene.opts.max * this.opts.laser_range,
    laser_max: this.opts.laser_base + (this.opts.laser_flux * Math.random()),
    laser_power: 0, // current laser charge
    laser_damage: 2,

    // range to start descent for bombing
    attack_range: this.refs.scene.opts.max * this.opts.attack_range,

    // range where bombing works
    killrange: 12,
  };
};

Actors.Bomber.prototype.init = function(){
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  );
  this.velo = new Vec3(Math.random() * this.attrs.speed, Math.random() * this.attrs.speed);
};

Actors.Bomber.prototype.defaults = [{
  key: 'speed',
  info: '',
  value: 0.5,
  min: 0.1,
  max: 5
}, {
  key: 'speed_flux',
  info: '',
  value: 0.1,
  min: 0,
  max: 2
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
  value: 50,
  min: 1,
  max: 100
}, {
  key: 'hp_flux',
  info: '',
  value: 20,
  min: 0,
  max: 100
}, {
  key: 'laser_range',
  info: '.',
  value: 0.05,
  min: 0.001,
  max: 0.25,
  step: 0.001
}, {
  key: 'laser_base',
  info: '',
  value: 30,
  min: 1,
  max: 50,
}, {
  key: 'laser_flux',
  info: '',
  value: 10,
  min: 0,
  max: 50
}, {
  key: 'attack_range',
  info: '.',
  value: 0.2,
  min: 0.001,
  max: 0.25,
  step: 0.001
}, {
  key: 'separation_friend',
  info: 'Separation from Friend',
  value: 0.08,
  min: 0.005,
  max: 10,
  step: 0.005
}, {
  key: 'separation_enemy',
  info: 'Separation from Enemy Bomber',
  value: 0.05,
  min: 0.005,
  max: 0.2,
  step: 0.005
}, {
  key: 'avoidance_enemy',
  info: 'Avoidance from Enemy Fighter',
  value: 0.07,
  min: 0.01,
  max: 1,
  step: 0.05
}];


Actors.Bomber.prototype.update = function(delta) {

  if(this.attrs.dead){
    return;
  }

  this.attrs.ttl --;

  if(this.attrs.ttl < 0){
    if (this.refs.base) {
      this.refs.base.attrs.bombers_launched --;
    }
    this.attrs.dead = true;
  }

  // reset laser
  this.attrs.laser = null;

  // charge laser
  if(this.attrs.laser_power < this.attrs.laser_max){
    this.attrs.laser_power ++;
  }

  if(this.attrs.hp < this.attrs.hp_max){
    this.attrs.hp = this.attrs.hp + 0.01 * delta;
  }

  // reset damage
  this.attrs.hit = false;

  if(!this.refs.target || this.refs.target.dead){
    this.refs.target = this.selectTarget();
  }

  // distance to target
  var range = this.pos.rangeXY(this.refs.target.pos);
  
  if(range > this.attrs.attack_range && this.pos.z < this.attrs.max_z){
    this.pos.z += this.attrs.vel_z;
    this.attrs.vel_z += this.attrs.vel_z_speed;
    if(this.attrs.vel_z > this.attrs.vel_z_max){
      this.attrs.vel_z = this.attrs.vel_z_max;
    }
  }

  if(range < this.attrs.attack_range && this.pos.z > this.attrs.attack_z){
    this.pos.z += this.attrs.vel_z;
    this.attrs.vel_z -= this.attrs.vel_z_speed;
    if(this.attrs.vel_z < -this.attrs.vel_z_max){
      this.attrs.vel_z = -this.attrs.vel_z_max;
    }
  }

  var goal;
  if(this.refs.target){
  // fly to target
    goal = this.refs.target.pos.minus(this.pos).normalize();
  } else if (this.refs.base) {
    // return to base
    goal = this.refs.base.pos.minus(this.pos).normalize();
  }

  // flock away from comrades
  var separation = this.separation();

  // run from fighters
  var avoidance = this.avoid();

  // want to be facing this vector
  var vector = new Vec3();

  if(goal){
    vector.add(goal.scale(0.5));
  }

  vector.add(separation);
  vector.add(avoidance);

  vector.scale(this.attrs.speed);
  this.velo.add(vector);
  this.velo.limit(this.attrs.speed);
  this.pos.add(this.velo);

  this.destroyTarget();

};


Actors.Bomber.prototype.selectTarget = function(){

  var i, ii;
  var targets;

  targets = [];

  if(targets.length === 0){
    for(i = 0, ii=this.refs.scene.factories.length; i<ii; i++){
      if(this.refs.scene.factories[i].refs.capital !== this.refs.capital){
        targets.push(this.refs.scene.factories[i]);
      }
    }
  }

  if(targets.length === 0){
    for(i = 0, ii=this.refs.scene.cities.length; i<ii; i++){
      if(this.refs.scene.cities[i].refs.capital !== this.refs.capital){
        targets.push(this.refs.scene.cities[i]);
      }
    }
  }

  if(targets.length === 0){
    for(i = 0, ii=this.refs.scene.bases.length; i<ii; i++){
      if(this.refs.scene.bases[i].refs.capital !== this.refs.capital){
        targets.push(this.refs.scene.bases[i]);
      }
    }
  }

  // only attack capital if nothing else left
  if(targets.length === 0){
    for(i = 0, ii=this.refs.scene.refs.capitals.length; i<ii; i++){
      if(this.refs.scene.refs.capitals[i] !== this.refs.capital){
        targets.push(this.refs.scene.refs.capitals[i]);
      }
    }
  }

  if(targets.length === 0){
    return null;
  }

  return pickOne(targets);

};

Actors.Bomber.prototype.destroyTarget = function(){

  // hit target?
  var range = this.pos.range(this.refs.target.pos);

  if(range < this.attrs.killrange){
    this.attrs.dead = true;
    if(typeof this.refs.target.destroy === 'function'){
      this.refs.target.destroy();
    } else {
      this.refs.target.attrs.dead = true;
    }

    if(this.refs.base) {
      this.refs.base.attrs.bombers_launched --;
    }

    if(this.refs.target.refs.capital){
      this.refs.target.refs.capital.assetDestroyed();
    }

    this.env.flash = 2;

    this.refs.scene.booms.push(new Actors.Boom(
      this.env, {
        scene: this.refs.scene
      }, {
        style: 'zoom',
        crater: true,
        radius: 45,
        x: this.refs.target.pos.x,
        y: this.refs.target.pos.y,
        color: '#f0f'
      }));
  }

};


Actors.Bomber.prototype.separation = function(){

  var i, ii;
  var separation = new Vec3();
  var dist, distX;
  var other;
  var count = 0;

  for(i=0, ii=this.refs.scene.bombers.length; i<ii; i++){
    other = this.refs.scene.bombers[i];
    if(other === this){
      continue;
    }

    distX = this.pos.rangeX(other.pos);
    if(distX > this.attrs.avoidance_enemy){
      continue;
    }
    dist = this.pos.rangeXY(other.pos);
    if(dist === 0){
      continue;
    }

    if(other.capital === this.refs.capital){
      if (dist > this.attrs.separation_friend){
        continue;
      }
      separation.add(this.pos.minusXY(other.pos).normalize().scale(this.attrs.separation_friend/dist).scale(0.25));
    } else {
      if (dist > this.attrs.separation_enemy){
        continue;
      }
      separation.add(this.pos.minusXY(other.pos).normalize().scale(this.attrs.separation_enemy/dist).scale(0.25));
    }
    count ++;
  }

  if(count === 0){
    return new Vec3();
  }
  return separation.div(count);

};

// avoid enemy fighters
Actors.Bomber.prototype.avoid = function(){

  var i, ii;
  var target, other;
  var dist;
  var avoid_range = Infinity;
  var count = 0;
  var laser_range = this.attrs.laser_range + 1;

  var avoidance = new Vec3();

  for(i=0, ii=this.refs.scene.fighters.length; i<ii; i++){
    other = this.refs.scene.fighters[i];

    if(other.refs.capital === this.refs.capital){
      continue;
    }

    dist = this.pos.range(other.pos);

    if(dist < this.attrs.laser_range){
      laser_range = dist;
      target = other;
    }

    if(dist > this.attrs.avoidance_enemy){
      continue;
    }

    if(dist < avoid_range){
      avoid_range = dist;
    }

    avoidance.add(this.pos.minusXY(other.pos).normalize().scale(this.attrs.avoidance_enemy/dist).scale(0.25));
    count ++;
  }

  if(target){
    this.shoot(target);
  }

  if(count === 0){
    return new Vec3();
  }

  return avoidance.div(count);

};

Actors.Bomber.prototype.shoot = function(target){

  if(this.attrs.laser_power <= 0){
    return;
  }

  this.attrs.laser_power -= 1;

  this.attrs.laser = new Vec3().copy(target.pos);
  target.damage(this.attrs.laser_damage);

};


Actors.Bomber.prototype.damage = function(hp){

  if(!hp){
    hp = 1;
  }

  this.attrs.hp -= hp;
  this.attrs.hit = true;

  if(this.attrs.hp > 0){
    return;
  }

  if(this.attrs.dead){
    return;
  }

  if(this.refs.base) {
    this.refs.base.attrs.bombers_launched --;
  }
  this.attrs.dead = true;

  this.refs.scene.booms.push(new Actors.Boom(
    this.env, {
      scene: this.refs.scene
    }, {
      radius: 20,
      ttl: 35,
      style: '',
      x: this.pos.x,
      y: this.pos.y,
      z: this.pos.z,
      color: hex2rgb(this.attrs.color)
    }));
};


Actors.Bomber.prototype.paint = function(view) {

  // show vector to target
  if(this.opts.show_vectors){
    view.ctx.beginPath();
    view.ctx.strokeStyle= 'rgba(255,255,255,0.25)';
    view.ctx.moveTo(this.pos.x, this.pos.y);
    view.ctx.lineTo(this.refs.target.pos.x, this.refs.target.pos.y);
    view.ctx.stroke();
  }

  if(this.attrs.laser){
    view.ctx.beginPath();
    view.ctx.lineWidth = 1;
    view.ctx.strokeStyle=this.attrs.color;
    view.ctx.moveTo(this.pos.x, this.pos.y);
    view.ctx.lineTo(this.attrs.laser.x, this.attrs.laser.y);
    view.ctx.stroke();
  }

  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);
  view.ctx.rotate(this.velo.angleXY());

  if(this.opts.show_flocking){
    view.ctx.beginPath();
    view.ctx.arc(0, 0, this.attrs.separation_friend, 0, 2*Math.PI);
    view.ctx.strokeStyle = '#040';
    view.ctx.stroke();

    view.ctx.beginPath();
    view.ctx.arc(0, 0, this.attrs.separation_enemy, 0, 2*Math.PI);
    view.ctx.strokeStyle = '#330';
    view.ctx.stroke();

    view.ctx.beginPath();
    view.ctx.arc(0, 0, this.attrs.avoidance_enemy, 0, 2*Math.PI);
    view.ctx.strokeStyle = '#400';
    view.ctx.stroke();
  }

  if(this.attrs.hit){
    view.ctx.fillStyle = '#f00';
    view.ctx.strokeStyle = '#f00';
  } else {
    view.ctx.fillStyle = this.attrs.color;
    view.ctx.strokeStyle = this.attrs.color;
  }

  var z = 2 + 12 * (this.pos.z / this.refs.scene.opts.max_z);

  view.ctx.lineWidth = 1;
  view.ctx.beginPath();
  view.ctx.moveTo(z, 0);
  view.ctx.lineTo(-z, -z);
  view.ctx.lineTo(-z/2, 0);
  view.ctx.lineTo(-z, z);
  view.ctx.lineTo(z, 0);
  view.ctx.closePath();
  view.ctx.fill();

  // view.ctx.fillStyle = this.attrs.color;
  // view.ctx.font = '9pt monospace';
  // view.ctx.textBaseline = 'middle';
  // view.ctx.textAlign = 'right';
  // view.ctx.fillText(Math.floor(this.attrs.laser_power), -z*2, 0);

  view.ctx.restore();

};

Actors.Bomber.prototype.elevation = function(view) {

  var scale = 1;

  // show vector to target
  if(this.opts.show_vectors){
    view.ctx.beginPath();
    view.ctx.strokeStyle= 'rgba(255,255,255,0.25)';
    view.ctx.moveTo(this.pos.x, (this.refs.scene.opts.max_z - this.pos.z) * scale);
    view.ctx.lineTo(this.refs.target.pos.x, (this.refs.scene.opts.max_z - this.refs.target.pos.z) * scale);
    view.ctx.stroke();
  }

  view.ctx.save();
  view.ctx.translate(this.pos.x, (this.refs.scene.opts.max_z - this.pos.z) * scale);

  view.ctx.fillStyle = this.attrs.color;
  view.ctx.beginPath();
  view.ctx.fillRect(-2, -2, 4, 4);

  view.ctx.restore();


  if(this.attrs.laser){
    view.ctx.beginPath();
    view.ctx.lineWidth = 1;
    view.ctx.strokeStyle=this.attrs.color;
    view.ctx.moveTo(this.pos.x, (this.refs.scene.opts.max_z - this.pos.z) * scale);
    view.ctx.lineTo(this.attrs.laser.x, (this.refs.scene.opts.max_z - this.attrs.laser.z) * scale);
    view.ctx.stroke();
  }

};
