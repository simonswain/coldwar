/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Scanlines = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Scanlines.prototype = Object.create(Actor.prototype);

Actors.Scanlines.prototype.title = 'Scanlines';

Actors.Scanlines.prototype.genAttrs = function(attrs){
  return {
    offset: 0
  };
};

Actors.Scanlines.prototype.init = function(){
};

Actors.Scanlines.prototype.defaults = [{
  key: 'row_height',
  value: 16,
  min: 2,
  max: 32
}, {
  key: 'line_width',
  value: 2,
  min: 1,
  max: 8
}, {
  key: 'slew',
  value: 2,
  min: 1,
  max: 8
}];

Actors.Scanlines.prototype.update = function(delta){
  this.attrs.offset = this.attrs.offset + 0.25 * delta;
  if(this.attrs.offset >= this.opts.row_height){
    this.attrs.offset = 0;
  }
};

Actors.Scanlines.prototype.flash = function(fx, gx){
  for(var i=0; i<gx.h; i+= this.opts.row_height){
    gx.ctx.beginPath();
    gx.ctx.strokeStyle= 'rgba(255, 255, 255, 0.15)';
    gx.ctx.lineWidth = this.opts.line_width;
    gx.ctx.moveTo(0, i - this.attrs.offset);
    gx.ctx.lineTo(gx.w, i - this.opts.slew - this.attrs.offset);
    gx.ctx.stroke();
  }
};

Actors.Scanlines.prototype.paint = function(fx, gx){
};

