/*global Vec3:true, Boom:true, pickOne:true, hex2rgb */
/*jshint browser:true */
/*jshint strict:false */

function Fighter(opts){

  this.dead = false;

  this.color = opts.color;
  this.ttl = opts.ttl || 10000;

  this.world = opts.world;
  this.base = opts.base;
  this.capital = opts.capital;

  this.show_vectors = this.world.show_vectors;

  this.speed = 1.5 + (0.5 * Math.random());
  this.speed = this.world.unit_speed * (0.7 + (Math.random() * 0.5));

  this.pos = new Vec3(opts.x, opts.y, 0);
  this.velo = new Vec3(Math.random() * this.speed, Math.random() * this.speed);

  this.max_z = Math.floor((this.world.max_z * 0.3) + ((this.world.max_z * 0.1) * Math.random()));
  this.vel_z = 1;

  // range where chasing enemies takes effect
  this.attack_range = this.world.max * 0.4;


  this.separation_friend = this.world.max * 0.2;
  this.separation_enemy = this.world.max * 0.1;

  this.hp = Math.floor(10 + (10*Math.random()));

  this.laser = null; // null or Vec3
  this.laser_range = this.world.max * 0.085;
  this.laser_max = Math.floor(10 + (5*Math.random()));
  this.laser_power = 0; // current laser charge

  this.mode = 'station'; // station, return, refuel

  this.station = new Vec3().copy(this.base.pos);
  this.station.x = (this.world.max_x / 2);
  this.station.z = this.max_z;

  if(this.base.pos.x < this.world.max_x/2){
    this.station.x -= (this.world.max_x / 2) * 0.1;
  } else {
    this.station.x += (this.world.max_x / 2) * 0.1;
  }

}

Fighter.prototype.update = function(delta){

  this.ttl --;

  // out of gas
  if(this.ttl < 0){
    this.base.fighters_launched --;
    this.dead = true;
  }

  // reset laser
  this.laser = null;

  // charge laser
  if(this.laser_power < this.laser_max){
    this.laser_power ++;
  }

  // reset damage, count down because bombers shoot fighters and the
  // hit needs to stay for an extra update

  if(this.hit){
    this.hit --;
    if(this.hit === 0){
      this.hit = false;
    }
  }

  if(this.capital.defcon > 3){
    this.mode = 'station';
  } else {
    this.mode = 'attack';
  }

  // altitude
  if(this.mode === 'station'){
    if(this.pos.z < this.max_z){
      this.pos.z += this.vel_z;
    }
  }

  if(this.mode === 'attack'){
    if(this.pos.z < this.max_z){
      this.pos.z += this.vel_z;
    }
  }

  // if(this.mode === 'return'){
  //   if(this.pos.z > 0){
  //     this.pos.z -= this.vel_z;
  //   }
  // }

  // chase closest enemy bomber, or fly to station
  var goal = this.chase();

  // flock away from comrades
  var separation = this.separation();
  // proportion and average all vectors

  // acceleration vector
  var vector = new Vec3();
  vector.add(goal.scale(0.5));
  vector.add(separation);

  vector.scale(this.speed);
  this.velo.add(vector);
  this.velo.limit(this.speed);
  this.pos.add(this.velo);

};

// find closest enemy aircraft and attack it. If no enemy in range,
// then fly towards station point
Fighter.prototype.chase = function(){

  var i, ii;
  var target, other;
  var dist, dist2, distX;
  var vector;
  var range = this.attack_range;
  var range2 = this.attack_range * this.attack_range * this.attack_range;

  // work through bombers then fighters to find closest enemy

  // first look for enemy bombers in capital's side of the screen

  // next find any bomber in attack range

  // acquire a laser target if one is close enough

  for(i = 0, ii=this.world.bombers.length; i<ii; i++){
    other = this.world.bombers[i];
    if(other.capital === this.capital){
      continue;
    }
    distX = this.pos.rangeX(other.pos);
    if(distX > this.attack_range){
      continue;
    }
    dist = this.pos.range(other.pos);
    if(dist < range){
      target = other;
      range = dist;
    }
  }


  // if no bombers to target, then go for a fighter

  // if no laser target, use this loop to find any fighter close
  // enough and shoot at it

  if(!target){
    for(i = 0, ii=this.world.fighters.length; i<ii; i++){
      other = this.world.fighters[i];
      if(other.capital === this.capital){
        continue;
      }
      if(this.pos.rangeX(other.pos) > this.attack_range){
        continue;
      }
      dist2 = this.pos.range2(other.pos);
      if(dist2 < range2){
        target = other;
        range2 = dist2;
      }
    }
  }

  if(!target){
    return this.station.minus(this.pos).normalize();
  }


  if(this.pos.range(target.pos) < this.laser_range){
    this.shoot(target);
  }

  // just used to separation doesn't try to move away from target
  this.target = target;

  return target.pos.minus(this.pos).normalize();

};

