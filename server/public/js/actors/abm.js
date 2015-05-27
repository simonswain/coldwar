/*global Vec3:true, Boom:true, pickOne:true, hex2rgb */
/*jshint browser:true */
/*jshint strict:false */

function Abm(opts){

  this.target = opts.target;
  this.color = opts.color;
  this.world = opts.world;
  this.base = opts.base;

  this.pos = new Vec3(
    opts.x,
    opts.y,
    opts.z
  );

  this.velo = new Vec3();
  this.sensitivity = 16;

  this.ttl = 40 + 20 * Math.random();

  this.speed = this.world.unit_speed * (0.05 + (Math.random() * 0.04));
  //this.speed = 0.04 + (Math.random() * 0.01);

  this.dead = false;

}

Abm.prototype.update = function(delta){

   this.ttl --;

  if(this.ttl < 0){
    this.base.abms_launched --;
    this.dead = true;
    this.world.booms.push(new Boom({
      //fake3d: true,
      world: this.world,
      radius: 10,
      ttl: 30,
      style: '',
      x: this.pos.x,
      y: this.pos.y,
      z: this.pos.z,
      color: hex2rgb(this.color, 8)
      //color: hex2rgb('#f0f', 8)
    }));
  }

  var accel = this.target.pos.minus(this.pos).normalize().scale(this.speed);
  this.velo.add(accel);

  //console.log(0 - (this.speed/2) + (this.speed * Math.random()));
  //this.velo.add(rand);

  this.pos.add(this.velo);

  var rand = new Vec3(
    0 - (this.speed*20) + (40*this.speed * Math.random()),
    0 - (this.speed*20) + (40*this.speed * Math.random()),
    0 - (this.speed*20) + (60*this.speed * Math.random())
  );
  this.pos.add(rand);

  // hit target?
  var range = this.pos.range(this.target.pos);

  if(range < this.sensitivity){
    this.dead = true;
    this.base.abms_launched --;
    this.target.destroy();
  }

};

Abm.prototype.paint = function(view){

  // // line to ground
  // view.ctx.beginPath();
  // view.ctx.strokeStyle= '#666';
  // view.ctx.moveTo(this.pos.x, this.pos.y);
  // view.ctx.lineTo(this.pos.x, this.pos.y - this.pos.z);
  // view.ctx.stroke();

  view.ctx.save();
  // fake 3d
  //view.ctx.translate(this.pos.x, this.pos.y - this.pos.z);
  view.ctx.translate(this.pos.x, this.pos.y);

  //view.ctx.fillStyle = '#f0f';
  view.ctx.fillStyle = this.color;
  view.ctx.beginPath();
  view.ctx.arc(0, 0, 1, 0, 2 * Math.PI);
  view.ctx.fill();


  view.ctx.restore();

};

Abm.prototype.elevation = function(view){

  var scale = view.yscale;

  // flight object
  view.ctx.save();
  view.ctx.translate(this.pos.x, (this.world.max_z - this.pos.z) * scale);
  view.ctx.rotate(-this.velo.angleXZ());

  //view.ctx.fillStyle = '#f0f';
  view.ctx.fillStyle = this.color;
  view.ctx.beginPath();
  view.ctx.arc(0, 0, 1, 0, 2 * Math.PI);
  view.ctx.fill();

  view.ctx.restore();

};

