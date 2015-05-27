/*global Vec3:true, Boom:true */
/*jshint browser:true */
/*jshint strict:false */

function Bomb(opts){

  this.booms = opts.booms;
  this.world = opts.world;

  this.pos = new Vec3(
    opts.x,
    opts.y
  );

  this.target = opts.target;

  // target was destroyed before we could aim at it
  if(!this.target){
    this.dead = true;
    return;
  }

  this.speed = 0.05 + (Math.random() * 0.05);

  // initial velo
  this.velo = this.target.pos.minus(this.pos).normalize().scale(this.speed * 5);

  this.gravity = new Vec3(0, 0.01);
  this.sensitivity = 64;

  this.dead = false;

}

Bomb.prototype.update = function(delta){

  if(!this.target){
    this.dead = true;
    return;
  }

  var accel = this.target.pos.minus(this.pos).normalize().scale(this.speed);
  this.velo.add( accel);
  this.pos.add(this.velo);
  this.velo.add(this.gravity);

  // hit target?
  var range = this.pos.range(this.target.pos);

  if(range < this.sensitivity){
    this.dead = true;
    this.booms.push(new Boom({
      style: '',
      x: this.pos.x,
      y: this.pos.y,
      color: '255,255,255'
    }));

    if(!this.target.dead){
      // ensure only boom on targe, in case another bomb has already
      // destroyed it
      this.target.dead = true;
      this.world.flash = 2;
      this.booms.push(new Boom({
        style: 'zoom',
        radius: 100,
        ttl: 120,
        x: this.target.pos.x,
        y: this.target.pos.y,
        color: '255,0,255'
      }));
    }
  }

  // gone past target
  if(this.pos.y > this.target.pos.y){
    this.dead = true;
    this.booms.push(new Boom({
      style: '',
      radius: 35,
      x: this.pos.x,
      y: this.pos.y,
      color: '127,127,127'
    }));

  }

};

Bomb.prototype.paint = function(view){
  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);
  view.ctx.rotate(this.velo.angleXY());
  view.ctx.fillStyle= '#f0f';
  view.ctx.beginPath();
  // draw the object horizontally!
  view.ctx.rect(-12, -2, 24, 4);
  view.ctx.fill();
  view.ctx.restore();

  // show vector to target
  // view.ctx.beginPath();
  // view.ctx.strokeStyle= '#fff';
  // view.ctx.moveTo(this.pos.x, this.pos.y);
  // view.ctx.lineTo(this.target.pos.x, this.target.pos.y);
  // view.ctx.stroke();

};
