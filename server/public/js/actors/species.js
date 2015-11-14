/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Species = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Species.prototype.title = 'Species';

Actors.Species.prototype.init = function(){

  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  );

  this.systems = [];
  this.planets = [];
  this.ships = [];

};

Actors.Species.prototype.genAttrs = function(attrs){
  return {
    color: attrs.color || '#f0f'
  };
};

Actors.Species.prototype.defaults = [{
  key: 'aggression',
  info: '',
  value: 5,
  min: 0,
  max: 9
}];

Actors.Species.prototype.genOpts = function(args){
  var opts = {};
  this.defaults.forEach(function(param){
    if(args && args.hasOwnProperty(param.key)){
      opts[param.key] = Number(args[param.key]);
    } else {
      opts[param.key] = param.value;
    }
  }, this);
  return opts;
};


Actors.Species.prototype.addSystem = function(system){
  if(system.refs.species){
    system.refs.species.removeSystem(system);
  }
  system.refs.species = this;
  this.systems.push(system);
};

Actors.Species.prototype.removeSystem = function(system){
  for(var i=0, ii=this.systems.length; i<ii; i++){
    if(this.systems[i] === system){
      this.systems.splice(i, 1);
      break;
    }
  }
  system.species = null;
};

Actors.Species.prototype.addPlanet = function(planet){
  if(planet.refs.species){
    planet.refs.species.removePlanet(this.planet);
  }
  planet.refs.species = this;
  this.planets.push(planet);
};

Actors.Species.prototype.removePlanet = function(planet){
  for(var i=0, ii=this.planets.length; i<ii; i++){
    if(this.planets[i] === planet){
      this.planets.splice(i, 1);
      break;
    }
  }
};

Actors.Species.prototype.addShip = function(ship){
  this.ships.push(ship);
};

Actors.Species.prototype.removeShip = function(ship){
  for(var i=0, ii=this.ships.length; i<ii; i++){
    if(this.ships[i] === ship){
      this.ships.splice(i, 1);
      break;
    }
  }
};

Actors.Species.prototype.update = function(delta){
};

Actors.Species.prototype.paint = function(view){
};

Actors.Species.prototype.elevation = function(view){
};
