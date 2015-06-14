/*global Vec3:true, Boom:true, pickOne:true, hex2rgb */
/*jshint browser:true */
/*jshint strict:false */

function Boom(opts){

  this.pos = new Vec3(
    opts.x,
    opts.y,
    opts.z
  );

  this.fake3d = opts.fake3d || false;

  this.color = opts.color || '255,255,255';

  this.world = opts.world;

  this.style = opts.style || false;
  this.crater = opts.crater || false;

  this.radius = opts.radius || 100;
  this.initial_radius = this.radius;

  this.ttl = opts.ttl || 60;
  this.initial_ttl = this.ttl;

  this.dead = false;
  this.rate = 0.5 + (Math.random() * 0.5);
}

Boom.prototype.update = function(delta){
  this.ttl -= (this.rate * delta);
  if(this.ttl <= 0){
    if(this.crater){
      this.style = 'crater';
      this.ttl = 1000;
    } else {
      this.dead = true;
    }
  }
};

Boom.prototype.paint = function(view){

  view.ctx.save();

  // missiles and abms are at a fake 3d position

  if(this.fake3d){
    view.ctx.translate(this.pos.x, this.pos.y - this.pos.z);
  } else {
    view.ctx.translate(this.pos.x, this.pos.y);
  }

  var radius = this.radius * (this.ttl/this.initial_ttl);

  var f = this.ttl / this.initial_ttl;

  switch (this.style){

  case 'splat':
    view.ctx.strokeStyle= 'rgba(' + this.color + ', ' + f.toFixed(2) + ')';
    view.ctx.beginPath();
    view.ctx.arc(0, 0, radius, 0, 2*Math.PI);
    view.ctx.stroke();
    break;

  case 'zoom':
    for(var i=0; i< 10; i++){
      view.ctx.strokeStyle= 'rgba(' + this.color + ', ' + (1-(i/10).toFixed(2)) + ')';
      view.ctx.beginPath();
      view.ctx.lineWidth= 8 * (i/10);
      view.ctx.arc(0, 0, (this.radius - radius) * i/10, 0, 2*Math.PI);
      view.ctx.stroke();
    }
    break;

  case 'crater':
    view.ctx.strokeStyle= 'rgba(' + this.color + ',' + ((Math.random() * 0.5)) + ')';
    view.ctx.beginPath();
    view.ctx.arc(0, 0, this.radius * 0.5, 0, 2*Math.PI);
    view.ctx.stroke();
    break;

  case 'expand':

    radius = this.initial_radius - (this.radius * (this.ttl/this.initial_ttl));

    view.ctx.fillStyle= 'rgba(' + this.color + ', ' + f.toFixed(2) + ')';
    view.ctx.beginPath();
    view.ctx.arc(0, 0, radius, 0, 2*Math.PI);
    view.ctx.fill();
    break;

  default:
    view.ctx.fillStyle= 'rgba(' + this.color + ', ' + f.toFixed(2) + ')';
    view.ctx.beginPath();
    view.ctx.arc(0, 0, radius, 0, 2*Math.PI);
    view.ctx.fill();
    break;
  }
  view.ctx.restore();
};

Boom.prototype.elevation = function(view){

  var scale = view.yscale;
  var xx;
  var i, ii;

  var div = 3;
  view.ctx.save();
  view.ctx.translate(this.pos.x, (this.world.max_z - this.pos.z) * scale);

  var radius = this.radius * (this.ttl/this.initial_ttl);

  var f = this.ttl / this.initial_ttl;

  switch (this.style){
  case 'splat':
    view.ctx.strokeStyle= 'rgba(' + this.color + ', ' + f.toFixed(2) + ')';
    view.ctx.beginPath();
    view.ctx.arc(0, 0, radius/div, 0, 2*Math.PI);
    view.ctx.stroke();
    break;

  case 'zoom':
    for(i=0; i< 10; i++){
      view.ctx.strokeStyle= 'rgba(' + this.color + ', ' + (1-(i/10).toFixed(2)) + ')';
      view.ctx.beginPath();
      view.ctx.lineWidth= 8 * (i/10);
      view.ctx.arc(0, 0, (this.radius - radius) * i/(10*div), 0, 2*Math.PI);
      view.ctx.stroke();
    }
    break;

  case 'crater':
    for(i=0, ii = 10 * Math.random(); i<ii; i++){
      view.ctx.strokeStyle= 'rgba(' + this.color + ',' + ((Math.random() * 0.5)) + ')';
      view.ctx.beginPath();
      view.ctx.lineWidth = 1;

      xx = this.radius * Math.random();
      view.ctx.moveTo(xx, 0);
      view.ctx.lineTo(xx, -2);
      view.ctx.stroke();
    }

    break;

  case 'expand':

    radius = this.initial_radius - (this.radius * (this.ttl/this.initial_ttl));

    view.ctx.fillStyle= 'rgba(' + this.color + ', ' + f.toFixed(2) + ')';
    view.ctx.beginPath();
    view.ctx.arc(0, 0, radius/div, 0, 2*Math.PI);
    view.ctx.fill();
    break;

  default:
    view.ctx.fillStyle= 'rgba(' + this.color + ', ' + f.toFixed(2) + ')';
    view.ctx.beginPath();
    view.ctx.arc(0, 0, radius/div, 0, 2*Math.PI);
    view.ctx.fill();
    break;
  }
  view.ctx.restore();
};
