/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true, pickOne:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Factory = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Factory.prototype = Object.create(Actor.prototype);

Actors.Factory.prototype.title = 'Factory';

Actors.Factory.prototype.genAttrs = function(attrs){
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    color: attrs.color || '#f0f',
    title: attrs.title || '',
    dead: false,
    units: 0,
    timer: 0,
    checkpoint: 230 + (40*Math.random()),
    abms_launched: 0,
    abm_launch_max: this.opts.abm_launch_max || 0,
    abm_launch_per_tick: this.opts.abm_launch_per_tick || 1,
    amount: {
      bombers: 0,
      fighters: 0,
      icbms: 0,
      abms: 0
    },
    stock: {
      abms: (attrs.stock && attrs.stock.abms) ? attrs.stock.abms : this.opts.stock_abms
    }
  };
};

Actors.Factory.prototype.init = function(){
  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  );
};

Actors.Factory.prototype.defaults = [{
  key: 'stock_abms',
  info: '',
  value: 100,
  min: 10,
  max: 1000
}, {
  key: 'abm_launch_max',
  info: 'Number of ABMs each Base can have in air at any time',
  value: 10,
  min: 0,
  max: 100
}];


Actors.Factory.prototype.update = function(delta) {
  this.attrs.timer += delta;
  this.launchAbms();
  if(this.attrs.timer > this.attrs.checkpoint){
    this.attrs.timer = 0;
    this.makeMunitions();
  }
};

// city will add units to factory
Actors.Factory.prototype.addUnits = function(units){
  this.attrs.units += units;
};

// factory makes munitions for base
Actors.Factory.prototype.makeMunitions = function(){

  if(this.attrs.units === 0){
    return;
  }

  if(!this.refs.capital){
    return;
  }

  var i, ii, stock;

  var bases = this.refs.scene.factories;
  var targets = [];

  this.refs.scene.bases.forEach(function(base){
    if(base.refs.capital === this.refs.capital){
      targets.push(base);
    }
  }, this);

  if(targets.length === 0){
    return;
  }

  this.attrs.amount.bombers += 0.025 * this.attrs.units;
  this.attrs.amount.fighters += 0.05 * this.attrs.units;
  this.attrs.amount.icbms += 0.001 * this.attrs.units;
  this.attrs.amount.abms += 0.01 * this.attrs.units;

  this.attrs.units = 0;

  stock = {
    bombers: Math.floor(this.attrs.amount.bombers),
    fighters: Math.floor(this.attrs.amount.fighters),
    icbms: Math.floor(this.attrs.amount.icbms),
    abms: Math.floor(this.attrs.amount.abms)
  };

  this.attrs.amount = {
    bombers: this.attrs.amount.bombers - stock.bombers,
    fighters: this.attrs.amount.fighters - stock.fighters,
    icbms: this.attrs.amount.icbms - stock.icbms,
    abms: this.attrs.amount.abms - stock.abms
  };

  for(i = 0, ii=targets.length; i<ii; i++){
    this.refs.scene.supplies.push(new Actors.Supply(
      this.env, {
        scene: this.refs.scene,
        capital: this.capital,
        target: targets[i],
      }, {
        x: this.pos.x,
        y: this.pos.y,
        color: this.attrs.color,
        stock: stock
      }));
  }
};

Actors.Factory.prototype.launchAbms = function(){

  var launched_this_tick = 0;
  var range, targets, target;

  if(this.attrs.stock.abms <= 0 || this.attrs.abms_launched >= this.attrs.abm_launch_max){
    return;
  }

  targets = [];

  var icbm;

  for(var i = 0, ii=this.refs.scene.icbms.length; i<ii; i++){
    icbm = this.refs.scene.icbms[i];

    if(icbm.attrs.dead){
      continue;
    }

    if(icbm.refs.capital === this.refs.capital){
      continue;
    }

    if(Math.abs(icbm.pos.x - this.pos.x) < this.attrs.danger_close){
      targets.push(icbm);
    }
  }

  if(targets.length === 0){
    return;
  }

  while(this.attrs.stock.abms > 0 && this.attrs.abms_launched < this.attrs.abm_launch_max && launched_this_tick < this.attrs.abm_launch_per_tick){
    target = pickOne(targets);

    this.refs.scene.abms.push(new Actors.Abm(
      this.env, {
        scene: this.refs.scene,
        target: target,
        base: this
      }, {
        x: this.pos.x,
        y: this.pos.y,
        color: this.attrs.color
      }));

    launched_this_tick ++;
    this.attrs.abms_launched ++;
    this.attrs.stock.abms --;
  }

};
// Actors.Factory.prototype.launchAbms = function(){

