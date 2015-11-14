/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Capital = function(env, refs, attrs){
  this.env = env;
  this.refs = refs;
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Capital.prototype = Object.create(Actor.prototype);

Actors.Capital.prototype.title = 'Capital';

Actors.Capital.prototype.genAttrs = function(attrs){

  // rotation assets are positioned at
  var rot = 0;

  if (attrs.x < this.refs.scene.opts.max_x / 2) {
    rot += Math.PI;
  }

  if (attrs.y < this.refs.scene.opts.max_y / 2) {
    rot += Math.PI * 0.25;
  }

  if (attrs.y > this.refs.scene.opts.max_y / 2) {
    rot -= Math.PI * 1.75;
  }

  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    dead: false,
    defcon: attrs.defcon || this.opts.defcon,
    strike: attrs.strike || this.opts.strike,
    alert: 0,
    flash: false,
    rot: rot,
    danger_close: this.opts.danger_close * Math.min(this.refs.scene.opts.max_x, this.refs.scene.opts.max_y),
    color: attrs.color || '#fff',
    title: attrs.title || 'Capital',

    // how many assets to auto create
    cities_max: attrs.hasOwnProperty('cities_max') ? attrs.cities_max : this.opts.cities_max,
    factories_max: attrs.hasOwnProperty('factories_max') ? attrs.factories_max : this.opts.factories_max,
    bases_max: attrs.hasOwnProperty('bases_max') ? attrs.bases_max : this.opts.bases_max,
    sats_max: attrs.hasOwnProperty('sats_max') ? attrs.sats_max : this.opts.sats_max,
    // distance from capital for auto created assets
    city_r: 0.2 * Math.min(this.refs.scene.opts.max_x, this.refs.scene.opts.max_y),
    factory_r: 0.1 * Math.min(this.refs.scene.opts.max_x, this.refs.scene.opts.max_y),
    base_r: 0.2 * Math.min(this.refs.scene.opts.max_x, this.refs.scene.opts.max_y),

    // if assets are pushed in via attrs then these will be used
    // instead of *_max
    assets: attrs.assets || false
  };
};

Actors.Capital.prototype.init = function(){

  this.pos = new Vec3(
    this.attrs.x,
    this.attrs.y,
    this.attrs.z
  );

  this.assets = {
    cities: [],
    factories: [],
    bases: [],
    sats: []
  };

  // position assets radially around capital
  this.addCities();
  this.addFactories();
  this.addBases();

};

Actors.Capital.prototype.defaults = [{
  key: 'strike',
  info: '',
  value: 0,
  min: 0,
  max: 1
}, {
  key: 'bases_max',
  info: '',
  value: 3,
  min: 0,
  max: 5
}, {
  key: 'cities_max',
  info: '',
  value: 3,
  min: 0,
  max: 5
}, {
  key: 'factories_max',
  info: '',
  value: 3,
  min: 0,
  max: 5
}, {
  key: 'defcon',
  info: 'Initial Defcon',
  value: 3,
  min: 1,
  max: 5
}, {
  key: 'danger_close',
  info: 'Trigger distance for Defcon',
  value: 0.4,
  min: 0.1,
  max: 0.5
}, {
  key: 'sats_max',
  info: 'Number of Satellites each Capital can have. Sats launch at Defcon 3.',
  value: 1,
  min: 0,
  max: 10
}];


Actors.Capital.prototype.update = function(delta) {

  // used to flash defense perimiter initcator
  if (this.attrs.alert > 0) {
    this.attrs.alert--;
  }

  if (this.attrs.defcon < 3 && this.assets.sats.length < this.attrs.sats_max) {
    this.makeSat();
  }

  // only check once per second
  if (this.env.timer === 0) {
    this.calcDefcon();
  }

  // flash
  if (this.attrs.defcon < 2) {
    this.attrs.flash = true;
    if (this.env.timer > 10) {
      this.attrs.flash = false;
    }
    if (this.env.timer > 30) {
      this.attrs.flash = true;
    }
    if (this.env.timer > 40) {
      this.attrs.flash = false;
    }
    if (this.env.timer > 50) {
      this.attrs.flash = true;
    }
  } else {
    this.attrs.flash = true;
    if (this.env.timer > 10) {
      this.attrs.flash = false;
    }
  }

};


