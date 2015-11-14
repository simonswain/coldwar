/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Crt = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Crt.prototype = Object.create(Actor.prototype);

Actors.Crt.prototype.title = 'Crt';

Actors.Crt.prototype.genAttrs = function(attrs){

  var lines = this.opts.text.split("\n");

  return {
    lines: attrs.lines || lines,
    text: attrs.lines ? attrs.lines.join("\n") : lines.join("\n"),
    scanline_offset: 0,
    a: 0,
    ix: 0,
    iy: 0,
    count: 0,
    finished: false
  };
};

Actors.Crt.prototype.colors = [
  '#000',
  '#0ff',
  '#f00',
  '#f0f',
  '#0f0',
  '#0ff',
  '#00f',
  '#fff',
];

Actors.Crt.prototype.init = function(){
};

Actors.Crt.prototype.defaults = [{
  key: 'text',
  type: 'text',
  value: 'Joshua: Greetings, Professor Falken.' + "\n" + 'Falken: Hello, Joshua.' + "\n" + 'Joshua: A strange game.' + "\n" + 'Joshua: The only winning move is not to play.' + "\n" + 'Joshua: How about a nice game of chess?',
  max_length: 144
}, {
  key: 'delay',
  value: 5,
  min: 0.1,
  max: 240
}, {
  key: 'rows',
  value: 9,
  min: 1,
  max: 24
}, {
  key: 'cols',
  value: 16,
  min: 1,
  max: 80
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
  key: 'cursor_color',
  value: 5,
  min: 0,
  max: 7
}, {
  key: 'horizap',
  value: 0.1,
  min: 0,
  max: 1,
  step: 0.1,
}, {
  key: 'scanlines',
  value: 1,
  min: 0,
  max: 1
}, {
  key: 'scanline_row',
  value: 16,
  min: 2,
  max: 32
}, {
  key: 'scanline_width',
  value: 2,
  min: 1,
  max: 8
}, {
  key: 'scanline_slew',
  value: 2,
  min: 1,
  max: 8
}, {
  key: 'scanline_color',
  value: 7,
  min: 0,
  max: 7
}, {
  key: 'scanline_alpha',
  value: 0.15,
  min: 0.05,
  max: 1,
  step: 0.05
}, {
  key: 'jitter_chance',
  value: 0.02,
  min: 0.01,
  max: 0.1,
  step: 0.01
}, {
  key: 'jitter_scale',
  value: 64,
  min: 0,
  max: 256,
}, {
  key: 'reveal',
  value: 1,
  min: 0,
  max: 0
}];


Actors.Crt.prototype.update = function(delta) {

  this.attrs.a += delta;
  if(this.attrs.a > this.opts.delay){
    this.attrs.a -= this.opts.delay;
    this.attrs.ix ++;
    if(this.attrs.ix >= this.opts.cols){
      this.attrs.ix = 0;
      this.attrs.iy ++;
      if(this.attrs.iy >= this.attrs.rows){
        this.attrs.iy = 0;
      }
    }
  }

  if(!this.attrs.finished){
    this.attrs.count += (delta / this.opts.delay);
    if(this.attrs.count >= this.attrs.text.length){
      this.finished = true;
      this.attrs.count = this.attrs.text.length;
      //this.attrs.count = 0;
    }
  }

  this.attrs.scanline_offset = this.attrs.scanline_offset + 0.25 * delta;
  if(this.attrs.scanline_offset >= this.opts.scanline_row){
    this.attrs.scanline_offset = 0;
  }

};


Actors.Crt.prototype.flash = function(fx, gx) {


  this.flashHorizap(fx, gx);

  // random flash
  if(Math.random() < 0.005){
    fx.ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    fx.ctx.fillRect(0, 0, fx.w, fx.h);
  }

  if (Math.random() < 0.01) {
    fx.ctx.fillStyle = 'rgba(0, 255, 255, 1)';
    fx.ctx.fillRect(0, 0, fx.w, fx.h);
  }

  if (Math.random() < 0.01) {
    fx.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    fx.ctx.fillRect(0, 0, fx.w, fx.h);
  }

  if (Math.random() < 0.0001) {
    fx.ctx.fillStyle = 'rgba(255, 0, 255, 1)';
    fx.ctx.fillRect(0, 0, fx.w, fx.h);
  }

  this.flashScanlines(fx, gx);

};


