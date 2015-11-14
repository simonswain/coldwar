/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true, pickOne */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Interceptor = function(env, opts, attrs){
  this.env = env;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.world = opts.world;
  this.silo = opts.silo;
  this.target = opts.target;
  this.init();
};

Actors.Interceptor.prototype.title = 'Interceptor';

Actors.Interceptor.prototype.init = function(){
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y
  );
  this.velo = new Vec3();
  this.gravity = new Vec3(0, 0.1);
};

Actors.Interceptor.prototype.defaults = [{
  key: 'sensitivity',
  info: '',
  value: 48,
  min: 1,
  max: 128
}, {
  key: 'ttl',
  info: '',
  value: 100,
  min: 0,
  max: 1000
}];

// spectrum 000 00f f00 f0f 0f0 0ff ff0 fff

Actors.Interceptor.prototype.getParams = function(){
  return this.defaults;
};

Actors.Interceptor.prototype.genOpts = function(args){
  var opts = {};
  var params = this.getParams();
  params.forEach(function(param){
    if(args && args.hasOwnProperty(param.key)){
      opts[param.key] = Number(args[param.key]);
    } else {
      opts[param.key] = param.value;
    }
  }, this);
  return opts;
};

Actors.Interceptor.prototype.genAttrs = function(attrs){
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    sensitivity: this.opts.sensitivity,
    ttl: this.opts.ttl,
    dead: false,
    speed: 0.2 + (Math.random() * 0.1)
  };
};

Actors.Interceptor.prototype.x = function(f){
  return this.opts.max_x * f;
};

Actors.Interceptor.prototype.y = function(f){
  return this.opts.max_y * f;
};

Actors.Interceptor.prototype.z = function(f){
  return this.opts.max_z * f;
};

Actors.Interceptor.prototype.update = function(delta){

   this.attrs.ttl --;
  if(this.attrs.ttl < 0){
    this.silo.attrs.launched --;
    this.attrs.dead = true;
    this.world.booms.push(new Actors.Boom(
      this.env, {
      }, {
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
  if(!this.target || this.target.attrs.dead){
    bomb = pickOne(this.world.bombs);
    if(bomb){
      this.target = bomb;
    }

  }

  //

  var accel = this.target.pos.minus(this.pos).normalize().scale(this.attrs.speed);
  this.velo.add(accel);
  this.pos.add(this.velo);
  this.velo.add(this.gravity);

  // hit target?
  var range = this.pos.range(this.target.pos);
  if(range < this.opts.sensitivity){
    this.attrs.dead = true;
    this.target.attrs.dead = true;
    this.silo.attrs.launched --;
    this.world.booms.push(new Actors.Boom(this.env, {
    }, {
      style: '',
      radius: 25,
      x: this.pos.x,
      y: this.pos.y,
      color: '255,255,0'
    }));
  }

};

Actors.Interceptor.prototype.paint = function(view){
  view.ctx.save();
  view.ctx.rotate(this.velo.angleXY());
  view.ctx.fillStyle= '#0cc';
  view.ctx.beginPath();
  // draw the object horizontally!
  view.ctx.rect(-12, -2, 16, 2);
  view.ctx.fill();

  view.ctx.restore();
};
