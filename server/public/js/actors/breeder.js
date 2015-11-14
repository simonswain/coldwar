/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Breeder = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Breeder.prototype = Object.create(Actor.prototype);

Actors.Breeder.prototype.title = 'Breeder';

Actors.Breeder.prototype.genAttrs = function(attrs){
  return {
    cell_x: attrs.cell_x,
    cell_y: attrs.cell_y,
    dead: false,
  };
};

Actors.Breeder.prototype.init = function(){
};

Actors.Breeder.prototype.defaults = [];


Actors.Breeder.prototype.update = function(delta) {
  if(this.refs.rats.length < this.refs.scene.opts.rat_limit){
    this.refs.rats.push(new Actors.Rat(
      this.env, {
        scene: this.refs.scene,
        maze: this.refs.maze,
        human: this.refs.human,
        reactor: this.refs.reactor,
        rats: this.refs.rats,
      },{
        cell_x: this.attrs.cell_x,
        cell_y: this.attrs.cell_y
      }));
  }

};

Actors.Breeder.prototype.paint = function(view) {

  var xf = this.refs.scene.opts.max_x / this.refs.maze.opts.cols;
  var yf = this.refs.scene.opts.max_y / this.refs.maze.opts.rows;
  var f = Math.min(xf, yf);

  view.ctx.save();
  view.ctx.translate(
    (this.refs.scene.opts.max_x/2) - (f*this.refs.maze.opts.cols/2),
    (this.refs.scene.opts.max_y/2) - (f*this.refs.maze.opts.rows/2)
  );

  view.ctx.beginPath();
  view.ctx.fillStyle = '#ff0';
  view.ctx.arc((this.attrs.cell_x * f) + (f/2), (this.attrs.cell_y * f) + (f/2), f/4, 0, 2*Math.PI);

  //view.ctx.fillRect(this.attrs.cell_x * f, this.attrs.cell_y * f, f, f);
  view.ctx.fill();
  view.ctx.restore();

};

Actors.Breeder.prototype.elevation = function(view) {

  var xf = this.refs.scene.opts.max_x / this.refs.maze.opts.cols;
  var yf = this.refs.scene.opts.max_z / this.refs.maze.opts.rows;
  var f = Math.min(xf, yf);

  view.ctx.save();
  view.ctx.translate(
    (this.refs.scene.opts.max_x/2) - (f*this.refs.maze.opts.cols/2),
    (f*this.refs.maze.opts.rows/2)
  );

  view.ctx.beginPath();
  view.ctx.fillStyle = '#ff0';
  view.ctx.arc((this.attrs.cell_x * f) + (f/2), (this.attrs.cell_y * f) + (f/2), f/3, 0, 2*Math.PI);

  view.ctx.fill();
  view.ctx.restore();

};
