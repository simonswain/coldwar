/*global Vec3:true, VecR:true, hex2rgb:true, Base:true, Sat:true, City:true, Factory:true */
/*jshint browser:true */
/*jshint strict:false */

function Capital(opts) {

  this.pos = new Vec3(opts.x, opts.y, opts.z);
  this.color = opts.color || '#fff';

  this.title = opts.title || false;

  this.world = opts.world;

  if (!opts.hasOwnProperty('strike')) {
    opts.strike = true;
  }

  this.strike = opts.strike;

  this.unit_rate = opts.unit_rate || 0;
  this.units = opts.units || 0;

  this.cities_max = opts.cities_max || 0;
  this.factories_max = opts.factories_max || 0;
  this.bases_max = opts.bases_max || 0;

  this.bomber_launch_max = opts.bomber_launch_max || 0;
  this.fighter_launch_max = opts.fighter_launch_max || 0;
  this.icbm_launch_max = opts.icbm_launch_max || 0;
  this.abm_launch_max = opts.abm_launch_max || 0;

  this.sats_max = opts.sats_max || 0;

  this.defcon = opts.defcon || 1;

  this.danger_close = 450;

  this.assets = opts.assets || {
    cities: [],
    factories: [],
    bases: []
  };

  // starting stock for bases
  this.stock = opts.stock || {
    bombers: 0,
    fighters: 0,
    icbms: 0,
    abms: 0
  };


  this.dead = false;

  this.rot = 0;

  if (this.pos.x < this.world.max_x / 2) {
    this.rot += Math.PI;
  }

  if (this.pos.y < this.world.max_y / 2) {
    this.rot += Math.PI * 0.25;
  }

  if (this.pos.y > this.world.max_y / 2) {
    this.rot -= Math.PI * 1.75;
  }

  //this.rot += (Math.PI * Math.random() * 0.2) - Math.PI * Math.random() * 0.2;

  this.city_r = 0.2 * this.world.max;
  this.factory_r = 0.1 * this.world.max;
  this.base_r = 0.2 * this.world.max;

  // position assets radially around capital
  this.myCities = [];
  this.addCities();

  this.myFactories = [];
  this.addFactories();

  this.myBases = [];
  this.addBases();

  this.mySats = [];
  this.timer = 0;
  this.flash = false;
  this.alert = 0;

}

Capital.prototype.update = function(delta) {

  if (this.alert > 0) {
    this.alert--;
  }

  if (this.defcon < 3 && this.mySats.length < this.sats_max) {
    this.makeSat();
  }

  if (this.timer === 0) {
    this.calcDefcon();
  }

  this.timer += delta;

  if (this.defcon < 2) {
    if (this.timer > 10) {
      this.flash = false;
    }
    if (this.timer > 20) {
      this.timer = 0;
      this.flash = true;
    }
  } else {
    if (this.timer > 10) {
      this.flash = false;
    }

    if (this.timer > 50) {
      this.timer = 0;
      this.flash = true;
    }
  }



};

Capital.prototype.assetDestroyed = function() {
  this.defcon = 1;
};

Capital.prototype.calcDefcon = function(delta) {

  if (this.defcon === 1) {
    return;
  }

  var i, ii;

  var target, targets;

  if (this.defcon === 5) {
    // incoming bomber detection
    for (i = 0, ii = this.world.bombers.length; i < ii; i++) {
      target = this.world.bombers[i];
      if (target.capital === this) {
        continue;
      }
      // break on first target found inside danger_close radius
      if (this.pos.rangeXY(target.pos) < this.danger_close) {
        this.defcon = 4;
        this.alert = 2;
        break;
      }
    }
  }

  if (this.defcon === 4) {
    // incoming bomber detection
    for (i = 0, ii = this.world.bombers.length; i < ii; i++) {
      target = this.world.bombers[i];
      if (target.capital === this) {
        continue;
      }
      // break on first target found inside danger_close radius
      if (this.pos.rangeXY(target.pos) < this.danger_close / 2) {
        this.defcon = 3;
        this.alert = 2;
        break;
      }
    }
  }

  if (this.defcon === 3) {
    // incoming bomber detection
    for (i = 0, ii = this.world.bombers.length; i < ii; i++) {
      target = this.world.bombers[i];
      if (target.capital === this) {
        continue;
      }
      // break on first target found inside danger_close radius
      if (this.pos.rangeXY(target.pos) < this.danger_close / 3) {
        this.defcon = 2;
        this.alert = 2;
        break;
      }
    }
  }


  // if any enemy goes to war, so do we
  for (i = 0, ii = this.world.capitals.length; i < ii; i++) {
    if (this.world.capitals[i].defcon === 1) {
      this.alert = 5;
      this.defcon = 1;
    }
  }


};


Capital.prototype.makeSat = function() {

  var x = (this.world.max_x / 2);

  if (this.pos.x < this.world.max_x / 2) {
    x = x - (this.world.max_x / 2) * 0.05;
  } else {
    x = x + (this.world.max_x / 2) * 0.05;
  }

  var y = this.world.max_y / 2;

  var sat = new Sat({
    x: x,
    y: y,
    z: this.world.max_z * 0.9,
    world: this.world,
    capital: this,
    color: this.color,
  });

  this.world.sats.push(sat);
  this.mySats.push(sat);

};

