/*global Vec3:true, Boom:true, pickOne:true */
/*jshint browser:true */
/*jshint strict:false */

function Interceptor(opts){

  // taget will be a Bomb
  this.target = opts.target; 

  this.silo = opts.silo;
  this.bombs = opts.bombs;
  this.booms = opts.booms;

  this.pos = new Vec3(
    opts.x,
    opts.y
  ); 

  this.velo = new Vec3(); 
  this.sensitivity = 48;

  this.ttl = 100;
  this.gravity = new Vec3(0, 0.1);

  this.speed = 0.2 + (Math.random() * 0.1);

  this.dead = false;

}

Interceptor.prototype.update = function(delta){

  this.ttl --;

  if(this.ttl < 0){
    this.silo.launched --;
    this.dead = true;
    this.booms.push(new Boom({
      radius: 10,
      ttl: 30,
      style: '',
      x: this.pos.x,
      y: this.pos.y,
      color: '0,255,255'
    }));
  }

  // target died? pick another
  var bomb;
  if(!this.target || this.target.dead){
    bomb = pickOne(this.bombs);
    if(bomb){
      this.target = bomb;
    }

  }

  // 
  
  var accel = this.target.pos.minus(this.pos).normalize().scale(this.speed);
  this.velo.add(accel);
  this.pos.add(this.velo);
  this.velo.add(this.gravity);

  // hit target?
  var range = this.pos.range(this.target.pos);

  if(range < this.sensitivity){
    this.dead = true;
    this.target.dead = true;
    this.silo.launched --;
    this.booms.push(new Boom({
      style: '',
      radius: 25,
      x: this.pos.x,
      y: this.pos.y,
      color: '255,255,0'
    }));
  }

};

Interceptor.prototype.paint = function(view){
  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);
  view.ctx.rotate(this.velo.angleXY());
  view.ctx.fillStyle= '#0cc';
  view.ctx.beginPath();
  // draw the object horizontally!
  view.ctx.rect(-12, -2, 16, 2);
  view.ctx.fill();

  view.ctx.restore();
};
