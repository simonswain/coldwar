/*global Vec3:true, pickOne:true, Bomber:true, Fighter:true, Icbm:true, Abm:true */
/*jshint browser:true */
/*jshint strict:false */

function Base(opts){

  this.dead = false;

  this.pos = new Vec3(opts.x, opts.y, opts.z);
  this.capital = opts.capital || false;

  this.title = opts.title || false;

  this.color = opts.color || '#fff';

  this.stock = {
    bombers: 0,
    fighters: 0,
    icbms: 0,
    abms: 0
  };

  if(opts.stock){
    this.stock.bombers = opts.stock.bombers || 0;
    this.stock.fighters = opts.stock.fighters || 0;
    this.stock.icbms = opts.stock.icbms || 0;
    this.stock.abms = opts.stock.abms || 0;
  }

  this.world = opts.world;

  this.icbms_launched = 0;
  this.icbm_launch_max = opts.icbm_launch_max || 0;
  this.icbm_launch_per_tick = opts.icbm_launch_per_tick || 1;

  this.abms_launched = 0;
  this.abm_launch_max = opts.abm_launch_max || 0;
  this.abm_launch_per_tick = opts.abm_launch_per_tick || 1;

  this.bombers_launched = 0;
  this.bomber_launch_max = opts.bomber_launch_max || 0;
  this.bomber_launch_per_tick = opts.bomber_launch_per_tick || 1;

  this.fighters_launched = 0;

  this.fighter_launch_max = opts.fighter_launch_max || 0;
  this.fighter_launch_per_tick = opts.fighter_launch_per_tick || 1;

  // launch fighters when bombers within this range
  this.danger_close = 400;

}

Base.prototype.update = function(delta){
  this.launchBombers();
  this.launchFighters();
  this.launchIcbms();
  this.launchAbms();
};

// factory will add stock to base
Base.prototype.addStock = function(stock){
  this.stock.bombers += stock.bombers || 0;
  this.stock.fighters += stock.fighters || 0;
  this.stock.icbms += stock.icbms || 0;
  this.stock.abms += stock.abms || 0;
};



Base.prototype.launchBombers = function(){

  if(this.capital.defcon > 3 && !this.capital.strike){
    return;
  }

  var launched_this_tick = 0;
  var targets, target;

  var i, ii;

  if(!this.capital){
    return;
  }

  if(this.stock.bombers <= 0 || this.bombers_launched >= this.bomber_launch_max){
    return;
  }

  targets = [];

  if(targets.length === 0){
    for(i = 0, ii=this.world.factories.length; i<ii; i++){
      if(this.world.factories[i].capital !== this.capital){
        targets.push(this.world.factories[i]);
      }
    }
  }

  if(targets.length === 0){
    for(i = 0, ii=this.world.cities.length; i<ii; i++){
      if(this.world.cities[i].capital !== this.capital){
        targets.push(this.world.cities[i]);
      }
    }
  }

  // only attack capital if nothing else left
  if(targets.length === 0){
    for(i = 0, ii=this.world.capitals.length; i<ii; i++){
      if(this.world.capitals[i] !== this.capital){
        targets.push(this.world.capitals[i]);
      }
    }
  }

  if(targets.length === 0){
    for(i = 0, ii=this.world.bases.length; i<ii; i++){
      if(this.world.bases[i].capital !== this.capital){
        targets.push(this.world.bases[i]);
      }
    }
  }

  if(targets.length === 0){
    return;
  }

  while(this.stock.bombers > 0 && this.bombers_launched < this.bomber_launch_max && launched_this_tick < this.bomber_launch_per_tick){

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
    launched_this_tick ++;
    this.bombers_launched ++;
    this.stock.bombers --;
  }

};


Base.prototype.launchFighters = function(){

  if(this.capital.defcon > 4){
    return;
  }

  var targets, target;
  var i, ii;

  var launched_this_tick = 0;

  if(!this.capital){
    return;
  }

  if(this.stock.fighters <= 0 || this.fighter_launch_max < this.fighters_launched){
    return;
  }

  targets = [];

  // if any bomber is in range, then attack. Later, this logic should
  // use warnings from sats or capital

  // incoming bomber detection
  // for(i = 0, ii=this.world.bombers.length; i<ii; i++){
  //   target = this.world.bombers[i];

  //   if(target.capital === this.capital){
  //     continue;
  //   }

  //   if(this.pos.range(target.pos) < this.danger_close){
  //     targets.push(target);
  //     break;
  //   }
  // }

  // if(targets.length === 0){
  //   return;
  // }

  while(this.stock.fighters > 0 && this.fighters_launched < this.fighter_launch_max && launched_this_tick < this.fighter_launch_per_tick){

    // fighter will pick it's own target

    this.world.fighters.push(new Fighter({
      x: this.pos.x,
      y: this.pos.y,
      world: this.world,
      base: this,
      capital: this.capital,
      color: this.color
    }));
    launched_this_tick ++;
    this.fighters_launched ++;
    this.stock.fighters --;
  }

};


