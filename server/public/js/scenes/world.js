/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.world = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.world.prototype = Object.create(Scene.prototype);

Scenes.world.prototype.title = 'World';

Scenes.world.prototype.layout = '';

Scenes.world.prototype.init = function(){

  this.map = new Actors.Map(
    this.env, {
      scene: this
    }, {
    });

  this.booms = [];

};


Scenes.world.prototype.getCast = function(){
  return {
    Boom: Actors.Boom,
    Map: Actors.Map
  };
};

Scenes.world.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 360,
  min: 360,
  max: 360
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 180,
  min: 180,
  max: 180
}, {
  key: 'max_z',
  info: 'Max Z',
  value: 1,
  min: 1,
  max: 128
}, {
  key: 'color',
  value: 7,
  min: 0,
  max: 7,
}, {
  key: 'show_grid',
  value: 1,
  min: 0,
  max: 1
}, {
  key: 'grid_size',
  value: 10,
  min: 5,
  max: 45
}, {
  key: 'quantize',
  value: 1,
  min: 0,
  max: 9,
  step: 0.1
}, {
  key: 'dp',
  value: 0,
  min: 0,
  max: 4
}];

// see bottom for more defaults

Scenes.world.prototype.colors = ['#000', '#00f', '#f00','#f0f', '#0f0', '#0ff','#ff0','#fff'];


Scenes.world.prototype.genAttrs = function(){
  return {
    color: Scenes.world.prototype.colors[this.opts.color]
  };
};

Scenes.world.prototype.update = function(delta){

  this.booms.forEach(function(boom){
    boom.update(delta);
  });

  this.booms.forEach(function(boom, i){
    if(boom.attrs.dead){
      this.booms.splice(i, 1);
    }
  }, this);

  var x, y;

};

Scenes.world.prototype.onClick = function(x, y, e){
  // right click to add boom
  if(e.buttons === 2){
    this.booms.push(new Actors.Boom(
      this.env, {
        scene: this,
      }, {
        radius: 18,
        x: x - 180,
        y: y - 90,
      }));
  }

};

Scenes.world.prototype.paint = function(fx, gx, sx){

  this.map.paint(gx);

  // translate from -180


  gx.ctx.save();
  gx.ctx.translate(180, 90);

  fx.ctx.save();
  fx.ctx.translate(180, 90);

  this.booms.forEach(function(boom, i){
    boom.paint(gx);
  }, this);

  if(this.opts.show_grid){
    this.paintGrid(gx);
    this.paintData(gx);
    this.paintMouse(gx);
  }

  gx.ctx.restore();
  fx.ctx.restore();

};

Scenes.world.prototype.paintMouse = function (view) {
  view.ctx.fillStyle = this.attrs.color;

  var x = (this.env.mouse.x - 180);
  var y = (this.env.mouse.y - 90);
  if(x > - 180 && x < 180 && y > - 90 && y < 90){

    view.ctx.strokeStyle = 'rgba(0,255,255,0.5)';
    view.ctx.lineWidth = 0.5;

    view.ctx.beginPath();
    view.ctx.lineTo(-180, y);
    view.ctx.lineTo(180, y);
    view.ctx.stroke();

    view.ctx.beginPath();
    view.ctx.lineTo(x, -90);
    view.ctx.lineTo(x, 90);
    view.ctx.stroke();

  }
};

Scenes.world.prototype.paintData = function (view) {
  view.ctx.fillStyle = this.attrs.color;
  view.ctx.font = '6px ubuntu mono, monospace';
    view.ctx.fillStyle = 'rgba(255,255,255,0.8)';
  view.ctx.textBaseline = 'middle';
  var x = (this.env.mouse.x - 180);
  var y = (this.env.mouse.y - 90);
  if(x > - 180 && x < 180 && y > - 90 && y < 90){
    view.ctx.textAlign = 'center';
    view.ctx.fillText(x.toFixed(2), x, -86);
    view.ctx.fillText(x.toFixed(2), x, 86);

    view.ctx.textAlign = 'left';
    view.ctx.fillText(y.toFixed(2), -176, y);

    view.ctx.textAlign = 'right';
    view.ctx.fillText(y.toFixed(2), 176, y);

    view.ctx.strokeStyle = 'rgba(0,255,255,0.5)';

    view.ctx.lineWidth = 0.5;

    view.ctx.beginPath();
    view.ctx.lineTo(-180, y);
    view.ctx.lineTo(180, y);
    view.ctx.stroke();

    view.ctx.beginPath();
    view.ctx.lineTo(x, -90);
    view.ctx.lineTo(x, 90);
    view.ctx.stroke();

  }
};

Scenes.world.prototype.paintGrid = function (view) {

  var ctx = view.ctx;
  var move = true;
  view.ctx.save();

  view.ctx.font = '4px ubuntu mono, monospace';
  view.ctx.textBaseline = 'middle';
  view.ctx.textAlign = 'center';

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.fillStyle = 'rgba(255,255,255,0.2)';

  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.lineTo(-180, 0);
  ctx.lineTo(180, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineTo(0, -90);
  ctx.lineTo(0, 90);
  ctx.stroke();

  ctx.lineWidth = 0.5;

  var i, ii;
  var j, jj;
  var point;
  for(i=-90; i<=90; i += this.opts.grid_size){
    // latitude
    ctx.beginPath();
    ctx.moveTo(-180, i);
    ctx.lineTo(180, i);
    ctx.stroke();

    view.ctx.fillText(i.toFixed(0), -180 - 4, i);
    view.ctx.fillText(i.toFixed(0), 180 + 4, i);

  }
  for(i=-180; i<=180; i += this.opts.grid_size){
    // longitude
    ctx.beginPath();
    ctx.moveTo(i, -90);
    ctx.lineTo(i, 90);
    ctx.stroke();

    view.ctx.fillText(i.toFixed(0), i, -90 - 4);
    view.ctx.fillText(i.toFixed(0), i, 90 + 4);
  }
  ctx.restore();
};

