/*global Scenes:true, Scene:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.actors = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.env.show_opts = false;
  this.init();
};

Scenes.actors.prototype = Object.create(Scene.prototype);

Scenes.actors.prototype.title = 'Actors';
Scenes.actors.prototype.fullscreen = true;

Scenes.actors.prototype.genAttrs = function(attrs){
  return {
    color_slow: 180,
    color_fast: 180
  };
};

Scenes.actors.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 1024,
  min: 200,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 1024,
  min: 200,
  max: 1000
}];

Scenes.actors.prototype.getCast = function(){
  return [];
};

Scenes.actors.prototype.update = function(delta){
};

Scenes.actors.prototype.paint = function(fx, gx, sx){
};

Scenes.actors.prototype.tick = function(){
  this.update();
  this.paint();
};

Scenes.actors.prototype.init = function(){
};

Scenes.actors.prototype.render = function(){
  var html;
  html = '';
  html += '<div class="index">';
  html += '<h1><a href="/" class="color-cycle-fast">actors</a></h1>';
  html += '<ul>';
  var actor;
  for(var i in Actors){
    actor = Actors[i];
    html += '<li>' + i + '</li>';
  }
  html += '</ul>';
  html += '</div>';
  html += '</div>';
  this.env.views.content.el.innerHTML = html;
};

Scenes.actors.prototype.start = function(){
  this.init();
  this.render();
  this.at = Date.now();
  this.raf = window.requestAnimationFrame(this.tick.bind(this));
};

Scenes.actors.prototype.stop = function(){
  if(this.raf){
    window.cancelAnimationFrame(this.raf);
  }
};

Scenes.actors.prototype.restart = function(){
  this.stop();
  setTimeout(this.start.bind(this), 100);
};