Base.prototype.launchIcbms = function(){

  if(this.capital.defcon > 3){
    return;
  }

  // 1% chance if defcon 3 or 2
  if(this.capital.defcon > 1 && Math.random() > 0.001){
    return;
  }

  var launched_this_tick = 0;
  var targets, target;

  var i, ii;

  if(!this.capital){
    return;
  }

  if(this.stock.icbms <= 0 || this.icbms_launched > this.icbm_launch_max){
    return;
  }

  targets = [];

  if(targets.length === 0){
    for(i = 0, ii=this.world.capitals.length; i<ii; i++){
      if(this.world.capitals[i] !== this.capital){
        targets.push(this.world.capitals[i]);
      }
    }
  }

  for(i = 0, ii=this.world.factories.length; i<ii; i++){
    if(this.world.factories[i].capital !== this.capital && !this.world.factories[i].dead){
      targets.push(this.world.factories[i]);
    }
  }

  for(i = 0, ii=this.world.bases.length; i<ii; i++){
    if(this.world.bases[i].capital !== this.capital && !this.world.bases[i].dead){
      targets.push(this.world.bases[i]);
    }
  }

  for(i = 0, ii=this.world.cities.length; i<ii; i++){
    if(this.world.cities[i].capital !== this.capital && !this.world.cities[i].dead){
      targets.push(this.world.cities[i]);
    }
  }


  if(targets.length === 0){
    return;
  }

  while(this.stock.icbms > 0 && this.icbms_launched < this.icbm_launch_max && launched_this_tick < this.icbm_launch_per_tick){

    target = pickOne(targets);

    this.world.icbms.push(new Icbm({
      x: this.pos.x,
      y: this.pos.y,
      z: this.pos.z,
      base: this,
      world: this.world,
      capital: this.capital,
      target: target,
      color: this.color
    }));

    launched_this_tick ++;
    this.icbms_launched ++;
    this.stock.icbms --;
  }

};

Base.prototype.launchAbms = function(){

  var launched_this_tick = 0;
  var range, targets, target;

  if(this.stock.abms <= 0 || this.abms_launched >= this.abm_launch_max){
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

  while(this.stock.abms > 0 && this.abms_launched < this.abm_launch_max && launched_this_tick < this.abm_launch_per_tick){

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
    this.stock.abms --;
  }

};

Base.prototype.paint = function(view){


  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);

  view.ctx.strokeStyle = this.color;
  view.ctx.lineWidth= 2;

  view.ctx.beginPath();
  view.ctx.rect(-12, -12, 24, 24);
  view.ctx.fillStyle = '#000';
  view.ctx.fill();
  view.ctx.stroke();

  // show danger close
  // view.ctx.beginPath();
  // view.ctx.arc(0, 0, this.danger_close, 0, 2*Math.PI);
  // view.ctx.strokeStyle = '#222';
  // view.ctx.stroke();


  view.ctx.fillStyle = this.color;
  view.ctx.font = '9pt monospace';
  view.ctx.textBaseline = 'middle';

  view.ctx.textAlign = 'right';
  if(this.stock.bombers>0){
    view.ctx.fillText(this.stock.bombers, -20, -7);
  }
  if(this.stock.fighters>0){
    view.ctx.fillText(this.stock.fighters, -20, 7);
  }

  view.ctx.textAlign = 'left';
  if(this.stock.icbms>0){
    view.ctx.fillText(this.stock.icbms, 20, -7);
  }
  if(this.stock.abms>0){
    view.ctx.fillText(this.stock.abms, 20, 7);
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


Base.prototype.elevation = function(view){

  var scale = view.yscale;

  view.ctx.save();
  view.ctx.translate(this.pos.x, ((this.world.max_z - this.pos.z) * scale) - 1);

  view.ctx.lineWidth = 2;
  view.ctx.strokeStyle = this.color;
  view.ctx.fillStyle = '#000';

  view.ctx.beginPath();
  view.ctx.rect(-6, -12, 12, 12);
  view.ctx.stroke();
  view.ctx.fill();

  view.ctx.restore();

};
