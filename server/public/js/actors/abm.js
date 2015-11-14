/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Abm = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Abm.prototype = Object.create(Actor.prototype);

Actors.Abm.prototype.title = 'Abm';

Actors.Abm.prototype.genAttrs = function(attrs){
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    ttl: 40 + (20*Math.random()),
    speed: attrs.speed || this.opts.speed - (this.opts.speed_flux/2) + (Math.random()*this.opts.speed_flux),
    color: attrs.color || '#f0f',
    sensitivity: attrs.sensitivity || this.opts.sensitivity,
    dead: false,
  };
};

Actors.Abm.prototype.init = function(){
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  );
  this.velo = new Vec3();
};

Actors.Abm.prototype.defaults = [{
  key: 'speed',
  info: '',
  value: 0.05,
  min: 0.005,
  max: 1
}, {
  key: 'speed_flux',
  info: '',
  value: 0.08,
  min: 0,
  max: 2
}, {
  key: 'sensitivity',
  info: '',
  value: 16,
  min: 1,
  max: 128
}, {
  key: 'ttl',
  info: '',
  value: 1500,
  min: 100,
  max: 10000
}];


Actors.Abm.prototype.update = function(delta) {

   this.attrs.ttl --;

  if(this.attrs.ttl < 0){
    this.refs.base.attrs.abms_launched --;
    this.attrs.dead = true;
    this.refs.scene.booms.push(new Actors.Boom(
      this.env, {
        scene: this.refs.scene
      }, {
        radius: 10,
        ttl: 30,
        style: '',
        x: this.pos.x,
        y: this.pos.y,
        z: this.pos.z,
        color: hex2rgb(this.attrs.color, 8)
      }));
  }

  var accel = this.refs.target.pos.minus(this.pos).normalize().scale(this.attrs.speed);
  this.velo.add(accel);

  this.pos.add(this.velo);

  var rand = new Vec3(
    0 - (this.attrs.speed*20) + (40*this.attrs.speed * Math.random()),
    0 - (this.attrs.speed*20) + (40*this.attrs.speed * Math.random()),
    0 - (this.attrs.speed*20) + (60*this.attrs.speed * Math.random())
  );
  this.pos.add(rand);

  // hit target?
  var range = this.pos.range(this.refs.target.pos);

  if(range < this.attrs.sensitivity){
    this.attrs.dead = true;
    this.refs.base.attrs.abms_launched --;
    this.refs.target.destroy();
  }
};

Actors.Abm.prototype.paint = function(view) {
  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);
  view.ctx.fillStyle = this.attrs.color;
  view.ctx.beginPath();
  view.ctx.arc(0, 0, 1, 0, 2 * Math.PI);
  view.ctx.fill();
  view.ctx.restore();
};

Actors.Abm.prototype.elevation = function(view) {
  // flight object
  view.ctx.save();
  view.ctx.translate(this.pos.x, (this.refs.scene.opts.max_z - this.pos.z));
  view.ctx.rotate(-this.velo.angleXZ());

  //view.ctx.fillStyle = '#f0f';
  view.ctx.fillStyle = this.attrs.color;
  view.ctx.beginPath();
  view.ctx.arc(0, 0, 1, 0, 2 * Math.PI);
  view.ctx.fill();

  view.ctx.restore();

};
