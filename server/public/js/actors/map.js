/*global Vec3:true, VecR:true, hex2rgb:true, Base:true, Sat:true, City:true, Factory:true */
/*jshint browser:true */
/*jshint strict:false */

function Map(opts) {

  this.pos = new Vec3(opts.x, opts.y, opts.z);
  this.color = opts.color || '#fff';
  this.color = '#f0f';

  this.title = opts.title || false;

  this.world = opts.world;

  this.outline = opts.outline || false;

}

Map.prototype.update = function(delta) {
};

Map.prototype.paint = function(view) {

  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);

  if(this.outline){

    view.ctx.save();
    view.ctx.translate(Math.random() - 0.5, Math.random() - 0.5);
    view.ctx.scale(1 + Math.random() * 0.02, 1 + Math.random() * 0.02);

    view.ctx.lineWidth = 4;

    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',0.4)';
    if(Math.random() < 0.1){
      view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',0.25)';
    }
    if(Math.random() < 0.01){
      view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',0.1)';
    }
    if(Math.random() < 0.01){
      view.ctx.lineWidth = 2;
    }
    view.ctx.beginPath();
    for(var i=0, ii=this.outline.length; i<ii; i++){
      if(this.outline[i][2]){
        view.ctx.stroke();
        view.ctx.beginPath();
        view.ctx.moveTo(this.outline[i][0], this.outline[i][1]);
      } else {
        view.ctx.lineTo(this.outline[i][0], this.outline[i][1]);
      }
    }
    view.ctx.stroke();
    view.ctx.restore();
  }

  if (this.title) {
    view.ctx.fillStyle = this.color;
    view.ctx.font = '10pt monospace';
    view.ctx.textBaseline = 'middle';
    view.ctx.textAlign = 'center';
    view.ctx.fillText(this.title, 0, 32);
  }

  view.ctx.restore();

};

Map.prototype.elevation = function(view) {

  var scale = view.yscale;

  view.ctx.save();
  view.ctx.translate(this.pos.x, ((this.world.max_z - this.pos.z) * scale));


  view.ctx.restore();

};
