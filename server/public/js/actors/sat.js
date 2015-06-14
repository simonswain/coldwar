/*global Vec3:true */
/*jshint browser:true */
/*jshint strict:false */

function Sat(opts){

  this.pos = new Vec3(
    opts.x,
    opts.y,
    opts.z
  ); 
  this.color = opts.color;
  this.city = opts.city;
  this.world = opts.world;
  this.capital = opts.capital;

  this.phase_x = Math.PI * Math.random(); 
  this.phase_y = Math.PI * Math.random(); 

  this.speed_x = (Math.PI * 0.0025) + (Math.PI * 0.0025 * Math.random());
  this.speed_y = (Math.PI * 0.0025) + (Math.PI * 0.0025 * Math.random());

  this.angle = Math.PI * Math.random(); 
  this.rotation = (Math.PI * 0.005) + (Math.PI * 0.005 * Math.random());

  this.laser = null;
  this.laser_range = this.world.max * 0.25;
  this.laser_max = Math.floor(30 + (10*Math.random()));
  this.laser_power = 0; // current laser charge 


  this.dead = false;

}

Sat.prototype.update = function(delta){

  this.phase_x += this.speed_x;
  this.phase_y += this.speed_y;

  this.angle += this.rotation;

  this.pos.x = (this.world.max_x * 0.5) + (this.world.max_x * 0.1 * Math.sin(this.phase_x));
  this.pos.y = (this.world.max_y * 0.5) + (this.world.max_y * 0.3 * Math.sin(this.phase_y));

  // reset laser
  this.laser = null;

  // charge laser
  if(this.laser_power < this.laser_max){
    this.laser_power ++;
  }

  this.shootLaser();

};

Sat.prototype.shootLaser = function(){

  var i, ii;
  var target, other;
  var dist, distX;
  var laser_range = this.laser_range + 1;

  for(i=0, ii=this.world.icbms.length; i<ii; i++){
   
    other = this.world.icbms[i];
    if(other.capital === this.capital){
      continue;
    }
    distX = this.pos.range(other.pos);
    if(distX > this.laser_range){
      continue;
    }
    dist = this.pos.range(other.pos);
    if(dist < this.laser_range){
      laser_range = dist;
      target = other;
    }
  }

  if(target){
    this.shoot(target);
  }

};

Sat.prototype.shoot = function(target){

  if(this.laser_power <= 0){
    return;
  }

  // so it takes time to charge up
  this.laser_power -= 5;

  this.laser = new Vec3().copy(target.pos);
  target.destroy();

};

Sat.prototype.paint = function(view){

  if(this.laser){
    view.ctx.beginPath();
    view.ctx.lineWidth = 2;
    view.ctx.strokeStyle = '#fff';
    view.ctx.moveTo(this.pos.x, this.pos.y);
    //view.ctx.lineTo(this.laser.x, this.laser.y - this.laser.z); // fake3d
    view.ctx.lineTo(this.laser.x, this.laser.y); // fake3d
    view.ctx.stroke();
  }

  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);
  view.ctx.rotate(this.angle);

  // range
  // view.ctx.beginPath();
  // view.ctx.lineWidth = 1;
  // view.ctx.arc(0, 0, this.laser_range, 0, 2*Math.PI);
  // view.ctx.strokeStyle = '#222'; 
  // view.ctx.stroke();

  view.ctx.fillStyle = '#000';
  view.ctx.fillRect(-6, -6, 12, 12);

  view.ctx.fillStyle = this.color;
  view.ctx.strokeStyle = this.color;
  view.ctx.lineWidth = 2;

  view.ctx.beginPath();
  view.ctx.moveTo(-6, -6);
  view.ctx.lineTo(6, 6);
  view.ctx.stroke();

  view.ctx.beginPath();
  view.ctx.rect(-6, -6, 12, 12);
  view.ctx.stroke();

  view.ctx.restore();
};

Sat.prototype.elevation = function(view){

  var scale = view.yscale;

  if(this.laser){
    view.ctx.beginPath();
    view.ctx.lineWidth = 1;
    view.ctx.strokeStyle= '#fff';
    view.ctx.moveTo(this.pos.x, (this.world.max_z - this.pos.z) * scale);
    view.ctx.lineTo(this.laser.x, (this.world.max_z - this.laser.z) * scale);
    view.ctx.stroke();
  }

  view.ctx.save();  
  view.ctx.translate(this.pos.x, (this.world.max_z - this.pos.z) * scale);

  // view.ctx.beginPath();
  // view.ctx.lineWidth = 1;
  // view.ctx.arc(0, 0, this.laser_range, 0, 2*Math.PI);
  // view.ctx.strokeStyle = '#222'; 
  // view.ctx.stroke();

  view.ctx.fillStyle = this.color;
  view.ctx.beginPath();
  view.ctx.fillRect(-2, -2, 4, 4);

  view.ctx.restore();

};
