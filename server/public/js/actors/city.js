/*global Vec3:true, Supply:true, pickOne: true, Abm: true */
/*jshint browser:true */
/*jshint strict:false */

function City(opts){
  this.pos = new Vec3(opts.x, opts.y, opts.z);
  this.color = opts.color || '#fff';

  this.title = opts.title || false;
  this.world = opts.world;
  this.capital = opts.capital;

  // production units
  this.units = 0;
  this.unit_rate = opts.unit_rate || 0;

  this.pop = 5 + Math.floor(Math.random() * 5);
  this.dead = false;

  this.distributions = false;
  this.timer = 0;
  this.checkpoint = 90 + (20*Math.random());

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

City.prototype.update = function(delta){

  this.timer += delta;

  if(this.timer > 15){
    this.distributions = false;
  }

  this.launchAbms();

  if(this.timer > this.checkpoint){
    this.timer = 0;
    this.distributeUnits();
  }

  this.units += this.unit_rate;

};

City.prototype.addStock = function(stock){
  this.stock.abms += stock.abms || 0;
};

City.prototype.distributeUnits = function(){

  if(this.units === 0){
    return;
  }

  if(!this.capital){
    return;
  }

 var i, ii, factories, targets, units;

  factories = this.world.factories;

  targets = [];
  for(i = 0, ii=factories.length; i<ii; i++){
    if(factories[i].capital === this.capital){
      targets.push(factories[i]);
    }
  }

  if(targets.length === 0){
    return;
  }

  units = Math.floor(this.units / targets.length);

  for(i = 0, ii=targets.length; i<ii; i++){
    this.world.supplies.push(new Supply({
      x: this.pos.x,
      y: this.pos.y,
      world: this.world,
      color: this.color,
      capital: this.capital,
      target: targets[i],
      units: units
    }));
    this.units = this.units - units;
  }

  this.distributions = targets;

};


City.prototype.launchAbms = function(){

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


City.prototype.paint = function(view){

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
  view.ctx.lineWidth = 4;

  view.ctx.beginPath();
  view.ctx.arc(0, 0, 12, 0, 2*Math.PI);
  view.ctx.stroke();
  view.ctx.fillStyle = '#000';
  view.ctx.fill();

  view.ctx.fillStyle = this.color;
  view.ctx.font = '9pt monospace';
  view.ctx.textBaseline = 'middle';
  view.ctx.textAlign = 'center';

  //view.ctx.fillText(this.pop + 'M', 0, 0);
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

City.prototype.elevation = function(view){

  var scale = view.yscale;

  view.ctx.save();
  view.ctx.translate(this.pos.x, ((this.world.max_z - this.pos.z) * scale) - 1);

  view.ctx.lineWidth = 2;
  view.ctx.strokeStyle = this.color;
  view.ctx.fillStyle = '#000';
  view.ctx.beginPath();
  view.ctx.arc(0, -6, 6, 0, 2*Math.PI);
  view.ctx.stroke();
  view.ctx.fill();

  view.ctx.restore();

};
