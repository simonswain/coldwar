/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Reactor = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Reactor.prototype = Object.create(Actor.prototype);

Actors.Reactor.prototype.title = 'Reactor';

Actors.Reactor.prototype.genAttrs = function(attrs){
  return {
    cell_x: attrs.cell_x,
    cell_y: attrs.cell_y,
    tripped: false,
    ttl: this.opts.ttl,
  };
};

Actors.Reactor.prototype.init = function(){
};

Actors.Reactor.prototype.defaults = [{
  key: 'ttl',
  info: '',
  value: 1000,
  min: 100,
  max: 10000
}];


Actors.Reactor.prototype.update = function(delta) {
};

Actors.Reactor.prototype.paint = function(view) {

  var xf = this.refs.scene.opts.max_x / this.refs.maze.opts.cols;
  var yf = this.refs.scene.opts.max_y / this.refs.maze.opts.rows;
  var f = Math.min(xf, yf);

  view.ctx.save();
  view.ctx.translate(
    (this.refs.scene.opts.max_x/2) - (f*this.refs.maze.opts.cols/2),
    (this.refs.scene.opts.max_y/2) - (f*this.refs.maze.opts.rows/2)
  );

  view.ctx.beginPath();
  view.ctx.fillStyle = '#f0f';
  view.ctx.arc((this.attrs.cell_x * f) + (f/2), (this.attrs.cell_y * f) + (f/2), f/4, 0, 2*Math.PI);

  //view.ctx.fillRect(this.attrs.cell_x * f, this.attrs.cell_y * f, f, f);
  view.ctx.fill();
  view.ctx.restore();

};

Actors.Reactor.prototype.elevation = function(view) {

  var xf = this.refs.scene.opts.max_x / this.refs.maze.opts.cols;
  var yf = this.refs.scene.opts.max_z / this.refs.maze.opts.rows;
  var f = Math.min(xf, yf);

  view.ctx.save();
  view.ctx.translate(
    (this.refs.scene.opts.max_x/2) - (f*this.refs.maze.opts.cols/2),
    (f*this.refs.maze.opts.rows/2)
  );

  view.ctx.beginPath();
  view.ctx.fillStyle = '#f0f';
  view.ctx.arc((this.attrs.cell_x * f) + (f/2), (this.attrs.cell_y * f) + (f/2), f/2, 0, 2*Math.PI);

  view.ctx.fill();
  view.ctx.restore();

};