Actors.Capital.prototype.assetDestroyed = function() {
  this.attrs.defcon = 1;
};

Actors.Capital.prototype.calcDefcon = function(delta) {

  if (this.attrs.defcon === 1) {
    return;
  }

  var i, ii;

  var target, targets;

  if (this.attrs.defcon === 5) {
    // incoming bomber detection
    for (i = 0, ii = this.refs.scene.bombers.length; i < ii; i++) {
      target = this.refs.scene.bombers[i];
      if (target.refs.capital === this) {
        continue;
      }
      // break on first target found inside danger_close radius
      if (this.pos.rangeXY(target.pos) < this.attrs.danger_close) {
        this.attrs.defcon = 4;
        this.attrs.alert = 2;
        break;
      }
    }
  }

  if (this.attrs.defcon === 4) {
    // incoming bomber detection
    for (i = 0, ii = this.refs.scene.bombers.length; i < ii; i++) {
      target = this.refs.scene.bombers[i];
      if (target.refs.capital === this) {
        continue;
      }
      // break on first target found inside danger_close radius
      if (this.pos.rangeXY(target.pos) < this.attrs.danger_close / 2) {
        this.attrs.defcon = 3;
        this.attrs.alert = 2;
        break;
      }
    }
  }

  if (this.attrs.defcon === 3) {
    // incoming bomber detection
    for (i = 0, ii = this.refs.scene.bombers.length; i < ii; i++) {
      target = this.refs.scene.bombers[i];
      if (target.refs.capital === this) {
        continue;
      }
      // break on first target found inside danger_close radius
      if (this.pos.rangeXY(target.pos) < this.attrs.danger_close / 3) {
        this.attrs.defcon = 2;
        this.attrs.alert = 2;
        break;
      }
    }
  }

  // // if any enemy goes to war, so do we
  // for (i = 0, ii = this.refs.scene.capitals.length; i < ii; i++) {
  //   if (this.refs.scene.capitals[i].defcon === 1) {
  //     this.attrs.alert = 5;
  //     this.attrs.defcon = 1;
  //   }
  // }


};


Actors.Capital.prototype.makeSat = function() {

  var x = (this.refs.scene.opts.max_x / 2);

  if (this.pos.x < this.refs.scene.opts.max_x / 2) {
    x = x - (this.refs.scene.opts.max_x / 2) * 0.05;
  } else {
    x = x + (this.refs.scene.opts.max_x / 2) * 0.05;
  }

  var y = this.refs.scene.opts.max_y / 2;

  var sat = new Actors.Sat(
    this.env,{
      scene: this.refs.scene,
      icbms: this.refs.icbms,
      capital: this
    }, {
      x: x,
      y: y,
      z: this.refs.scene.opts.max_z * 0.75,
      color: this.attrs.color,
    });

  this.refs.scene.sats.push(sat);
  this.assets.sats.push(sat);

};

Actors.Capital.prototype.addCities = function() {

  var i, ii;
  var theta, angle, pos;

  var positions = [];

  if(this.attrs.assets && this.attrs.assets.cities.length > 0){
    // manual placement
    this.attrs.assets.cities.forEach(function(asset){
      positions.push({
        x: this.pos.x + asset[0],
        y: this.pos.y + asset[1],
        z: 0
      });
    }, this);
  } else {
    // auto placement

    // face away from enemy
    theta = Math.PI / (this.attrs.cities_max + 1);
    angle = this.attrs.rot - (Math.PI * 0.5);
    while (positions.length < this.attrs.cities_max) {
      angle += theta;
      pos = new VecR(angle, this.attrs.city_r).vec3();
      positions.push({
        x: this.pos.x + pos.x,
        y: this.pos.y + pos.y,
        z: 0
      });
    }
  }
  positions.forEach(function(position){
    var city = new Actors.City(
      this.env, {
        capital: this,
        scene: this.refs.scene
      }, {
        x: position.x,
        y: position.y,
        z: 0,
        color: this.attrs.color
      });
    this.assets.cities.push(city);
    this.refs.scene.cities.push(city);
  }, this);
};


