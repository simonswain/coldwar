/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true, pickOne */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Cell = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Cell.prototype = Object.create(Actor.prototype);

Actors.Cell.prototype.title = 'Cell';

Actors.Cell.prototype.genAttrs = function(attrs){
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    industry: false,
    city: false,
    reactor: false,
    farm: false,
    period: this.opts.delay + Math.floor(Math.random() * this.opts.delay),
    at: 0,
    cycle: 0
  };
};

Actors.Cell.prototype.init = function(){
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  );

  //console.log(this.pos.y, this.refs.scene.opts.max_y * 0.2);

  if(this.pos.y > this.refs.scene.opts.max_y * 0.85){
    this.attrs.type = 0;
    return;
  }

  if(this.pos.y < this.refs.scene.opts.max_y * 0.1){
    this.attrs.type = 0;
    return;
  }


  this.attrs.type = Math.floor(Math.random()*5)-2;
  if(this.attrs.type < 0){
    this.attrs.type = 0;
  }
  //console.log(this.attrs.type);

  if(this.attrs.type === 1 && Math.random() < 0.5){
    this.attrs.industry = true;
  }

  if(this.attrs.type === 1 && Math.random() < 0.2){
    this.attrs.city = true;
  }

  if(this.attrs.type === 1 && Math.random() < 0.1){
    this.attrs.reactor = true;
  }

};

Actors.Cell.prototype.defaults = [{
  key: 'delay',
  value: 300,
  min: 1,
  max: 500
}, {
  key: 'type',
  value: 1,
  min: 0, // water land mountain
  max: 7
}, {
  key: 'temp',
  value: 15.6,
  min: -50,
  max: 50
}, {
  key: 'carbon',
  value: 0,
  min: 0,
  max: 100
}];

Actors.Cell.prototype.colors = [
  '#00c',
  '#090',
  '#fff',
];

Actors.Cell.prototype.update = function(delta) {

  this.attrs.at ++;
  if(this.attrs.at >= this.attrs.period * delta){
    this.attrs.at -= this.attrs.period;
  }

  this.attrs.cycle = Math.sin(((2*Math.PI)/this.attrs.period)*this.attrs.at);
};

Actors.Cell.prototype.paint = function(view) {
  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);
  view.ctx.fillStyle = this.colors[this.attrs.type];
  switch(this.attrs.type){
    case 0:
    // water
    view.ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
    view.ctx.beginPath();
    view.ctx.rect(0, 0, 1, 1);
    view.ctx.fill();
    break;

    case 1:
    // land
    view.ctx.fillStyle = 'rgba(0, 255, 0, ' + (0.5 + (this.attrs.cycle*0.5)) + ')';
    view.ctx.beginPath();
    view.ctx.rect(0, 0, 1, 1);
    view.ctx.fill();
    break;

    case 2:
    // mountain
    view.ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
    view.ctx.beginPath();
    view.ctx.rect(0, 0, 1, 1);
    // view.ctx.beginPath();
    // view.ctx.moveTo(0, 1);
    // view.ctx.lineTo(0.5, 0);
    // view.ctx.lineTo(1, 1);
    view.ctx.fill();
    break;
 }

  if(this.attrs.city){
    view.ctx.save();
    view.ctx.translate(0.5, 0.5);
    view.ctx.scale(0.25, 0.25);
    view.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    view.ctx.beginPath();
    view.ctx.rect(-1, -1, 2, 2);
    view.ctx.fill();
    view.ctx.restore();
  }

  if(this.attrs.industry){
    view.ctx.fillStyle = '#444';
    view.ctx.beginPath();
    view.ctx.arc(0.5, 0.5, 0.15, 0, 2*Math.PI);
    view.ctx.fill();
  }

  if(this.attrs.reactor){
    view.ctx.save();
    view.ctx.translate(0.5, 0.5);
    view.ctx.scale(0.2, 0.2);
    view.ctx.strokeStyle = '#f0f';
    view.ctx.lineWidth = 0.2;
    view.ctx.beginPath();
    view.ctx.arc(0, 0, 1.5, 0, 2*Math.PI);
    view.ctx.stroke();
    view.ctx.restore();
  }

  view.ctx.save();
  view.ctx.translate(0.2, 0.85);
  view.ctx.scale(0.2, 0.2);
  view.ctx.fillStyle = '#fff';
  view.ctx.font = '1px ubuntu mono';
  view.ctx.textAlign = 'left';
  view.ctx.textBaseline = 'middle';
  //view.ctx.fillText(this.attrs.cycle.toFixed(2), 0, 0);
  view.ctx.restore();

  view.ctx.restore();

};