Actors.Crt.prototype.paint = function(fx, gx) {

  //this.paintCursor(fx, gx);

  switch(this.opts.reveal){
  case 1:
    this.typeCode(fx, gx);
    break;
  default:
    this.paintCode(fx, gx);
    break;
  }

};

Actors.Crt.prototype.paintCode = function(fx, gx) {

  gx.ctx.fillStyle = this.colors[this.opts.font_color];

  if(Math.random() < 0.05){
    gx.ctx.fillStyle = '#099';
  }
  if(Math.random() < 0.01){
    gx.ctx.fillStyle = '#066';
  }
  gx.ctx.font = this.opts.font_size + 'px ubuntu mono';
  gx.ctx.textAlign = 'center';
  gx.ctx.textBaseline = 'middle';

  gx.ctx.save();

  if(Math.random() < 0.01){
    fx.ctx.translate((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16);
  }

  var ystep = this.refs.scene.opts.max_y / this.opts.rows;

  var yy = ((this.opts.rows / 2) - (this.attrs.lines.length/2)) * ystep;
  for(var i=0; i<this.attrs.lines.length; i++){
    gx.ctx.save();
    if(Math.random() < 0.0025){
      gx.ctx.rotate(2*Math.PI * Math.random());
    }
    gx.ctx.translate(Math.random() * 1, Math.random() * 1);
    gx.ctx.fillText(this.attrs.lines[i], this.refs.scene.opts.max_x * 0.5, yy );
    gx.ctx.restore();
  }
  gx.ctx.restore();
};

Actors.Crt.prototype.typeCode = function(fx, gx) {

  var xstep = this.refs.scene.opts.max_x / this.opts.cols;
  var ystep = this.refs.scene.opts.max_y / this.opts.rows;

  var count = Math.floor(this.attrs.count);

  fx.ctx.fillStyle = this.colors[this.opts.font_color];

  fx.ctx.font = this.opts.font_size + 'px ubuntu mono';
  fx.ctx.textAlign = 'left';
  fx.ctx.textBaseline = 'top';

  fx.ctx.save();
  fx.ctx.translate(ystep, xstep);

  var y = 0;
  var x = 0;
  var ix = 0;

  if(Math.random() < this.opts.jitter_chance){
    fx.ctx.translate(
      (Math.random() - 0.5) * this.opts.jitter_scale,
      (Math.random() - 0.5) * this.opts.jitter_scale
    );
  }

  for (var i = 0; i <= count; i++){
    if(this.attrs.text.substr(i, 1) === "\n"){
      ix += x + 1;
      x = 0;
      y ++;
      continue;
    }
    fx.ctx.fillText(this.attrs.text.substr(ix, x), 0, y * ystep );
    x ++;
  }

  fx.ctx.restore();
};

Actors.Crt.prototype.paintCursor = function(fx, gx) {

  var xstep = this.refs.scene.opts.max_x / this.opts.cols;
  var ystep = this.refs.scene.opts.max_y / this.opts.rows;

  gx.ctx.fillStyle = this.colors[this.opts.cursor_color];

  gx.ctx.rect(this.attrs.ix * xstep, this.attrs.iy * ystep, xstep, ystep);
  gx.ctx.fill();
};

Actors.Crt.prototype.flashHorizap = function(fx, gx){
  fx.ctx.strokeStyle = '#fff';
  fx.ctx.lineWidth = 1;
  var yy = Math.random() * fx.h;
  if (Math.random() < 0.1) {
    fx.ctx.beginPath();
    fx.ctx.moveTo(0, yy);
    fx.ctx.lineTo(fx.w, yy);
    fx.ctx.stroke();
  }
};

Actors.Crt.prototype.flashScanlines = function(fx, gx){
  gx.ctx.strokeStyle= 'rgba(' + hex2rgb(this.colors[this.opts.scanline_color]) + ', ' + this.opts.scanline_alpha + ')';
  gx.ctx.lineWidth = this.opts.scanline_line;
  for(var i=0; i<gx.h; i+= this.opts.scanline_row){
    gx.ctx.beginPath();
    gx.ctx.moveTo(0, i - this.attrs.scanline_offset);
    gx.ctx.lineTo(gx.w, i - this.opts.scanline_slew - this.attrs.scanline_offset);
    gx.ctx.stroke();
  }
};
