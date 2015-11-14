/*global Vec3:true, Supply:true, Abm: true, pickOne: true */
/*jshint browser:true */
/*jshint strict:false */

function Factory(opts){

  this.pos = new Vec3(opts.x, opts.y, opts.z);
  this.world = opts.world;
  this.capital = opts.capital || false;
  this.color = opts.color || '#fff';

  this.title = opts.title || false;

  this.units = opts.units || 0;

  this.dead = false;

  this.distributions = false;
  this.timer = 0;
  this.checkpoint = 230 + (40*Math.random());

  this.amount = {
    bombers: 0,
    fighters: 0,
    icbms: 0,
    abms: 0
  };

  this.abms_launched = 0;
  this.abm_launch_max = opts.abm_launch_max || 0;
  this.abm_launch_per_tick = opts.abm_launch_per_tick || 1;

  this.stock = {
    abms: 0
  };

  if(opts.stock){
    this.stock.abms = opts.stock.abms || 0;
  }

}

Factory.prototype.update = function(delta){

  this.timer += delta;

  if(this.timer > 15){
    this.distributions = false;
  }

  this.launchAbms();

  if(this.timer > this.checkpoint){
    this.timer = 0;
    this.makeMunitions();
  }

};

// city will add units to factory
Factory.prototype.addUnits = function(units){
  this.units += units;
};

// factory makes munitions for base
Factory.prototype.makeMunitions = function(){

  if(this.units === 0){
    return;
  }

  if(!this.capital){
    return;
  }

 var i, ii, bases, targets, stock;

  bases = this.world.bases;

  targets = [];
  for(i = 0, ii=bases.length; i<ii; i++){
    if(bases[i].capital === this.capital){
      targets.push(bases[i]);
    }
  }

  if(targets.length === 0){
    return;
  }


  this.amount.bombers += 0.025 * this.units;
  this.amount.fighters += 0.05 * this.units;
  this.amount.icbms += 0.001 * this.units;
  this.amount.abms += 0.01 * this.units;

  this.units = 0;

  stock = {
    bombers: Math.floor(this.amount.bombers),
    fighters: Math.floor(this.amount.fighters),
    icbms: Math.floor(this.amount.icbms),
    abms: Math.floor(this.amount.abms)
  };

  this.amount = {
    bombers: this.amount.bombers - stock.bombers,
    fighters: this.amount.fighters - stock.fighters,
    icbms: this.amount.icbms - stock.icbms,
    abms: this.amount.abms - stock.abms
  };

  for(i = 0, ii=targets.length; i<ii; i++){
    this.world.supplies.push(new Supply({
      x: this.pos.x,
      y: this.pos.y,
      world: this.world,
      color: this.color,
      capital: this.capital,
      target: targets[i],
      stock: stock
    }));
    //targets[i].addStock(amount);
    //this.units = this.units - amount;
  }

  this.distributions = targets;

};

Factory.prototype.launchAbms = function(){

  var launched_this_tick = 0;
  var range, targets, target;

  var abm_cost = 10;

  if(this.units.abms < abm_cost || this.stock.abms < 1){
    return;
  }

  if(this.abms_launched >= this.abm_launch_max){
    return;
  }

  targets = [];

  var midway = this.world.max_x/2;
  var icbm;

  for(var i = 0, ii=this.world.icbms.length; i<ii; i++){
    icbm = this.world.icbms[i];
    if(icbm.dead){
      continue;
    }
    if(icbm.capital === this.capital){
      continue;
    }
    if(this.pos.x < midway){
      if(icbm.pos.x < midway){
        targets.push(icbm);
      }
    } else {
      if(icbm.pos.x > midway){
        targets.push(icbm);
      }
    }
  }

  if(targets.length === 0){
    return;
  }
  while((this.stock.abms > 0 || this.units > abm_cost) && this.abms_launched < this.abm_launch_max && launched_this_tick < this.abm_launch_per_tick){

    target = pickOne(targets);
    this.world.abms.push(new Abm({
      x: this.pos.x,
      y: this.pos.y,
      world: this.world,
      base: this,
      target: target,
      color: this.color
    }));

    launched_this_tick ++;
    this.abms_launched ++;
    if(this.stock.abms > 0){
      this.stock.abms = this.stock.abms - 1;
    } else {
      this.units = this.units - abm_cost --;
    }
  }

};


Factory.prototype.paint = function(view){

  var i, ii, target;

  // if(this.distributions){
  //   view.ctx.lineWidth = 1;
  //   view.ctx.strokeStyle=this.color;
  //   for(i = 0, ii=this.distributions.length; i<ii; i++){
  //     target = this.distributions[i];
  //     view.ctx.beginPath();
  //     view.ctx.moveTo(this.pos.x, this.pos.y);
  //     view.ctx.lineTo(target.pos.x, target.pos.y);
  //     view.ctx.stroke();
  //   }
  // }


  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);

  view.ctx.strokeStyle = this.color;
  view.ctx.lineWidth = 2;

  view.ctx.beginPath();
  view.ctx.moveTo(0, -12);
  view.ctx.lineTo(12, 12);
  view.ctx.lineTo(-12, 12);
  view.ctx.closePath();
  view.ctx.fillStyle = '#000';
  view.ctx.fill();
  view.ctx.stroke();
  view.ctx.closePath();

  view.ctx.fillStyle = this.color;
  view.ctx.font = '9pt monospace';
  view.ctx.textBaseline = 'middle';
  view.ctx.textAlign = 'center';

  if(this.units>0){
    view.ctx.fillText(this.units.toFixed(0), 0, -24);
  }

  if(this.title){
    view.ctx.fillStyle = this.color;
    view.ctx.font = '10pt monospace';
    view.ctx.textBaseline = 'middle';
    view.ctx.textAlign = 'center';
    view.ctx.fillText(this.title, 0, 32);
  }

  view.ctx.restore();
};


Factory.prototype.elevation = function(view){

  var scale = view.yscale;

  view.ctx.save();
  view.ctx.translate(this.pos.x, ((this.world.max_z - this.pos.z) * scale) - 1);

  view.ctx.strokeStyle = this.color;
  view.ctx.fillStyle = '#000';
  view.ctx.lineWidth = 2;

  view.ctx.beginPath();
  view.ctx.moveTo(-6, 0);
  view.ctx.lineTo(0, -12);
  view.ctx.lineTo(6, 0);
  view.ctx.closePath();
  view.ctx.stroke();
  view.ctx.fill();

  view.ctx.restore();

};
