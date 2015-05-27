/*global Vec3:true, Boom:true, pickOne:true, hex2rgb */
/*jshint browser:true */
/*jshint strict:false */

function Supply(opts){

  this.color = opts.color;
  this.world = opts.world;
  this.capital = opts.capital;

  this.target = opts.target;
  this.units = opts.units || null; 
  this.stock = opts.stock || null;

  this.pos = new Vec3(opts.x, opts.y, 0);
  this.velo = new Vec3(); 

  this.speed = this.world.unit_speed * 1;

  this.supply_range = 8;

  this.dead = false;

}

Supply.prototype.update = function(delta){

  this.ttl --;

  if(!this.target || this.target.dead){
    this.dead = true;
    return;
  }

  // distance to target
  var range = this.pos.rangeXY(this.target.pos);
  if(range <= this.supply_range){
    if(this.units){
      this.target.addUnits(this.units);
    }
    if(this.stock){
      this.target.addStock(this.stock);
    }
    this.dead = true;
    return;
  }

  var vector = this.target.pos.minus(this.pos).normalize();
  vector.scale(this.speed);
  this.pos.add(vector);

};


Supply.prototype.paint = function(view){

  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);

  view.ctx.fillStyle= 'rgba(' + hex2rgb(this.color) + ', 0.5)';
  //view.ctx.fillStyle = this.color;
  view.ctx.beginPath();

  if(this.stock){
    // munitions
    view.ctx.fillRect(-2, -2, 4, 4);
  } else {
    // raw materials
    view.ctx.beginPath();     
    view.ctx.arc(0, 0, 2, 0, 2*Math.PI);
    view.ctx.closePath();     
    view.ctx.fill();
  }

  view.ctx.restore();

};


Supply.prototype.elevation = function(view){

  var scale = view.yscale;

  view.ctx.save();  
  view.ctx.translate(this.pos.x, (this.world.max_z - this.pos.z) * scale);

  view.ctx.fillStyle= 'rgba(' + hex2rgb(this.color) + ', 0.5)';
  //view.ctx.fillStyle = this.color;

  if(this.stock){
    // munitions
    view.ctx.fillRect(-3, -3, 2, 2);
  } else {
    // raw materials
    view.ctx.beginPath();     
    view.ctx.arc(-2, -2, 1, 0, 2*Math.PI);
    view.ctx.closePath();     
    view.ctx.fill();
  }

  view.ctx.restore();

};
