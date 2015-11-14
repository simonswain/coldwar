/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.planet = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.planet.prototype = Object.create(Scene.prototype);

Scenes.planet.prototype.title = 'Planet';

Scenes.planet.prototype.init = function(){

  this.planet = new Actors.Planet(
    this.env, {
      scene: this
    },{
      a: 0,
      fake_species: true,
      standalone: true
    });

}

Scenes.planet.prototype.getCast = function(){
  return {
    Planet: Actors.Planet
  }
};

Scenes.planet.prototype.defaults = [{
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
  key: 'font_size',
  value: 24,
  min: 1,
  max: 160
}, {
  key: 'font_color',
  value: 4,
  min: 0,
  max: 7
}, {
  key: 'tick',
  info: '',
  value: 6,
  min: 1,
  max: 300
}, {
  key: 'hist_scale',
  info: '',
  value: 100,
  min: 100,
  max: 10000
}, {
  key: 'hist_len',
  info: '',
  value: 100,
  min: 100,
  max: 10000
}];

Scenes.planet.prototype.genAttrs = function(){
  return {
    tick: 0,
    hist_len: this.opts.max_x,
    hist: [],
    ships: 0
  };
};

Scenes.planet.prototype.update = function(delta){

  if(this.attrs.ships > 0 ){
    this.attrs.ships --;
  }

  this.planet.update(delta)

  var snap = false;

  this.attrs.tick += delta;
  if(this.attrs.tick > this.opts.tick){
    this.attrs.tick = 0;
    snap = true;
  }

  if(snap){

    var attrs = {
      at: this.env.at,
      agr: this.planet.attrs.agr,
      ind: this.planet.attrs.ind,
      pop: this.planet.attrs.pop,
      pol: this.planet.attrs.pol,
      ships: this.planet.refs.ships.length
    }

    this.attrs.hist.push(attrs);

    while(this.attrs.hist.length > this.opts.hist_len){
      this.attrs.hist.shift();
    }

    if(this.planet.refs.ships.length>0){
      this.attrs.ships = this.planet.refs.ships.length;
      this.planet.refs.ships = [];
    }

  }


}

Scenes.planet.prototype.paint = function(fx, gx, sx){
  this.paintData(gx);
  this.paintHist(gx);
  this.paintPie(fx);
  this.paintShips(fx);
  this.paintShips(gx);
}

Scenes.planet.prototype.paintShips = function(view){

  if(this.attrs.ships === 0){
    return;
  }

  view.ctx.save();

  view.ctx.translate(this.opts.max_x * 0.25, this.opts.max_y * 0.1);
  view.ctx.scale(0.5, 0.5);

  view.ctx.strokeStyle = '#fff';
  view.ctx.fillStyle = '#fff';

  var w = 5;
  var z = 8;
  for(var i = 0; i<this.attrs.ships; i++){

    // ship
    view.ctx.save();
    view.ctx.rotate(-Math.PI/2);
    view.ctx.strokeStyle = '#000';
    view.ctx.lineWidth = 1;
    view.ctx.beginPath();
    view.ctx.moveTo(z, 0);
    view.ctx.lineTo(-z, z);
    view.ctx.lineTo(-z * 0.5, 0);
    view.ctx.lineTo(-z, -z);
    view.ctx.lineTo(z, 0);
    view.ctx.closePath();
    view.ctx.stroke();
    view.ctx.fill();
    view.ctx.restore();

    // view.ctx.beginPath();
    // view.ctx.rect(i * w, -w/2, w, w);
    // view.ctx.lineTo(0, 0);
    // view.ctx.closePath();
    // view.ctx.fill();

  }
  view.ctx.restore();

}


Scenes.planet.prototype.paintPie = function(view){

  if(this.attrs.hist.length === 0){
    return;
  }

  view.ctx.save();
  view.ctx.translate(this.opts.max_x * 0.25, this.opts.max_y * 0.25);
  view.ctx.scale(0.5, 0.5);

  view.ctx.strokeStyle = '#444';

  var attrs;
  var val;
  var radius = this.opts.max_x / 3;
  var scale = 0.1 ; //(2*Math.PI) / 100

  var wedge, angle;
  var base = 0;
var f = 5;
  attrs = this.attrs.hist[this.attrs.hist.length-1];

  view.ctx.fillStyle = '#090';
  val = (attrs.agr/1000)/f;

  view.ctx.beginPath();
  view.ctx.arc(0, 0, radius, base, base + val);
  view.ctx.lineTo(0, 0);
  view.ctx.closePath();
  view.ctx.fill();
  base += val;

  view.ctx.fillStyle = '#69c';
  val = (attrs.pop/1000) / f;

  view.ctx.beginPath();
  view.ctx.arc(0, 0, radius, base, base + val);
  view.ctx.lineTo(0, 0);
  view.ctx.closePath();
  view.ctx.fill();
  base += val;

  view.ctx.fillStyle = '#fc0';
  val = (attrs.ind/1000)/f;

  view.ctx.beginPath();
  view.ctx.arc(0, 0, radius, base, base + val);
  view.ctx.lineTo(0, 0);
  view.ctx.closePath();
  view.ctx.fill();
  base += val;

  view.ctx.fillStyle = '#900';
  val = (attrs.pol)/f;

  view.ctx.beginPath();
  view.ctx.arc(0, 0, radius, base, base + val);
  view.ctx.lineTo(0, 0);
  view.ctx.closePath();
  view.ctx.fill();
  base += val;


  view.ctx.restore();

}