Actors.Capital.prototype.addFactories = function() {

  var i, ii;
  var theta, angle, pos;

  var positions = [];

  if(this.attrs.assets && this.attrs.assets.factories.length > 0){
    // manual placement
    this.attrs.assets.factories.forEach(function(asset){
      positions.push({
        x: this.pos.x + asset[0],
        y: this.pos.y + asset[1],
        z: 0
      });
    }, this);
  } else {
    // auto placement

    // face away from enemy
    theta = Math.PI / (this.attrs.factories_max + 1);
    angle = this.attrs.rot - (Math.PI * 0.5);
    while (positions.length < this.attrs.factories_max) {
      angle += theta;
      pos = new VecR(angle, this.attrs.factory_r).vec3();
      positions.push({
        x: this.pos.x + pos.x,
        y: this.pos.y + pos.y,
        z: 0
      });
    }
  }

  positions.forEach(function(position){
    var factory = new Actors.Factory(
      this.env,{
        capital: this,
        scene: this.refs.scene
      }, {
        x: position.x,
        y: position.y,
        z: 0,
        color: this.attrs.color
      });
    this.assets.factories.push(factory);
    this.refs.scene.factories.push(factory);
  }, this);

};

Actors.Capital.prototype.addBases = function() {

  var i, ii;
  var theta, angle, pos;

  var positions = [];

  if(this.attrs.assets && this.attrs.assets.bases.length > 0){
    // manual placement
    this.attrs.assets.bases.forEach(function(asset){
      positions.push({
        x: this.pos.x + asset[0],
        y: this.pos.y + asset[1],
        z: 0
      });
    }, this);
  } else {
    // auto placement

    // face away from enemy
    theta = Math.PI / (this.attrs.bases_max + 1);
    angle = this.attrs.rot + (Math.PI * 0.5);
    while (positions.length < this.attrs.bases_max) {
      angle += theta;
      pos = new VecR(angle, this.attrs.base_r).vec3();
      positions.push({
        x: this.pos.x + pos.x,
        y: this.pos.y + pos.y,
        z: 0
      });

    }
  }

  positions.forEach(function(position){
    var base = new Actors.Base(
      this.env, {
        capital: this,
        scene: this.refs.scene
      }, {
        x: position.x,
        y: position.y,
        z: 0,
        color: this.attrs.color
      });
    this.assets.bases.push(base);
    this.refs.scene.bases.push(base);
  }, this);

};

