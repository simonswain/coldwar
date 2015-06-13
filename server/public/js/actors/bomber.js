/*global Vec3:true, Boom:true, pickOne:true, hex2rgb */
/*jshint browser:true */
/*jshint strict:false */

function Bomber(opts){

  this.ttl = opts.ttl || 10000;
  this.color = opts.color;

  this.world = opts.world;
  this.show_vectors = this.world.show_vectors;

  this.base = opts.base;
  this.capital = opts.capital;
  this.target = opts.target || null; 

  //this.speed = 0.6 + (0.35 * Math.random());
  this.speed = this.world.unit_speed * (0.3 + (Math.random() * 0.5));

  this.pos = new Vec3(opts.x, opts.y, 0);
  this.velo = new Vec3(Math.random() * this.speed, Math.random() * this.speed);

  this.max_z = Math.floor((this.world.max_z * 0.3) + ((this.world.max_z * 0.2) * Math.random()));
  this.attack_z = 10;
  this.vel_z = 0.5;

  this.separation_friend = this.world.max * 0.025;
  this.separation_enemy = this.world.max * 0.2;
  this.avoidance_enemy = this.world.max * 0.25;

  this.hp = Math.floor(50 + (20*Math.random()));
  this.hp_max = this.hp;

  this.laser = null;
  this.laser_range = this.world.max * 0.1;
  this.laser_max = Math.floor(30 + (10*Math.random()));
  this.laser_power = 0; // current laser charge 
  this.laser_damage = 2;

  // range to start descent for bombing
  this.attack_range = this.world.max * 0.1;

  // range where bombing works
  this.killrange = 12;

  this.dead = false;

}