Scenes.planet.prototype.paintHist = function(view){

  if(this.attrs.hist.length === 0){
    return;
  }

  view.ctx.save();

  view.ctx.translate(0, this.opts.max_y/2);
  view.ctx.scale(1, 0.5);
  //view.ctx.translate(this.opts.max_x * 0.25, this.opts.max_y * 0.5);

  var limit = 10000;

  var attrs;
  var x;
  var val, base;

  var zero = this.attrs.hist[0].at
  var t = 0;

  var w = 1;
  var scale = 2;

  for(var i=0, ii=this.attrs.hist.length; i<ii; i++){
    attrs = this.attrs.hist[i];

    x = (attrs.at - zero) / this.opts.hist_scale;

    base = 0;

    val = (attrs.agr/2000) * scale;
    view.ctx.beginPath();
    view.ctx.fillStyle = '#090';
    view.ctx.rect(x, this.opts.max_y - val - base, w, val);
    view.ctx.fill();
    base += val;

    val = (attrs.pop/1000) * scale;
    view.ctx.beginPath();
    view.ctx.fillStyle = '#69c';
    view.ctx.rect(x, this.opts.max_y - val - base, w, val);
    view.ctx.fill();
    base += val;

    val = (attrs.ind/2000) * scale;
    view.ctx.beginPath();
    view.ctx.fillStyle = '#fc0';
    view.ctx.rect(x, this.opts.max_y - val - base, w, val);
    view.ctx.fill();
    base += val;

    val = (attrs.pol) * scale;
    view.ctx.beginPath();
    view.ctx.fillStyle = '#900';
    view.ctx.rect(x, this.opts.max_y - val - base, w, val);
    view.ctx.fill();
    base = val;


    view.ctx.beginPath();
    view.ctx.fillStyle = '#fff';
    view.ctx.rect(x, 0, w, attrs.ships);
    view.ctx.fill();

  }

  view.ctx.restore();

}


Scenes.planet.prototype.paintData = function(view){

  if(this.attrs.hist.length === 0){
    return;
  }

  view.ctx.save();

  view.ctx.fillStyle = '#fff';
  view.ctx.font = '7pt ubuntu mono, monospace';
  view.ctx.textBaseline = 'middle';

  var x, y;
  var val_x = this.opts.max_x * 0.8;
  var key_x = this.opts.max_x * 0.82;
  var y = this.opts.max_x * 0.1;
  var dy = this.opts.max_x * 0.1;

  var keys = ['pop','agr','ind','pol'];

  view.ctx.fillStyle = '#666';
  view.ctx.font = '5pt ubuntu mono, monospace';

  for(var i=0, ii=keys.length; i<ii; i++){
    view.ctx.textAlign = 'left';
    view.ctx.fillText(keys[i], key_x, y);
    y += dy;
  }

  var attrs = this.attrs.hist[this.attrs.hist.length-1];
  view.ctx.font = '6pt ubuntu mono, monospace';

  y = this.opts.max_x * 0.1;

  view.ctx.textAlign = 'right';
  view.ctx.fillStyle = '#090';
  view.ctx.fillText((attrs.agr/1000).toFixed(1), val_x, y);
  y += dy;

  view.ctx.textAlign = 'right';
  view.ctx.fillStyle = '#69c';
  view.ctx.fillText((attrs.pop/1000).toFixed(1), val_x, y);
  y += dy;

  view.ctx.textAlign = 'right';
  view.ctx.fillStyle = '#fc0';
  view.ctx.fillText((attrs.ind/1000).toFixed(1), val_x, y);
  y += dy;

  view.ctx.textAlign = 'right';
  view.ctx.fillStyle = '#900';
  view.ctx.fillText(attrs.pol.toFixed(1), val_x, y);
  y += dy;


  var x, y;
  var val_x = this.opts.max_x * 0.65;
  var key_x = this.opts.max_x * 0.65;
  var y = this.opts.max_x * 0.1
  var dy = this.opts.max_x * 0.1;

  view.ctx.fillStyle = '#666';

  var keys = ['birthrate','deathrate','agrup','indup'];
  view.ctx.font = '3pt ubuntu mono, monospace';

  for(var i=0, ii=keys.length; i<ii; i++){
    view.ctx.textAlign = 'right';
    view.ctx.fillText(keys[i], key_x, y - dy*0.2);
    view.ctx.textAlign = 'right';
    view.ctx.fillText(this.planet.attrs[keys[i]].toFixed(3), val_x, y + dy*0.2);
    y += dy;
  }

  view.ctx.restore();

}

Scenes.planet.prototype.help = [
'A simple planetary economy for producing space ships',
'The ecosystem must balance Agriculture, Population, Industry and Pollution',
]