Capital.prototype.addCities = function() {

  var i, ii;
  var city;
  var max = (Math.min(this.world.max_x, this.world.max_y)) / 2;
  var range, theta, angle, pos;

  var positions = [];

  if(this.assets.cities.length > 0){
    // manual placement
    for(var i=0, ii=this.assets.cities.length; i<ii; i++){
      positions.push({
        x: this.pos.x + this.assets.cities[i][0],
        y: this.pos.y + this.assets.cities[i][1],
        z: 0
      });
    }
  } else {
    // auto placement

    // face away from enemy
    theta = Math.PI / (this.cities_max + 1);
    angle = this.rot - (Math.PI * 0.5);

    while (positions.length < this.cities_max) {
      angle += theta * (this.myCities.length + 1);

      range = this.city_r;
      pos = new VecR(angle, range).vec3();

      positions.push({
        x: this.pos.x + pos.x,
        y: this.pos.y + pos.y,
        z: 0
      });

    }
  }

  for(i=0, ii=positions.length; i<ii; i++){

    city = new City({
      x: positions[i].x,
      y: positions[i].y,
      z: 0,
      world: this.world,
      capital: this,
      unit_rate: this.unit_rate,
      abm_launch_max: this.abm_launch_max,
      stock: {
        abms: this.stock.abms
      },
      color: this.color
    });
    this.myCities.push(city);
    this.world.cities.push(city);
  }

};


Capital.prototype.addFactories = function() {

  var i, ii;
  var factory;
  var max = (Math.min(this.world.max_x, this.world.max_y)) / 2;
  var range, theta, angle, pos;

  var positions = [];

  if(this.assets.factories.length > 0){
    // manual placement
    for(var i=0, ii=this.assets.factories.length; i<ii; i++){
      positions.push({
        x: this.pos.x + this.assets.factories[i][0],
        y: this.pos.y + this.assets.factories[i][1],
        z: 0
      });
    }
  } else {
    // auto placement

    // position on side facing enemy
    theta = Math.PI / (this.factories_max + 1);
    angle = this.rot + Math.PI / 2;

    while (positions.length < this.factories_max) {
      angle += theta * (this.myFactories.length + 1);

      range = this.factory_r;
      pos = new VecR(angle, range).vec3();

      positions.push({
        x: this.pos.x + pos.x,
        y: this.pos.y + pos.y,
        z: 0
      });

    }
  }

  for(i=0, ii=positions.length; i<ii; i++){
    factory = new Factory({
      x: positions[i].x,
      y: positions[i].y,
      z: 0,
      world: this.world,
      capital: this,
      units: this.units,
      abm_launch_max: this.abm_launch_max,
      stock: {
        abms: this.stock.abms
      },
      color: this.color
    });

    this.myFactories.push(factory);
    this.world.factories.push(factory);
  }

};

Capital.prototype.addBases = function() {

  var i, ii;
  var base;
  var max = (Math.min(this.world.max_x, this.world.max_y)) / 2;
  var range, angle, pos, theta;

  var positions = [];

  if(this.assets.bases.length > 0){
    // manual placement
    for(var i=0, ii=this.assets.bases.length; i<ii; i++){
      positions.push({
        x: this.pos.x + this.assets.bases[i][0],
        y: this.pos.y + this.assets.bases[i][1],
        z: 0
      });
    }
  } else {
    // auto placement

    // position on side facing enemy
    theta = Math.PI / (this.bases_max + 1);
    angle = this.rot + Math.PI / 2;

    while (positions.length < this.bases_max) {
      angle += theta * (this.myBases.length + 1);

      range = this.base_r;
      pos = new VecR(angle, range).vec3();

      positions.push({
        x: this.pos.x + pos.x,
        y: this.pos.y + pos.y,
        z: 0
      });

    }
  }

  for(i=0, ii=positions.length; i<ii; i++){
    base = new Base({
      x: positions[i].x,
      y: positions[i].y,
      z: 0,
      world: this.world,
      capital: this,
      color: this.color,
      bomber_launch_max: Math.floor(this.bomber_launch_max * Math.random()),
      fighter_launch_max: Math.floor(this.fighter_launch_max * Math.random()),
      icbm_launch_max: this.icbm_launch_max,
      abm_launch_max: this.abm_launch_max,
      stock: {
        bombers: this.stock.bombers,
        fighters: this.stock.fighters,
        icbms: this.stock.icbms,
        abms: this.stock.abms
      }
    });
    this.myBases.push(base);
    this.world.bases.push(base);
  }

};

