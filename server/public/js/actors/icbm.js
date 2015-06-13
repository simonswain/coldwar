/*global Vec3:true, VecR, Boom:true, pickOne:true, hex2rgb */
/*jshint browser:true */
/*jshint strict:false */

function Icbm(opts){

  this.target = opts.target;

  this.color = opts.color;

  this.world = opts.world;
  this.base = opts.base;
  this.capital = opts.capital;

  this.pos = new Vec3(
    opts.x,
    opts.y,
    opts.z
  );

  this.distance = this.pos.range(this.target.pos);
  this.velo = new Vec3();
  this.killrange = 8;

  this.ttl = 1500;

  this.speed = this.world.unit_speed * (0.005 + (Math.random() * 0.005));

  this.direction = (this.base.pos.x > this.world.max_x/2) ? -1 : 1;
  this.phase = 0;
  this.phasec = 0;

  this.trail = [];
  this.tickCount = 0;

  this.dead = false;

}

Icbm.prototype.update = function(delta){

  this.ttl --;

  if(this.ttl < 0){
    this.base.icbms_launched --;
    this.dead = true;
    this.world.booms.push(new Boom({
      world: this.world,
      radius: 10,
      ttl: 30,
      style: '',
      x: this.pos.x,
      y: this.pos.y - this.pos.z,
      color: hex2rgb(this.color, 8)
    }));
  }

  var accel = this.target.pos.minus(this.pos).normalize().scale(this.speed);

  this.velo.add(accel);
  this.pos.add(this.velo);

  // trail
  if(this.tickCount === 0){
    this.trail.push([this.pos.x, this.pos.y, this.pos.z]);
    this.tickCount = 20;
  }
  this.tickCount --;

  // how far from target?
  this.range = this.pos.rangeXY(this.target.pos);

  if(this.range < this.killrange){

    this.dead = true;
    this.base.icbms_launched --;

    if(this.target.dead){
      this.world.booms.push(new Boom({
        world: this.world,
        style: '',
        radius: 25,
        x: this.pos.x,
        y: this.pos.y - this.pos.z,
        color: hex2rgb(this.color)
      }));
    } else {
      if(this.target.capital){
        this.target.capital.assetDestroyed();
      }

      if(typeof this.target.destroy === 'function'){
        this.target.destroy();
      } else {
        this.target.dead = true;
      }

      this.world.flash = 2;
      this.world.booms.push(new Boom({
        world: this.world,
        style: 'zoom',
        crater: true,
        radius: 40,
        ttl: 100,
        x: this.target.pos.x,
        y: this.target.pos.y,
        z: this.target.pos.z,
        color: hex2rgb('#f0f')
      }));

      this.world.booms.push(new Boom({
        world: this.world,
        style: '',
        radius: 60,
        ttl: 20,
        x: this.pos.x,
        y: this.pos.y,
        z: this.pos.z,
        color: hex2rgb('#fff')
      }));

    }
  }

  // angle of missile
  if(this.distance > 0){
    this.phase = Math.sin((this.range / this.distance) * Math.PI);
    this.phasec = Math.cos((this.range / this.distance) * Math.PI);
  }

  // apparant altitude
  this.pos.z = this.phase * this.world.max_z * 0.8;

};

Icbm.prototype.destroy = function(){

  if(!this.dead){
    this.base.icbms_launched --;
    this.world.booms.push(new Boom({
      //fake3d: true,
      world: this.world,
      style: '',
      radius: 25,
      x: this.pos.x,
      y: this.pos.y,
      z: this.pos.z,
      color: hex2rgb(this.color)
    }));
  }

  this.dead = true;

};