//   var launched_this_tick = 0;
//   var range, targets, target;

//   var abm_cost = 10;

//   if(this.units.abms < abm_cost || this.stock.abms < 1){
//     return;
//   }

//   if(this.abms_launched >= this.abm_launch_max){
//     return;
//   }

//   targets = [];

//   var midway = this.world.max_x/2;
//   var icbm;

//   for(var i = 0, ii=this.world.icbms.length; i<ii; i++){
//     icbm = this.world.icbms[i];
//     if(icbm.dead){
//       continue;
//     }
//     if(icbm.capital === this.capital){
//       continue;
//     }
//     if(this.pos.x < midway){
//       if(icbm.pos.x < midway){
//         targets.push(icbm);
//       }
//     } else {
//       if(icbm.pos.x > midway){
//         targets.push(icbm);
//       }
//     }
//   }

//   if(targets.length === 0){
//     return;
//   }
//   while((this.stock.abms > 0 || this.units > abm_cost) && this.abms_launched < this.abm_launch_max && launched_this_tick < this.abm_launch_per_tick){

//     target = pickOne(targets);
//     this.world.abms.push(new Abm({
//       x: this.pos.x,
//       y: this.pos.y,
//       world: this.world,
//       base: this,
//       target: target,
//       color: this.color
//     }));

//     launched_this_tick ++;
//     this.abms_launched ++;
//     if(this.stock.abms > 0){
//       this.stock.abms = this.stock.abms - 1;
//     } else {
//       this.units = this.units - abm_cost --;
//     }
//   }

// };


Actors.Factory.prototype.paint = function(view) {

  var xf = 8;

  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);

  view.ctx.strokeStyle = this.attrs.color;
  view.ctx.lineWidth = xf/4;

  view.ctx.beginPath();
  view.ctx.moveTo(0, -xf);
  view.ctx.lineTo(xf, xf);
  view.ctx.lineTo(-xf, xf);
  view.ctx.closePath();
  view.ctx.fillStyle= 'rgba(' + hex2rgb(this.attrs.color) + ', ' + (this.attrs.timer / this.attrs.checkpoint ) + ')';
  //view.ctx.fillStyle = '#000';
  view.ctx.fill();
  view.ctx.stroke();
  view.ctx.closePath();

  // view.ctx.fillStyle = this.attrs.color;
  // view.ctx.font = '9pt monospace';
  // view.ctx.textBaseline = 'middle';
  // view.ctx.textAlign = 'center';

  // if(this.attrs.units>0){
  //   view.ctx.fillText(this.attrs.units.toFixed(0), 0, -24);
  // }

  if(this.attrs.title){
    view.ctx.fillStyle = this.attrs.color;
    view.ctx.font = '10pt monospace';
    view.ctx.textBaseline = 'middle';
    view.ctx.textAlign = 'center';
    view.ctx.fillText(this.attrs.title, 0, 32);
  }

  view.ctx.restore();

};

Actors.Factory.prototype.elevation = function(view) {

  var xf = 8;

  view.ctx.save();
  view.ctx.translate(this.pos.x, ((this.refs.scene.opts.max_z - this.pos.z)));

  view.ctx.strokeStyle = this.attrs.color;
  view.ctx.fillStyle = '#000';
  view.ctx.lineWidth = 2;

  view.ctx.beginPath();
  view.ctx.moveTo(-xf/2, xf/2);
  view.ctx.lineTo(0, -xf/2);
  view.ctx.lineTo(xf/2, xf/2);
  view.ctx.closePath();
  view.ctx.stroke();
  view.ctx.fill();



  view.ctx.restore();

};
