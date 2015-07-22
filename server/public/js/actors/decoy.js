/*global Vec3:true, pickOne: true, Icbm: true, Fighter: true, Bomber: true, Abm: true */
/*jshint browser:true */
/*jshint strict:false */

// dummy target for attract mode

function Decoy(opts){
  this.pos = new Vec3(opts.x, opts.y, opts.z);
  this.world = opts.world;
  this.capital = opts.capital;
  this.hidden = opts.hidden || false;
  this.color = opts.color || '#fff';
  this.dead = false;

  this.bombers = opts.bombers || 0;
  this.fighters = opts.fighters || 0;
  this.icbms = opts.icbms || 0;
  this.abms = opts.abms || 0;

  this.bombers_launched = 0;
  this.fighters_launched = 0;
  this.icbms_launched = 0;
  this.abms_launched = 0;

}

Decoy.prototype.update = function(delta){
  this.launch();
  this.launchAbms();
};

Decoy.prototype.destroy = function(){
};

Decoy.prototype.launch = function(){

  var targets, target;

  var i, ii;

  targets = [];

  for(i = 0, ii=this.world.decoys.length; i<ii; i++){
    if(this.world.decoys[i].capital !== this.capital){
      targets.push(this.world.decoys[i]);
    }
  }

  if(targets.length > 0 && this.bombers_launched < this.bombers){
    target = pickOne(targets);
    this.world.bombers.push(new Bomber({
      x: this.pos.x,
      y: this.pos.y,
      world: this.world,
      base: this,
      capital: this.capital,
      target: target,
      color: this.color
    }));
    this.bombers_launched ++;
  }

  if(targets.length > 0 && this.icbms_launched < this.icbms){
    target = pickOne(targets);
    this.world.icbms.push(new Icbm({
      x: this.pos.x,
      y: this.pos.y,
      world: this.world,
      base: this,
      capital: this.capital,
      target: target,
      color: this.color
    }));
    this.icbms_launched ++;
  }


  if(this.fighters_launched < this.fighters){
    this.world.fighters.push(new Fighter({
      x: this.pos.x,
      y: this.pos.y,
      world: this.world,
      base: this,
      capital: this.capital,
      color: this.color
    }));
    this.fighters_launched ++;
  }

};

Decoy.prototype.launchAbms = function(){

  var launched_this_tick = 0;
  var range, targets, target;

  if(this.abms_launched > this.abms){
    return;
  }

  targets = [];

  var danger = (this.world.max_x) * 0.2;
  var icbm;

  for(var i = 0, ii=this.world.icbms.length; i<ii; i++){

    icbm = this.world.icbms[i];

    if(icbm.dead){
      continue;
    }

    if(icbm.capital === this.capital){
      continue;
    }

    if(Math.abs(icbm.pos.x - this.pos.x) < danger){
      targets.push(icbm);
    }
  }

  if(targets.length === 0){
    return;
  }

  while(this.abms_launched < this.abms){

    target = pickOne(targets);

    this.world.abms.push(new Abm({
      x: this.pos.x,
      y: this.pos.y,
      world: this.world,
      base: this,
      target: target,
      color: this.color
    }));

    this.abms_launched ++;
  }

};


Decoy.prototype.paint = function(view){

  if(this.hidden){
    return;
  }

  var i, ii;

  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);

  view.ctx.strokeStyle = this.color;
  view.ctx.lineWidth = 2;

  view.ctx.beginPath();
  view.ctx.moveTo(12, -12);
  view.ctx.lineTo(-12, 12);
  view.ctx.stroke();

  view.ctx.beginPath();
  view.ctx.moveTo(12, 12);
  view.ctx.lineTo(-12, -12);
  view.ctx.stroke();

  view.ctx.restore();
};


Decoy.prototype.elevation = function(view){

  if(this.hidden){
    return;
  }

  var scale = view.yscale;

  view.ctx.save();
  view.ctx.translate(this.pos.x, ((this.world.max_z - this.pos.z) * scale) - 1);

  view.ctx.strokeStyle = this.color;
  view.ctx.lineWidth = 1;

  view.ctx.beginPath();
  view.ctx.moveTo(-6, -12);
  view.ctx.lineTo(6, 0);
  view.ctx.stroke();

  view.ctx.beginPath();
  view.ctx.moveTo(6, -12);
  view.ctx.lineTo(-6, 0);
  view.ctx.stroke();

  view.ctx.restore();

};
