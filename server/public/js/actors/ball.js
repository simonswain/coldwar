/*global Actors:true, Actor:true, Vec3:true, hex2rgb:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Ball = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init(attrs);
};

Actors.Ball.prototype = Object.create(Actor.prototype);

Actors.Ball.prototype.title = 'Ball';

Actors.Ball.prototype.genAttrs = function(attrs){
  return {
    ttl: this.opts.ttl_base + (Math.random() * this.opts.ttl_flux),
    dead: false
  };
};

Actors.Ball.prototype.init = function(attrs){

  this.pos = new Vec3(
    attrs.x,
    attrs.y,
    0
  );

  this.velo = new Vec3(
    Math.random() * this.opts.speed,
    Math.random() * this.opts.speed,
    0
  );

};

Actors.Ball.prototype.defaults = [{
  key: 'radius',
  value: 8,
  min: 1,
  max: 16
}, {
  key: 'speed',
  value: 5,
  min: 1,
  max: 16
}, {
  key: 'ttl_base',
  value: 60,
  min: 1,
  max: 60000
}, {
  key: 'ttl_flux',
  value: 60,
  min: 1,
  max: 60000
}];


Actors.Ball.prototype.update = function(delta) {

  this.attrs.ttl --;

  if(this.attrs.ttl < 0){
    this.attrs.dead = true;

    this.refs.booms.push(new Actors.Boom(
      this.env, {
        scene: this,
      }, {
        x: this.pos.x,
        y: this.pos.y,
        z: 0,
        style: Math.floor(Math.random() * 7),
        radius: 10 + (Math.random() * 25),
        color: Math.floor(Math.random() * 7)
      }));

    return;
  }
  
  this.pos.add(this.velo);

  if(this.pos.x > this.refs.scene.opts.max_x){
    this.velo.x = - this.velo.x;
  }
  
  if(this.pos.x < 0){
    this.velo.x = - this.velo.x;
  }

  if(this.pos.y > this.refs.scene.opts.max_y){
    this.velo.y = - this.velo.y;
  }
  
  if(this.pos.y < 0){
    this.velo.y = - this.velo.y;
  }
  

};

Actors.Ball.prototype.paint = function(view) {
  view.ctx.save();
  view.ctx.fillStyle = '#fff';
  view.ctx.translate(this.pos.x, this.pos.y);
  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.opts.radius, 0, 2*Math.PI);
  view.ctx.fill();
  view.ctx.fillStyle = '#f00';
  // view.ctx.font = '24pt monospace';
  // view.ctx.fillText(this.attrs.ttl.toFixed(0), 0, 0); 
  view.ctx.restore();
};

Actors.Ball.prototype.paintx = function(view) {
  view.ctx.save();
  view.ctx.fillStyle = '#f00';
  view.ctx.translate(this.pos.x, this.pos.y);
  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.opts.radius, 0, 2*Math.PI);
  view.ctx.fill();
  view.ctx.fillStyle = '#f00';
  // view.ctx.font = '24pt monospace';
  // view.ctx.fillText(this.attrs.ttl.toFixed(0), 0, 0); 
  view.ctx.restore();
};