Fighter.prototype.separation = function(){

  var i, ii;
  var separation = new Vec3();
  var dist, distX;
  var other;
  var count = 0;

  for(i=0, ii=this.world.fighters.length; i<ii; i++){
    other = this.world.fighters[i];

    if(other === this){
      continue;
    }

    if(other === this.target){
      continue;
    }

    distX = this.pos.rangeX(other.pos);
    if(distX > this.separation_enemy){
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

  for(i=0, ii=this.world.bombers.length; i<ii; i++){
    other = this.world.bombers[i];
    if(other === this){
      continue;
    }

    distX = this.pos.rangeX(other.pos);
    if(distX > this.separation_enemy){
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

  // if no target, maintain separation from station
  if(!this.target){
    dist = this.pos.rangeXY(this.station);
    if (dist < this.separation_friend){
      separation.add(this.pos.minusXY(this.station).normalize().scale(this.separation_friend/dist).scale(0.25));
    }
    count ++;
  }


  if(count === 0){
    return new Vec3();
  }
  return separation.div(count);
  //return separation.normalize();

};

Fighter.prototype.shoot = function(target){

  if(this.laser_power <= 0){
    return;
  }

  this.laser_power -= 2;

  this.laser = new Vec3().copy(target.pos);
  target.damage();

};

Fighter.prototype.damage = function(hp){

  if(!hp){
    hp = 1;
  }

  this.hp -= hp;
  this.hit = 2;

  if(this.hp > 0){
    return;
  }

  if(this.dead){
    return;
  }

  this.base.fighters_launched --;
  this.dead = true;
  this.world.booms.push(new Boom({
    world: this.world,
    radius: 15,
    ttl: 25,
    style: '',
    x: this.pos.x,
    y: this.pos.y,
    z: this.pos.z,
    color: hex2rgb(this.color)
  }));

};


Fighter.prototype.paint = function(view){

  // show vector to target
  if(this.world.show_vectors){
    if(this.target){
      view.ctx.beginPath();
      view.ctx.strokeStyle= 'rgba(255,255,255,0.25)';
      view.ctx.moveTo(this.pos.x, this.pos.y);
      view.ctx.lineTo(this.target.pos.x, this.target.pos.y);
      view.ctx.stroke();
    }
  }

  if(this.laser){
    view.ctx.beginPath();
    view.ctx.lineWidth = 1;
    view.ctx.strokeStyle= '#0f0';
    view.ctx.moveTo(this.pos.x, this.pos.y);
    view.ctx.lineTo(this.laser.x, this.laser.y);
    view.ctx.stroke();
  }

  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);
  view.ctx.rotate(this.velo.angleXY());

  if(this.hit){
    view.ctx.strokeStyle = '#f00';
  } else {
    view.ctx.strokeStyle = this.color;
  }

  var z = 4;

  view.ctx.lineWidth = 2;

  view.ctx.beginPath();
  view.ctx.moveTo(-z, -z);
  view.ctx.lineTo(0, 0);
  view.ctx.lineTo(-z, z);
  view.ctx.stroke();

  view.ctx.beginPath();
  view.ctx.lineTo(0, 0);
  view.ctx.lineTo(z, 0);
  view.ctx.stroke();

  view.ctx.restore();

};


Fighter.prototype.elevation = function(view){

  var scale = view.yscale;

  // show vector to target
  if(this.world.show_vectors){
    if(this.target){
      view.ctx.beginPath();
      view.ctx.strokeStyle= 'rgba(255,255,255,0.25)';
      view.ctx.moveTo(this.pos.x, (this.world.max_z - this.pos.z) * scale);
      view.ctx.lineTo(this.target.pos.x, (this.world.max_z - this.target.pos.z) * scale);
      view.ctx.stroke();
    }
  }

  view.ctx.save();
  view.ctx.translate(this.pos.x, (this.world.max_z - this.pos.z) * scale);

  view.ctx.fillStyle = this.color;
  view.ctx.beginPath();
  view.ctx.fillRect(-1, -1, 2, 2);

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
