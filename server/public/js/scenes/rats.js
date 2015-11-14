/*global Scenes:true, Scene:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.rats = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.rats.prototype = Object.create(Scene.prototype);

Scenes.rats.prototype.title = 'Rats';
Scenes.rats.prototype.layout = 'scanner';

Scenes.rats.prototype.init = function(){

  this.breeders = [];
  this.rats= [];

  this.maze = new Actors.Maze(
    this.env, {
      scene: this
    },{
    });

  this.reactor = new Actors.Reactor(
    this.env, {
      scene: this,
      maze: this.maze,
    },{
      cell_x: this.maze.opts.cols-1,
      cell_y: Math.floor(this.maze.opts.rows/2)
    });

  this.human = new Actors.Human(
    this.env, {
      scene: this,
      maze: this.maze,
      reactor: this.reactor,
      factories: this.factories,
      rats: this.rats,
    },{
      cell_x: 0,
      cell_y: Math.floor(this.maze.opts.rows/2)
    });

  for(var i=0, ii=this.opts.breeder_count; i<ii; i++){
    this.breeders.push(new Actors.Breeder(
      this.env, {
        scene: this,
        maze: this.maze,
        human: this.human,
        reactor: this.reactor,
        factories: this.factories,
        rats: this.rats,
      },{
        cell_x: (this.maze.opts.cols/2) + Math.floor(((this.maze.opts.cols/2) * Math.random()))-2,
        cell_y: Math.floor((this.maze.opts.rows * Math.random()))
      }));
  }
};


Scenes.rats.prototype.getCast = function(){
  return {
    Maze: Actors.Maze,
    Human: Actors.Human,
    Breeder: Actors.Breeder,
    Reactor: Actors.Reactor,
    Rat: Actors.Rat,
    Boom: Actors.Boom,
  };
};

Scenes.rats.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 480,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 480,
  min: 100,
  max: 1000
}, {
  key: 'max_z',
  info: 'Max Z',
  value: 100,
  min: 50,
  max: 300
}, {
  key: 'human_count',
  info: '',
  value: 1,
  min: 1,
  max: 10
}, {
  key: 'reactor_count',
  info: '',
  value: 1,
  min: 0,
  max: 10
}, {
  key: 'breeder_count',
  info: '',
  value: 2,
  min: 0,
  max: 4
}, {
  key: 'rat_limit',
  info: '',
  value: 10,
  min: 1,
  max: 100
}];

Scenes.rats.prototype.genAttrs = function(){
  return {
  };
};

Scenes.rats.prototype.update = function(delta){
  for(var i=0, ii=this.breeders.length; i<ii; i++){
    this.breeders[i].update(delta);
  }
  for(var i=0, ii=this.rats.length; i<ii; i++){
    this.rats[i].update(delta);
  }
};

Scenes.rats.prototype.paint = function(fx, gx, sx){
  this.paintMap(gx);
  this.paintElevation(sx);
};

Scenes.rats.prototype.paintMap = function(view){
  this.maze.paint(view);
  for(var i=0, ii=this.breeders.length; i<ii; i++){
    this.breeders[i].paint(view)
  }

  this.reactor.paint(view);

  for(var i=0, ii=this.rats.length; i<ii; i++){
    this.rats[i].paint(view)
  }

  this.human.paint(view);
};

Scenes.rats.prototype.paintElevation = function(view){
  view.ctx.save();
  this.maze.elevation(view);
  for(var i=0, ii=this.breeders.length; i<ii; i++){
    this.breeders[i].elevation(view)
  }

  this.reactor.elevation(view);

  for(var i=0, ii=this.rats.length; i<ii; i++){
    this.rats[i].elevation(view)
  }

  this.human.elevation(view);
  view.ctx.restore();
};

Scenes.rats.prototype.getHelp = function(){
  return '';
};
