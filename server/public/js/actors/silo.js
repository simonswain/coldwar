/*global Vec3:true, Interceptor:true, pickOne:true */
/*jshint browser:true */
/*jshint strict:false */

function Silo(opts){

  this.booms = opts.booms;
  this.bombs = opts.bombs;
  this.interceptors = opts.interceptors;

  this.h = opts.h || Infinity;

  this.pos = new Vec3(
    opts.x, 
    opts.y
  );

  this.launch_max = opts.launch_max || 1;
  this.launch_per_tick = opts.launch_per_tick || 1;
  this.stock = opts.stock || 1000;
  this.color = opts.color || '#fff';

  // interceptor reduces this count to false when it dies
  this.launched = 0;

  this.timer = 0;
  this.flash = false;

  this.dead = false;

}

Silo.prototype.update = function(delta){

  var bomb;
  var launched_this_tick = 0;

  while(this.stock > 0 && this.launched < this.launch_max && launched_this_tick < this.launch_per_tick){

    bomb = pickOne(this.bombs);

    if(!bomb){
      break;
    }

    if(bomb.h > this.h * 0.8){
      launched_this_tick ++;
      continue;
    }

    this.interceptors.push(new Interceptor({
      x: this.pos.x,
      y: this.pos.y,
      silo: this,
      target: bomb,
      booms: this.booms,
      bombs: this.bombs
    }));

    this.launched ++;
    launched_this_tick ++;
    this.stock --;
  }

  this.timer += delta;

  if(this.timer > 10){
    this.flash = false;
  }


  if(this.timer > 75){
    this.timer = 0;
    this.flash = true;
  }

};

Silo.prototype.paint = function(view){
  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);

  view.ctx.strokeStyle = this.color;
  view.ctx.fillStyle = '#000';
  view.ctx.lineWidth= 2;
  
  if(this.flash){
    view.ctx.fillStyle = this.color;
  } else {
    view.ctx.fillStyle = '#000';
  }

  view.ctx.beginPath();
  view.ctx.fillRect(-16, -16, 32, 32);
  view.ctx.strokeRect(-16, -16, 32, 32);

  view.ctx.fillStyle = '#0cc';
  view.ctx.font = '12pt monospace';
  view.ctx.textBaseline = 'middle';
  view.ctx.textAlign = 'center';
  view.ctx.fillText(this.stock, 0,  32);

  view.ctx.restore();
};
