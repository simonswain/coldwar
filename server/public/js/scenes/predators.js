/*global Scenes:true, Scene:true, Actors:true, */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.predators = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.predators.prototype = Object.create(Scene.prototype);

Scenes.predators.prototype.title = 'Predators';

Scenes.predators.prototype.init = function(){

  this.boids = [];
  this.predators = [];

  while(this.boids.length < this.opts.boids_max){
    this.boids.push(new Actors.Boid(
      this.env, {
        scene: this,
        boids: this.boids,
        predators: this.predators
      }, {
      }));
  }

  while(this.predators.length < this.opts.predators_max){
    this.predators.push(new Actors.Predator(
      this.env, {
        scene: this,
        boids: this.boids,
        predators: this.predators
      }, {
      }));
  }

};

Scenes.predators.prototype.getCast = function(){
  return {
    Boid: Actors.Boid,
    Predator: Actors.Predator
  }
};

Scenes.predators.prototype.defaults = [{
  key: 'max_x',
  value: 1200,
  min: 400,
  max: 1600
}, {
  key: 'max_y',
  value: 1200,
  min: 400,
  max: 1200
}, {
  key: 'boids_max',
  value: 150,
  min: 0,
  max: 500
}, {
  key: 'predators_max',
  value: 2,
  min: 0,
  max: 10
}];

Scenes.predators.prototype.genAttrs = function(){
  return {
  };
};

Scenes.predators.prototype.update = function(delta){

  var i, ii;

  for(i=0, ii=this.boids.length; i<ii; i++){
    this.boids[i].update(delta);
  }

  for(i=0, ii=this.predators.length; i<ii; i++){
    this.predators[i].update(delta);
  }

};

Scenes.predators.prototype.paint = function(fx, gx){

  var i, ii;

  for(i=0, ii=this.boids.length; i<ii; i++){
    this.boids[i].paint(gx);
  }

  for(i=0, ii=this.predators.length; i<ii; i++){
    this.predators[i].paint(gx);
  }

};

Scenes.predators.prototype.getHelp = function(){
  return '';
};

Scenes.predators.prototype.captions = [{
  text: 'Predators'
}];

