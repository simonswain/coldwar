/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Jetstream = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Jetstream.prototype = Object.create(Actor.prototype);

Actors.Jetstream.prototype.title = 'Jetstream';

Actors.Jetstream.prototype.genAttrs = function(attrs){
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    vel: attrs.vel,
    industry: false,
    city: false,
    reactor: false,
    farm: false,
    period: this.opts.delay + Math.floor(Math.random() * this.opts.delay),
    at: 0,
    cycle: 0,
    phase: 0,
    width: 0
  };
};

Actors.Jetstream.prototype.init = function(){
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  );

};

Actors.Jetstream.prototype.defaults = [{
  key: 'delay',
  value: 1000,
  min: 100,
  max: 5000
}, {
  key: 'temp',
  value: 15.6,
  min: -50,
  max: 50
}, {
  key: 'carbon',
  value: 0,
  min: 0,
  max: 100
}];

Actors.Jetstream.prototype.update = function(delta) {

  this.attrs.at += delta;

  if(this.attrs.at >= this.attrs.period){
    this.attrs.at -= this.attrs.period;
  }

  this.attrs.phase = this.attrs.at/this.attrs.period;
  this.attrs.cycle = Math.sin(((2*Math.PI)/this.attrs.period)*this.attrs.at);
  this.attrs.width = 2 + (this.attrs.cycle * 0.5);
};

Actors.Jetstream.prototype.paint = function(view) {
  view.ctx.save();
  var opacity = 0.25 * (1+this.attrs.cycle);
  var width = this.attrs.width;
  view.ctx.strokeStyle = 'rgba(255,255,255,' + opacity + ')';
  view.ctx.lineWidth = width;

  view.ctx.beginPath();
  view.ctx.moveTo(0, this.attrs.y);
  view.ctx.lineTo(this.refs.scene.opts.max_x, this.attrs.y);
  view.ctx.stroke();

  // view.ctx.beginPath();
  // var x;
  // if(this.attrs.vel>0){
  //   x = this.refs.scene.opts.max_x * this.attrs.phase;
  //   view.ctx.moveTo(x, this.attrs.y - (width/2));
  //   view.ctx.lineTo(x, this.attrs.y + (width/2));
  // } else {
  //   x = this.refs.scene.opts.max_x - (this.refs.scene.opts.max_x * this.attrs.phase);
  //   view.ctx.moveTo(x, this.attrs.y - (width/2));
  //   view.ctx.lineTo(x, this.attrs.y + (width/2));
  // }
  // view.ctx.stroke();

  view.ctx.save();
  view.ctx.translate(0.2, this.pos.y);
  view.ctx.scale(0.2, 0.2);
  view.ctx.fillStyle = '#fff';
  view.ctx.font = '1px ubuntu mono';
  view.ctx.textAlign = 'left';
  view.ctx.textBaseline = 'middle';
  view.ctx.fillText(this.attrs.phase.toFixed(2), 0, 0);
  view.ctx.restore();

  view.ctx.restore();

};