Icbm.prototype.paint = function(view){

  // line to ground
  // view.ctx.beginPath();
  // view.ctx.strokeStyle= '#666';
  // view.ctx.moveTo(this.pos.x, this.pos.y);
  // view.ctx.lineTo(this.pos.x, this.pos.y - this.pos.z);
  // view.ctx.stroke();

  // trail
  var i, ii, point;

  if(this.trail.length > 0){
    view.ctx.lineWidth = 1;
    view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    view.ctx.beginPath();
    view.ctx.moveTo(this.trail[0][0], this.trail[0][1]);
    for(i=0, ii=this.trail.length; i<ii; i++){
      point = this.trail[i];
      view.ctx.lineTo(point[0], point[1]);
    }
    view.ctx.lineTo(this.pos.x, this.pos.y);
    view.ctx.stroke();
  }

  // flight object
  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);
  //view.ctx.rotate(this.direction * (this.phasec + (Math.PI)));
  view.ctx.rotate(Math.PI);

  view.ctx.fillStyle = this.color;

  var z = 4;
  view.ctx.beginPath();
  view.ctx.moveTo(-this.direction * 2 * z, 0);
  view.ctx.lineTo(-this.direction * -z, -z);
  view.ctx.lineTo(-this.direction * -z, z);
  view.ctx.lineTo(-this.direction * 2 * z, 0);
  view.ctx.closePath();
  view.ctx.fill();


  // if(this.trail.length > 0){
  //   view.ctx.lineWidth = 1;
  //   view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  //   view.ctx.beginPath();
  //   view.ctx.moveTo(this.trail[0][0], this.trail[0][1] - this.trail[0][2]);
  //   for(i=0, ii=this.trail.length; i<ii; i++){
  //     point = this.trail[i];
  //     view.ctx.lineTo(point[0], point[1] - point[2]);
  //   }
  //   view.ctx.lineTo(this.pos.x, this.pos.y - this.pos.z);
  //   view.ctx.stroke();
  // }

  // // flight object
  // view.ctx.save();
  // view.ctx.translate(this.pos.x, this.pos.y - this.pos.z);
  // view.ctx.rotate(this.direction * (this.phasec + (Math.PI)));

  // view.ctx.fillStyle = this.color;

  // var z = 2;
  // view.ctx.beginPath();
  // view.ctx.moveTo(-this.direction * 2 * z, 0);
  // view.ctx.lineTo(-this.direction * -z, -z);
  // view.ctx.lineTo(-this.direction * -z, z);
  // view.ctx.lineTo(-this.direction * 2 * z, 0);
  // view.ctx.closePath();
  // view.ctx.fill();

  //

  // shadow
  // view.ctx.save();
  // view.ctx.translate(this.pos.x, this.pos.y);
  // view.ctx.rotate(this.velo.angleXY());
  // view.ctx.fillStyle = this.color;
  // view.ctx.beginPath();
  // view.ctx.fillRect(-1, -1, 2, 2);
  // view.ctx.restore();


  view.ctx.restore();
};


Icbm.prototype.elevation = function(view){

  var scale = view.yscale;

  // trail
  var i, ii, point;
  if(this.trail.length > 0){
    view.ctx.lineWidth = 1;
    view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    view.ctx.beginPath();
    view.ctx.moveTo(this.trail[0][0], (this.world.max_z - (this.trail[0][2]*2)) * scale);
    for(i=0, ii=this.trail.length; i<ii; i++){
      point = this.trail[i];
      view.ctx.lineTo(point[0], (this.world.max_z - (point[2])) * scale);
    }
    view.ctx.lineTo(this.pos.x, (this.world.max_z - (this.pos.z))*scale);
    view.ctx.stroke();
  }

  // flight object

  view.ctx.save();
  view.ctx.translate(this.pos.x, (this.world.max_z - this.pos.z) * scale);
  view.ctx.rotate(this.direction * (this.phasec + (Math.PI)));

  view.ctx.fillStyle = this.color;

  var z = 3;
  view.ctx.lineWidth = 1;
  view.ctx.beginPath();
  view.ctx.moveTo(-this.direction * 2*z, 0);
  view.ctx.lineTo(-this.direction * -z, -z);
  view.ctx.lineTo(-this.direction * -z, z);
  view.ctx.lineTo(-this.direction * 2*z, 0);
  view.ctx.closePath();
  view.ctx.fill();
  view.ctx.restore();

};

