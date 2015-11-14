/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Human = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Human.prototype = Object.create(Actor.prototype);

Actors.Human.prototype.title = 'Human';

Actors.Human.prototype.genAttrs = function(attrs){
  return {
    cell_x: attrs.cell_x,
    cell_y: attrs.cell_y,
    dead: false,
  };
};

Actors.Human.prototype.init = function(){
  var xf = this.refs.scene.opts.max_x / this.refs.maze.opts.cols;
  var yf = this.refs.scene.opts.max_y / this.refs.maze.opts.rows;
  var f = Math.min(xf, yf);
  this.pos = new Vec3(
    (xf * this.attrs.cell_x) + xf/2,
    (xf * this.attrs.cell_y) + yf/2,
    0
  );
};

Actors.Human.prototype.defaults = [];


Actors.Human.prototype.update = function(delta) {
};

Actors.Human.prototype.paint = function(view) {

  var xf = this.refs.scene.opts.max_x / this.refs.maze.opts.cols;
  var yf = this.refs.scene.opts.max_y / this.refs.maze.opts.rows;
  var f = Math.min(xf, yf);

  view.ctx.save();
  view.ctx.translate(
    (this.refs.scene.opts.max_x/2) - (f*this.refs.maze.opts.cols/2),
    (this.refs.scene.opts.max_y/2) - (f*this.refs.maze.opts.rows/2)
  );

  view.ctx.beginPath();
  view.ctx.fillStyle = '#0ff';
  view.ctx.arc(this.pos.x, this.pos.y, f/4, 0, 2*Math.PI);

  view.ctx.fill();
  view.ctx.restore();

};

Actors.Human.prototype.elevation = function(view) {

  var xf = this.refs.scene.opts.max_x / this.refs.maze.opts.cols;
  var yf = this.refs.scene.opts.max_z / this.refs.maze.opts.rows;
  var f = Math.min(xf, yf);

  view.ctx.save();
  view.ctx.translate(
    (this.refs.scene.opts.max_x/2) - (f*this.refs.maze.opts.cols/2),
    (f*this.refs.maze.opts.rows/2)
  );

  view.ctx.beginPath();
  view.ctx.fillStyle = '#0ff';
  view.ctx.arc((this.attrs.cell_x * f) + (f/2), (this.attrs.cell_y * f) + (f/2), f/4, 0, 2*Math.PI);

  view.ctx.fill();
  view.ctx.restore();

};