Actors.Capital.prototype.paint = function(view) {

  var xf = 12;

  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);

  // show danger close
  if (this.attrs.defcon === 5) {
    if (this.attrs.flash) {
      view.ctx.strokeStyle = this.attrs.color;
    } else {
      view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.25)';
    }
    view.ctx.lineWidth = 0.5;
    view.ctx.beginPath();
    view.ctx.arc(0, 0, this.attrs.danger_close, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  if (this.attrs.defcon === 4 && this.attrs.alert > 0) {
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',1)';
    view.ctx.lineWidth = 8;
    view.ctx.beginPath();
    view.ctx.arc(0, 0, this.attrs.danger_close, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  if (this.attrs.defcon === 4) {
    if (this.attrs.flash) {
      view.ctx.strokeStyle = this.attrs.color;
    } else {
      view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.25)';
    }
    view.ctx.beginPath();
    view.ctx.lineWidth = 0.5;
    view.ctx.arc(0, 0, this.attrs.danger_close / 2, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  if (this.attrs.defcon === 3 && this.attrs.alert > 0) {
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',1)';
    view.ctx.beginPath();
    view.ctx.lineWidth = 8;
    view.ctx.arc(0, 0, this.attrs.danger_close / 2, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  if (this.attrs.defcon === 2 && this.attrs.alert > 0) {
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',1)';
    view.ctx.beginPath();
    view.ctx.lineWidth = 8;
    view.ctx.arc(0, 0, this.attrs.city_r, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  // city limits
  view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.5)';
  view.ctx.lineWidth = 0.5;

  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.attrs.city_r, 0, 2 * Math.PI);
  view.ctx.stroke();

  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.attrs.factory_r, 0, 2 * Math.PI);
  view.ctx.stroke();

  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.attrs.base_r, 0, 2 * Math.PI);
  if (this.attrs.alert > 0) {
    view.ctx.lineWidth = 4;
  }
  view.ctx.stroke();

  view.ctx.lineWidth = 0.5;

  if (this.attrs.flash) {
    view.ctx.fillStyle = this.attrs.color;
  } else {
    view.ctx.fillStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.25)';
  }

  view.ctx.lineWidth = 2;
  view.ctx.strokeStyle = this.attrs.color;

  // box
  view.ctx.beginPath();
  view.ctx.rect(-xf, -xf, xf*2, xf*2);
  view.ctx.fill();
  view.ctx.stroke();

  if(this.attrs.flash) {
    view.ctx.fillStyle = '#000';
  } else {
    view.ctx.fillStyle = this.attrs.color;
  }

  view.ctx.font = '12pt monospace';
  view.ctx.textBaseline = 'middle';
  view.ctx.textAlign = 'center';

  view.ctx.fillText(this.attrs.defcon, 0, 1);

  view.ctx.restore();

};

Actors.Capital.prototype.elevation = function(view) {

  var xf = 8;

  view.ctx.save();
  view.ctx.translate(this.pos.x, ((this.refs.scene.opts.max_z - this.pos.z)));

  // show danger close
  if (this.attrs.defcon === 5) {
    if (this.attrs.flash) {
      view.ctx.strokeStyle = this.attrs.color;
    } else {
      view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.25)';
    }
    view.ctx.lineWidth = 0.5;
    view.ctx.beginPath();
    view.ctx.arc(0, 0, this.attrs.danger_close, 0, Math.PI, true);
    view.ctx.stroke();
  }

  if (this.attrs.defcon === 4 && this.attrs.alert > 0) {
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',1)';
    view.ctx.lineWidth = 8;
    view.ctx.beginPath();
    view.ctx.arc(0, 0, this.attrs.danger_close, 0, Math.PI, true);
    view.ctx.stroke();
  }

  if (this.attrs.defcon === 4) {
    if (this.attrs.flash) {
      view.ctx.strokeStyle = this.attrs.color;
    } else {
      view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.25)';
    }
    view.ctx.beginPath();
    view.ctx.lineWidth = 0.5;
    view.ctx.arc(0, 0, this.attrs.danger_close / 2, 0, Math.PI, true);
    view.ctx.stroke();
  }

  if (this.attrs.defcon === 3 && this.attrs.alert > 0) {
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',1)';
    view.ctx.beginPath();
    view.ctx.lineWidth = 8;
    view.ctx.arc(0, 0, this.attrs.danger_close / 2, 0, Math.PI, true);
    view.ctx.stroke();
  }

  if (this.attrs.defcon === 2 && this.attrs.alert > 0) {
    view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',1)';
    view.ctx.beginPath();
    view.ctx.lineWidth = 8;
    view.ctx.arc(0, 0, this.attrs.city_r, 0, Math.PI, true);
    view.ctx.stroke();
  }

  // city limits
  view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',1)';
  view.ctx.lineWidth = 0.5;

  view.ctx.beginPath();
  view.ctx.moveTo(-this.attrs.city_r, xf/2);
  view.ctx.lineTo(this.attrs.city_r, xf/2);
  view.ctx.stroke();

  view.ctx.strokeStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.5)';
  view.ctx.lineWidth = 0.5;

  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.attrs.city_r, 0, Math.PI, true);
  view.ctx.stroke();

  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.attrs.factory_r, 0, Math.PI, true);
  view.ctx.stroke();

  view.ctx.beginPath();
  view.ctx.arc(0, 0, this.attrs.base_r, 0, Math.PI, true);
  if (this.attrs.alert > 0) {
    view.ctx.lineWidth = 4;
  }
  view.ctx.stroke();

  view.ctx.lineWidth = 0.5;

  if (this.attrs.flash) {
    view.ctx.fillStyle = this.attrs.color;
  } else {
    view.ctx.fillStyle = 'rgba(' + hex2rgb(this.attrs.color) + ',0.25)';
  }

  view.ctx.lineWidth = 2;
  view.ctx.strokeStyle = this.attrs.color;

  // box
  view.ctx.beginPath();
  view.ctx.rect(-xf/2, -xf/2, xf, xf);
  view.ctx.stroke();
  view.ctx.fill();

  view.ctx.restore();

};
