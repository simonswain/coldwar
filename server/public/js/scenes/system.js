/*global Scenes:true, Scene:true, Actors:true, random0to */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.system = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.system.prototype = Object.create(Scene.prototype);

Scenes.system.prototype.title = 'System';

Scenes.system.prototype.init = function(){

  this.species = [];

  this.system = new Actors.System(
    this.env, {
      scene: this
    },{
      x: this.opts.max_x * 0.5,
      y: this.opts.max_y * 0.5,
      z: this.opts.max_z * 0.5,
      standalone: true
    });

  for(var i=0, ii=this.opts.species_count; i<ii; i++){
    this.species.push(this.makeSpecies({
      color: this.colors[i] || '#fff'
    }));
  }

};

Scenes.system.prototype.colors = ['#0ff', '#f0f','#cc0', '#0f0', '#9cf'];

Scenes.system.prototype.getCast = function(){
  return {
    Species: Actors.Species,
    System: Actors.System,
    Star: Actors.Star,
    Planet: Actors.Planet,
    Ship: Actors.Ship,
    Boom: Actors.Boom,
  };
};

Scenes.system.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 100,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 100,
  min: 100,
  max: 1000
}, {
  key: 'max_z',
  info: 'Max Z',
  value: 100,
  min: 50,
  max: 500
}, {
  key: 'species_count',
  info: '',
  value: 2,
  min: 0,
  max: 8
}, {
  key: 'gameover_restart_delay',
  info: 'Game Over restart delay',
  value: 5,
  min: 0,
  max: 30
}];

Scenes.system.prototype.genAttrs = function(){
  return {
    max: Math.min(this.opts.max_x, this.opts.max_y)
  };
};

Scenes.system.prototype.makeSpecies = function(attrs){

  var species = new Actors.Species(
    this.env, {
      scene: this,
    }, attrs);

  var planet;
  var ok = false;
  while(!ok){
    planet = this.system.planets[random0to(this.system.planets.length)];
    if(!planet.refs.species){
      species.addPlanet(planet);
      ok = true;
    }
  }
  return species;
};


Scenes.system.prototype.update = function(delta){
  this.system.update(delta);

  if(this.system.attrs.species && ! this.env.gameover){
    this.env.gameover = true;
    setTimeout(this.env.restart, this.opts.gameover_restart_delay * 1000);
  }

};

Scenes.system.prototype.paint = function(fx, gx, sx){
  this.paintMap(gx);
};

Scenes.system.prototype.paintMap = function(view){

  var scale = this.attrs.max * 0.95 / this.system.attrs.radius / 2;
  view.ctx.save();
  view.ctx.translate(this.system.pos.x, this.system.pos.y);
  view.ctx.scale(scale, scale);
  this.system.paint(view);
  view.ctx.restore();

  // who won?

  if(this.env.gameover && Date.now()/400 % 1 > 0.5){
    view.ctx.lineWidth = 0.5;
    view.ctx.strokeStyle = '#fff';
    if(this.system.attrs.species){
      view.ctx.strokeStyle = this.system.attrs.species.attrs.color;
    }
    view.ctx.beginPath();
    view.ctx.arc(this.opts.max_x * 0.5, this.opts.max_y * 0.5, this.attrs.max/2 * 0.95, 0, 2*Math.PI);
    view.ctx.stroke();
  }

};

Scenes.system.prototype.help = [
  'Competing species in a star system produce ships on their homeworld and try to colonise.',
];