Bomber.prototype.update = function(delta){

  this.ttl --;

  if(this.ttl < 0){
    if (this.base) {
      this.base.bombers_launched --;
    }
    this.dead = true;
  }

  // reset laser
  this.laser = null;

  // charge laser
  if(this.laser_power < this.laser_max){
    this.laser_power ++;
  }

  if(this.hp < this.hp_max){
    this.hp = this.hp + 0.01 * delta;
  }

  // reset damage
  this.hit = false;

  if(!this.target || this.target.dead){
    this.selectTarget();
  }

  // distance to target
  var range = this.pos.rangeXY(this.target.pos);

  if(range > this.attack_range && this.pos.z < this.max_z){
    this.pos.z += this.vel_z;
  }

  if(range < this.attack_range && this.pos.z > this.attack_z){
    this.pos.z -= this.vel_z;
  }

  var goal;
  if(this.target){
  // fly to target
    goal = this.target.pos.minus(this.pos).normalize();
  } else if (this.base) {
    // return to base
    goal = this.base.pos.minus(this.pos).normalize();
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

  vector.scale(this.speed);
  this.velo.add(vector);
  this.velo.limit(this.speed);
  this.pos.add(this.velo);

  this.destroyTarget();

};

Bomber.prototype.selectTarget = function(){

  var i, ii;
  var targets;

  targets = [];

  if(targets.length === 0){
    for(i = 0, ii=this.world.factories.length; i<ii; i++){
      if(this.world.factories[i].capital !== this.capital){
        targets.push(this.world.factories[i]);
      }
    }
  }

  if(targets.length === 0){
    for(i = 0, ii=this.world.cities.length; i<ii; i++){
      if(this.world.cities[i].capital !== this.capital){
        targets.push(this.world.cities[i]);
      }
    }
  }

  if(targets.length === 0){
    for(i = 0, ii=this.world.bases.length; i<ii; i++){
      if(this.world.bases[i].capital !== this.capital){
        targets.push(this.world.bases[i]);
      }
    }
  }

  // only attack capital if nothing else left
  if(targets.length === 0){
    for(i = 0, ii=this.world.capitals.length; i<ii; i++){
      if(this.world.capitals[i] !== this.capital){
        targets.push(this.world.capitals[i]);
      }
    }
  }

  if(targets.length === 0){
    return;
  }

  this.target = pickOne(targets);

};

Bomber.prototype.destroyTarget = function(){

  // hit target?
  var range = this.pos.range(this.target.pos);

  if(range < this.killrange){
    this.dead = true;
    if(typeof this.target.destroy === 'function'){
      this.target.destroy();
    } else {
      this.target.dead = true;
    }

    if(this.base) {
      this.base.bombers_launched --;
    }

    if(this.target.capital){
      this.target.capital.assetDestroyed();
    }

    this.world.flash = 2;
    this.world.booms.push(new Boom({
      world: this.world,
      style: 'zoom',
      crater: true,
      radius: 35,
      x: this.target.pos.x,
      y: this.target.pos.y,
      color: hex2rgb('#f0f')
    }));
  }

};


Bomber.prototype.separation = function(){

  var i, ii;
  var separation = new Vec3();
  var dist, distX;
  var other;
  var count = 0;

  for(i=0, ii=this.world.bombers.length; i<ii; i++){
    other = this.world.bombers[i];
    if(other === this){
      continue;
    }

    distX = this.pos.rangeX(other.pos);
    if(distX > this.avoidance_enemy){
      continue;
    }

    dist = this.pos.rangeXY(other.pos);
    if(dist === 0){
      continue;
    }
    
    if(other.capital === this.capital){
      if (dist > this.separation_friend){
        continue;
      }
      separation.add(this.pos.minusXY(other.pos).normalize().scale(this.separation_friend/dist).scale(0.25));
    } else {
      if (dist > this.separation_enemy){
        continue;
      }
      separation.add(this.pos.minusXY(other.pos).normalize().scale(this.separation_enemy/dist).scale(0.25));
    }
    count ++;
  }

  if(count === 0){
    return new Vec3();
  }
  return separation.div(count);
  //return separation.normalize();

};

// avoid enemy fighters
Bomber.prototype.avoid = function(){

  var i, ii;
  var target, other;
  var dist;
  var avoid_range = Infinity;
  var count = 0;
  var laser_range = this.laser_range + 1;

  var avoidance = new Vec3();
  
  for(i=0, ii=this.world.fighters.length; i<ii; i++){
    other = this.world.fighters[i];

    if(other.capital === this.capital){
      continue;
    }

    dist = this.pos.range(other.pos);

    if(dist < this.laser_range){
      laser_range = dist;
      target = other;
    }

    if(dist > this.avoidance_distance){
      continue;
    }

    if(dist < avoid_range){
      avoid_range = dist;
    }

    avoidance.add(this.pos.minusXY(other.pos).normalize().scale(this.avoidance_enemy/dist).scale(0.25));
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

Bomber.prototype.shoot = function(target){

  if(this.laser_power <= 0){
    return;
  }

  this.laser_power -= 1;

  this.laser = new Vec3().copy(target.pos);
  target.damage(this.laser_damage);

};


Bomber.prototype.damage = function(hp){

  if(!hp){
    hp = 1;
  }

  this.hp -= hp;
  this.hit = true;

  if(this.hp > 0){
    return;
  }

  if(this.dead){
    return;
  }

  if(this.base) {
    this.base.bombers_launched --;
  }
  this.dead = true;
  this.world.booms.push(new Boom({
    world: this.world,
    radius: 20,
    ttl: 35,
    style: '',
    x: this.pos.x,
    y: this.pos.y,
    z: this.pos.z,
    color: hex2rgb(this.color)
  }));

};

Bomber.prototype.paint = function(view){

  // show vector to target
  if(this.world.show_vectors){
    view.ctx.beginPath();
    view.ctx.strokeStyle= 'rgba(255,255,255,0.25)';
    view.ctx.moveTo(this.pos.x, this.pos.y);
    view.ctx.lineTo(this.target.pos.x, this.target.pos.y);
    view.ctx.stroke();
  }

  if(this.laser){
    view.ctx.beginPath();
    view.ctx.lineWidth = 2;
    view.ctx.strokeStyle= '#f00';
    view.ctx.moveTo(this.pos.x, this.pos.y);
    view.ctx.lineTo(this.laser.x, this.laser.y);
    view.ctx.stroke();
  }

  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);
  view.ctx.rotate(this.velo.angleXY());

  if(this.hit){
    view.ctx.fillStyle = '#f00';
    view.ctx.strokeStyle = '#f00';   
  } else {
    view.ctx.fillStyle = this.color;
    view.ctx.strokeStyle = this.color;
  }

  var z = 8;
  view.ctx.lineWidth = 1;
  view.ctx.beginPath();
  view.ctx.moveTo(z, 0);
  view.ctx.lineTo(-z, -z);
  view.ctx.lineTo(-z/2, 0);
  view.ctx.lineTo(-z, z);
  view.ctx.lineTo(z, 0);
  view.ctx.closePath();     
  view.ctx.fill();

  // view.ctx.fillStyle = this.color;
  // view.ctx.font = '9pt monospace';
  // view.ctx.textBaseline = 'middle';
  // view.ctx.textAlign = 'right';
  // view.ctx.fillText(Math.floor(this.laser_power), -z*2, 0);

  view.ctx.restore();

};


Bomber.prototype.elevation = function(view){

  var scale = view.yscale;

  // show vector to target
  if(this.world.show_vectors){
    view.ctx.beginPath();
    view.ctx.strokeStyle= 'rgba(255,255,255,0.25)';
    view.ctx.moveTo(this.pos.x, (this.world.max_z - this.pos.z) * scale);
    view.ctx.lineTo(this.target.pos.x, (this.world.max_z - this.target.pos.z) * scale);
    view.ctx.stroke();
  }

  view.ctx.save();  
  view.ctx.translate(this.pos.x, (this.world.max_z - this.pos.z) * scale);

  view.ctx.fillStyle = this.color;
  view.ctx.beginPath();
  view.ctx.fillRect(-2, -2, 4, 4);

  view.ctx.restore();


  if(this.laser){
    view.ctx.beginPath();
    view.ctx.lineWidth = 1;
    view.ctx.strokeStyle= '#f00';
    view.ctx.moveTo(this.pos.x, (this.world.max_z - this.pos.z) * scale);
    view.ctx.lineTo(this.laser.x, (this.world.max_z - this.laser.z) * scale);
    view.ctx.stroke();
  }

};
