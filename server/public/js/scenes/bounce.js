/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.bounce = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.bounce.prototype = Object.create(Scene.prototype);

Scenes.bounce.prototype.title = 'Bounce';

Scenes.bounce.prototype.layout = '';

Scenes.bounce.prototype.init = function(){
  this.balls = [];
  this.booms = [];
}


Scenes.bounce.prototype.getCast = function(){
  return {
    Ball: Actors.Ball,
    Boom: Actors.Boom
  }
};

Scenes.bounce.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'max_z',
  info: 'Max Z',
  value: 1,
  min: 1,
  max: 1
}, {
  key: 'balls_max',
  value: 10,
  min: 1,
  max: 100,
}, {
  key: 'g',
  value: 0.1,
  min: 0,
  max: 1,
  step: 0.1
}];

Scenes.bounce.prototype.genAttrs = function(){
  return {
  };
};

Scenes.bounce.prototype.update = function(delta){

  if(this.balls.length < this.opts.balls_max){
    this.balls.push(new Actors.Ball(
      this.env, {
        scene: this,
        balls: this.balls,
        booms: this.booms,
      }, {
        x: this.opts.max_x * Math.random(),
        y: this.opts.max_y * Math.random(),
        z: 0,
        color: '#ff0',
      }));
  
  }

  for(var i=0, ii=this.balls.length; i<ii; i++){
    this.balls[i].update(delta);
  }

  for(var i=0, ii=this.booms.length; i<ii; i++){
    this.booms[i].update(delta);
  }

  for(var i=0, ii=this.balls.length; i<ii; i++){
    if(this.balls[i].attrs.dead){
      this.balls.splice(i, 1);
      i--;
      ii--;
    }
  }

  for(var i=0, ii=this.booms.length; i<ii; i++){
    if(this.booms[i].attrs.dead){
      this.booms.splice(i, 1);
      i--;
      ii--;
    }
  }
  
}

Scenes.bounce.prototype.paint = function(fx, gx, sx){
  for(var i=0, ii=this.balls.length; i<ii; i++){
    this.balls[i].paint(fx);
  }

  for(var i=0, ii=this.balls.length; i<ii; i++){
    this.balls[i].paintx(gx);
  }
  
  for(var i=0, ii=this.booms.length; i<ii; i++){
    this.booms[i].paint(gx);
  }

}
