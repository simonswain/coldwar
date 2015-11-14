/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.frequency = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.frequency.prototype = Object.create(Scene.prototype);

Scenes.frequency.prototype.title = 'Frequency';

Scenes.frequency.prototype.layout = '';

Scenes.frequency.prototype.init = function(){
}


Scenes.frequency.prototype.getCast = function(){
  return {
  }
};

Scenes.frequency.prototype.defaults = [{
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
  key: 'r',
  info: '',
  value: 120,
  min: 1,
  max: 1024
}, {
  key: 'point_size',
  info: '',
  value: 8,
  min: 1,
  max: 32
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
  key: 'hist_len',
  value: 320,
  min: 0,
  max: 1024
}, {
  key: 'hist_scale',
  info: '',
  value: 1,
  min: 0.1,
  max: 4
}];

Scenes.frequency.prototype.genAttrs = function(){
  return {
    t: 0,
    a: 0,
    x: 0,
    y: 0,
    hist: []
  };
};

Scenes.frequency.prototype.update = function(delta){

  this.attrs.t += delta * this.opts.hist_scale;
  this.attrs.hist.unshift([this.attrs.t, this.attrs.a, this.attrs.y]);

  while(this.attrs.hist.length > this.opts.hist_len){
    this.attrs.hist.pop();
  }

  this.attrs.a += delta/50;
  this.attrs.a = this.attrs.a % (2*Math.PI);
  this.attrs.d = (180/Math.PI) * this.attrs.a;

  this.attrs.x = Math.cos(this.attrs.a) * this.opts.r
  this.attrs.y = Math.sin(this.attrs.a) * this.opts.r;

}

Scenes.frequency.prototype.paint = function(fx, gx, sx){
  this.paintHist(gx);
  this.paintCircle(gx);
  this.paintData(gx);
}

Scenes.frequency.prototype.paintData = function(view){
  view.ctx.fillStyle = '#fff';
  view.ctx.font = this.opts.font_size + 'px ubuntu mono';
  view.ctx.textAlign = 'left';
  view.ctx.textBaseline = 'middle';
  view.ctx.fillText(this.attrs.a.toFixed(2), this.opts.max_x * 0.1, this.opts.max_y * 0.1 );

};

Scenes.frequency.prototype.paintCircle = function(view){

  view.ctx.save();
  view.ctx.translate(this.opts.max_x/2, this.opts.max_y/2);
  view.ctx.strokeStyle = '#fff';
  view.ctx.fillStyle = '#fff';
  //view.ctx.lineWidth = 10;

  view.ctx.strokeStyle = '#666';
  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.opts.r, 0, 2*Math.PI);
  view.ctx.stroke();

  view.ctx.strokeStyle = '#666';
  view.ctx.beginPath();
  view.ctx.moveTo(0, 0);
  view.ctx.lineTo(this.attrs.x, this.attrs.y);
  view.ctx.stroke();

  view.ctx.fillStyle='hsla(' + this.attrs.d +', 100%, 50%, 1)';
  view.ctx.beginPath();
  view.ctx.arc(this.attrs.x, this.attrs.y, this.opts.point_size, 0, 2*Math.PI);
  view.ctx.fill();

  view.ctx.restore();

}

Scenes.frequency.prototype.paintHist = function(view){

  view.ctx.save();
  //view.ctx.translate(0, this.opts.max_y/2);
  view.ctx.translate(this.opts.max_x * 0.25, this.opts.max_y * 0.5);

  view.ctx.strokeStyle = '#444';
  view.ctx.lineWidth = 2;

  var t = this.attrs.hist[0][0];
  var x = 0;
  var y = this.attrs.hist[0][2];

  view.ctx.beginPath();
  view.ctx.moveTo(x, y);
  for(var i=0, ii=this.attrs.hist.length; i<ii; i++){
    x -= (this.attrs.hist[i][0] - t);
    t = this.attrs.hist[i][0];
    y = this.attrs.hist[i][2]
    view.ctx.lineTo(x, y);
  }
  view.ctx.stroke();

  view.ctx.restore();

}

Scenes.frequency.prototype.getHelp = function(){
  return '';
};
