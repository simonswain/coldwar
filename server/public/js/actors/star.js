/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Star = function(env, opts, attrs){
  this.env = env;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Star.prototype.title = 'Star';

Actors.Star.prototype.init = function(){
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  );
};

Actors.Star.prototype.defaults = [{
  key: 'type',
  info: 'Color',
  value: 3,
  min: 0,
  max: 7
}];

Actors.Star.prototype.getParams = function(){
  return this.defaults;
};

Actors.Star.prototype.genOpts = function(args){
  var opts = {};
  var params = this.getParams();
  params.forEach(function(param){
    if(args && args.hasOwnProperty(param.key)){
      opts[param.key] = Number(args[param.key]);
    } else {
      opts[param.key] = param.value;
    }
  }, this);
  return opts;
};

Actors.Star.prototype.genAttrs = function(attrs){
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
  };
};


Actors.Star.prototype.update = function(delta){
};

Actors.Star.prototype.paint = function(view){

  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);

  var r = 12;
  var p = 8;
  var m = 0.5;

  view.ctx.lineWidth = 8;
  view.ctx.strokeStyle = '#f00';
  view.ctx.fillStyle = '#f00';

  view.ctx.strokeStyle = '#fff';
  view.ctx.fillStyle = '#fff';

  view.ctx.beginPath();
  view.ctx.moveTo(0, 0 - r);
  for (var i = 0; i < p; i++) {
    view.ctx.rotate(Math.PI / p);
    view.ctx.lineTo(0, 0 - (r * m));
    view.ctx.rotate(Math.PI / p);
    view.ctx.lineTo(0, 0 - r);
  }
  view.ctx.fill();

  // view.ctx.beginPath();
  // view.ctx.arc(0, 0, 4, 0, 2*Math.PI);
  // view.ctx.stroke();
  // view.ctx.fill();

  view.ctx.restore();

};