Capital.prototype.paint = function(view) {

  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);

  // show danger close
  if (this.defcon === 5) {
    if (this.flash) {
      view.ctx.strokeStyle = this.color;
    } else {
      view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',0.25)';
    }
    view.ctx.lineWidth = 0.5;
    view.ctx.beginPath();
    view.ctx.arc(0, 0, this.danger_close, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  if (this.defcon === 4 && this.alert > 0) {
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',1)';
    view.ctx.lineWidth = 8;
    view.ctx.beginPath();
    view.ctx.arc(0, 0, this.danger_close, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  if (this.defcon === 4) {
    if (this.flash) {
      view.ctx.strokeStyle = this.color;
    } else {
      view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',0.25)';
    }
    view.ctx.beginPath();
    view.ctx.lineWidth = 0.5;
    view.ctx.arc(0, 0, this.danger_close / 2, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  if (this.defcon === 3 && this.alert > 0) {
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',1)';
    view.ctx.beginPath();
    view.ctx.lineWidth = 8;
    view.ctx.arc(0, 0, this.danger_close / 2, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  if (this.defcon === 2 && this.alert > 0) {
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',1)';
    view.ctx.beginPath();
    view.ctx.lineWidth = 8;
    view.ctx.arc(0, 0, this.city_r, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  // city limits
  view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',0.5)';
  view.ctx.lineWidth = 0.5;

  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.city_r, 0, 2 * Math.PI);
  view.ctx.stroke();

  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.factory_r, 0, 2 * Math.PI);
  view.ctx.stroke();

  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.base_r, 0, 2 * Math.PI);
  if (this.alert > 0) {
    view.ctx.lineWidth = 4;
  }
  view.ctx.stroke();

  view.ctx.lineWidth = 0.5;

  if (this.flash) {
    view.ctx.fillStyle = this.color;
  } else {
    view.ctx.fillStyle = 'rgba(' + hex2rgb(this.color) + ',0.25)';
  }

  view.ctx.lineWidth = 2;
  view.ctx.strokeStyle = this.color;

  // box
  view.ctx.beginPath();
  view.ctx.rect(-12, -12, 24, 24);
  view.ctx.fill();
  view.ctx.stroke();

  if(this.flash) {
    view.ctx.fillStyle = '#000';
  } else {
    view.ctx.fillStyle = this.color;
  }

  view.ctx.font = '12pt monospace';
  view.ctx.textBaseline = 'middle';
  view.ctx.textAlign = 'center';

  view.ctx.fillText(this.defcon, 0, 1);

  if (this.title) {
    view.ctx.fillStyle = this.color;
    view.ctx.font = '10pt monospace';
    view.ctx.textBaseline = 'middle';
    view.ctx.textAlign = 'center';
    view.ctx.fillText(this.title, 0, 32);
  }

  view.ctx.restore();

};

Capital.prototype.elevation = function(view) {

  var scale = view.yscale;

  view.ctx.save();
  view.ctx.translate(this.pos.x, ((this.world.max_z - this.pos.z) * scale));

  // show danger close
  if (this.defcon === 5) {
    if (this.flash) {
      view.ctx.strokeStyle = this.color;
    } else {
      view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',0.25)';
    }
    view.ctx.lineWidth = 0.5;
    view.ctx.beginPath();
    view.ctx.arc(0, 0, this.danger_close, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  if (this.defcon === 4 && this.alert > 0) {
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',1)';
    view.ctx.lineWidth = 8;
    view.ctx.beginPath();
    view.ctx.arc(0, 0, this.danger_close, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  if (this.defcon === 4) {
    if (this.flash) {
      view.ctx.strokeStyle = this.color;
    } else {
      view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',0.25)';
    }
    view.ctx.beginPath();
    view.ctx.lineWidth = 0.5;
    view.ctx.arc(0, 0, this.danger_close / 2, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  if (this.defcon === 3 && this.alert > 0) {
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',1)';
    view.ctx.beginPath();
    view.ctx.lineWidth = 8;
    view.ctx.arc(0, 0, this.danger_close / 2, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  if (this.defcon === 2 && this.alert > 0) {
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',1)';
    view.ctx.beginPath();
    view.ctx.lineWidth = 8;
    view.ctx.arc(0, 0, this.city_r, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  // city limits
  view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',1)';
  view.ctx.lineWidth = 0.5;

  view.ctx.beginPath();
  view.ctx.moveTo(-this.city_r, -1);
  view.ctx.lineTo(this.city_r, -1);
  view.ctx.stroke();

  view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.color) + ',0.5)';
  view.ctx.lineWidth = 0.5;

  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.city_r, 0, 2 * Math.PI);
  view.ctx.stroke();

  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.factory_r, 0, 2 * Math.PI);
  view.ctx.stroke();

  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.base_r, 0, 2 * Math.PI);
  if (this.alert > 0) {
    view.ctx.lineWidth = 4;
  }
  view.ctx.stroke();

  view.ctx.lineWidth = 0.5;

  if (this.flash) {
    view.ctx.fillStyle = this.color;
  } else {
    view.ctx.fillStyle = 'rgba(' + hex2rgb(this.color) + ',0.25)';
  }

  view.ctx.lineWidth = 2;
  view.ctx.strokeStyle = this.color;

  // box
  view.ctx.beginPath();
  view.ctx.rect(-6, -13, 12, 12);
  view.ctx.stroke();
  view.ctx.fill();

  view.ctx.restore();

};
