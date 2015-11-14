/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true, random0to:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Predator = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Predator.prototype = Object.create(Actor.prototype);

Actors.Predator.prototype.title = 'Predator';

Actors.Predator.prototype.init = function(){

  this.vector = new Vec3();

  this.pos = new Vec3(
    this.refs.scene.opts.max_x * Math.random(),
    this.refs.scene.opts.max_y * Math.random(),
    0
  );

  this.velo = new VecR(
    Math.PI * 2 * Math.random(),
    this.attrs.speed
  ).vec3();

};

Actors.Predator.prototype.defaults = [{
  key: 'speed_base',
  info: '',
  value: 5,
  min: 1,
  max: 50
}, {
  key: 'speed_flux',
  info: '',
  value: 3,
  min: 0,
  max: 50
}, {
  key: 'velo_scale',
  info: '',
  value: 0.1,
  min: 0.1,
  max: 1,
  step: 0.1
}, {
  key: 'separation_range',
  info: '',
  value: 150,
  min: 10,
  max: 500
}, {
  key: 'separation_force',
  info: '',
  value: 0.7,
  min: 0.1,
  max: 1.0
}, {
  key: 'chase_force',
  info: '',
  value: 0.7,
  min: 0.1,
  max: 1.0
}];

Actors.Predator.prototype.genAttrs = function(attrs){
  return {
    speed: this.opts.speed_base - (this.opts.speed_flux/2) + (Math.random()*this.opts.speed_flux),
    color: attrs.color || '#fff',
    separation_range: 150,
    cohesion_range: 200,
    alignment_range: 500,

    separation_force: 0.7,
    cohesion_force: 0.1,
    alignment_force: 0.25,

    dead: false,
  };
};

Actors.Predator.prototype.update = function(delta) {

  var vec = new Vec3();
  vec.add(this.chase().scale(this.opts.chase_force));
  vec.add(this.avoid().scale(this.opts.separation_force));

  vec.scale(this.opts.velo_scale);

  this.velo.add(vec);
  this.velo.limit(this.attrs.speed);
  this.pos.add(this.velo);

  // wrap
  if ( this.pos.x < 0 ) {
    this.pos.x = this.refs.scene.opts.max_x;
  }

  if ( this.pos.x > this.refs.scene.opts.max_x ) {
    this.pos.x = 0;
  }

  if ( this.pos.y < 0 ) {
    this.pos.y = this.refs.scene.opts.max_y;
  }

  if ( this.pos.y > this.refs.scene.opts.max_y ) {
    this.pos.y = 0;
  }

};

Actors.Predator.prototype.chase = function(){

  // determine center position of all boids
  var xx = 0;
  var yy = 0;
  var c = 0;

  for(var i=0, ii=this.refs.boids.length; i<ii; i++){
    //if(this.pos.rangeXY(this.refs.boids[i].pos) < 200){
      xx += this.refs.boids[i].pos.x;
      yy += this.refs.boids[i].pos.y;
      c++;
    //}
  }

  var target = new Vec3(xx/c, yy/c);
  //var vec = new Vec3().minus(this.pos).normalize().scale(2.1);

  return target.minus(this.pos).normalize();

}

Actors.Predator.prototype.avoid = function(){

  var i, ii;
  var other;
  var range;

  var vec = new Vec3();

  for(i=0, ii=this.refs.predators.length; i<ii; i++){

    other = this.refs.predators[i];

    if(other === this){
      continue;
    }

    range = this.pos.rangeXY(other.pos);

    if(range === 0){
      continue;
    }

    if (range > this.opts.separation_range){
      continue;
    }

    vec.add(this.pos.minus(other.pos).normalize().scale(1/range));

  }

  return vec.normalize();

};


Actors.Predator.prototype.paint = function(view) {

  // view.ctx.save();
  // view.ctx.translate(this.vector.x, this.vector.y);
  // view.ctx.lineWidth =  1
  // view.ctx.strokeStyle = '#f00';
  // view.ctx.beginPath();
  // view.ctx.arc(0, 0, 10, 0, 2*Math.PI);
  // view.ctx.stroke();
  // view.ctx.restore();


  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);
  view.ctx.rotate(this.velo.angleXY());

  var z = 16;

  view.ctx.lineWidth = 8;
  view.ctx.fillStyle = '#c00';
  view.ctx.strokeStyle = '#c00';
  view.ctx.beginPath();
  view.ctx.lineWidth = 1;
  view.ctx.beginPath();
  view.ctx.moveTo(z, 0);
  view.ctx.lineTo(-z, z);
  view.ctx.lineTo(-z * 0.5, 0);
  view.ctx.lineTo(-z, -z);
  view.ctx.lineTo(z, 0);
  view.ctx.closePath();
  view.ctx.stroke();
  view.ctx.fill();
  view.ctx.restore();

};

