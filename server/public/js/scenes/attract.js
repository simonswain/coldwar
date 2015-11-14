/*global Scenes:true, Scene:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.attract = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.attract.prototype = Object.create(Scene.prototype);

Scenes.attract.prototype.title = 'Attract';

Scenes.attract.prototype.layout = 'scanner';

Scenes.attract.prototype.init = function(){

  this.enemy_capital = null;

  this.maps = [];
  this.booms = [];
  this.capitals = [];
  this.cities = [];
  this.bases = [];
  this.factories = [];
  this.supplies = [];
  this.bombers = [];
  this.fighters = [];
  this.icbms = [];
  this.abms = [];
  this.sats = [];
  this.decoys = [];

  this.sets = [
    this.capitals,
    this.cities,
    this.bases,
    this.factories,
    this.sats,
    this.bombers,
    this.supplies,
    this.fighters,
    this.icbms,
    this.abms,
    this.booms,
    this.decoys
  ];

  if(this.opts.mode > -1) {
    this.attrs.mode_index = this.opts.mode;
  }
  this.attrs.mode = this.modes[this.attrs.mode_index];
  this.mode_init();

};

Scenes.attract.prototype.getCast = function(){
  return {
    Capital: Actors.Capital,
    City: Actors.City,
    Factory: Actors.Factory,
    Base: Actors.Base,
    Supply: Actors.Supply,
    Bomber: Actors.Supply,
    Fighter: Actors.Supply,
    Icbm: Actors.Supply,
    Abm: Actors.Supply,
    Sat: Actors.Sat,
    Boom: Actors.Boom,
    Map: Actors.Map
  }
};

Scenes.attract.prototype.defaults = [{
  key: 'max',
  info: 'Max',
  value: 600,
  min: 50,
  max: 1600
}, {
  key: 'max_x',
  info: 'Max X',
  value: 1020,
  min: 200,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 600,
  min: 200,
  max: 1000
}, {
  key: 'max_z',
  info: 'Max Z',
  value: 300,
  min: 50,
  max: 500
}, {
  key: 'mode',
  value: -1,
  min: -1,
  max: 8
}, {
  key: 'mode_ttl',
  value: 500,
  min: 10,
  max: 100
}, {
  key: 'speed_factor',
  value: 20,
  min: 10,
  max: 100
}];

Scenes.attract.prototype.genAttrs = function(){
  return {
    time: 0,
    angle: 1.5 * Math.PI,
    angle_v: 0.01,
    mode: this.opts.mode || false,
    mode_index: 0,
    mode_ttl: this.opts.mode_ttl,
    y: 0,
    hist: []
  };
};

Scenes.attract.prototype.modes = [
  'capital','city','factory','base',
  'bomber','fighter','icbm','abm','sat'
];


Scenes.attract.prototype.update = function(delta){

  if(this.attrs.mode_index<4){
    this.attrs.mode_ttl -= delta;
  } else {
    this.attrs.mode_ttl -= delta * 0.6;
  }

  if(this.opts.mode === -1) {
    if(this.attrs.mode_ttl < 0){
      this.attrs.mode_index++;
      if(this.attrs.mode_index >= this.modes.length ){
        this.attrs.mode_index = 0;
      }
      this.attrs.mode = this.modes[this.attrs.mode_index];
      this.attrs.mode_ttl = this.opts.mode_ttl;
      this.mode_init();
    }
  } else if(this.attrs.mode_ttl < 0){
    this.attrs.mode_ttl = this.opts.mode_ttl;
  }

  this.attrs.time += delta / 5;

  this.attrs.angle += this.attrs.angle_v;

  for (n = 0, nn = this.sets.length; n < nn; n++) {
    set = this.sets[n];
    for (i = 0, ii = set.length; i < ii; i++) {
      if(!set[i]){
        continue;
      }
      set[i].update(delta);
    }
  }

  for(n=0, nn=this.sets.length; n<nn; n++){
    set = this.sets[n];
    for(i=0, ii=set.length; i<ii; i++){
      if(!set[i]){
        continue;
      }
      if(set[i].attrs.dead){
        set.splice(i, 1);
        i--;
        ii--;
      }
    }
  }


  if (this.attrs.mode === 'capital') {
    var defcon = Math.floor((this.attrs.mode_ttl / this.opts.mode_ttl) * 5) + 1;
    if (defcon !== this.capitals[0].attrs.defcon) {
      this.capitals[0].attrs.defcon = defcon;
      this.capitals[0].attrs.alert = 2;
    }

  }

}

Scenes.attract.prototype.paint = function(fx, gx, sx, ex){

  this.paintTitle(gx);

  this.paintMap(gx);
  this.paintElevation(sx);

  this.paintData(gx);
  this.paintObject(gx);
  this.paintActor(gx);

  for (n = 0, nn = this.sets.length; n < nn; n++) {
    set = this.sets[n];
    for (i = 0, ii = set.length; i < ii; i++) {
      set[i].paint(gx);
      set[i].elevation(sx);
    }
  }
};

Scenes.attract.prototype.paintMap = function(view){
  for(var set, n=0, nn=this.sets.length; n<nn; n++){
    set = this.sets[n];
    for(i=0, ii=set.length; i<ii; i++){
      set[i].paint(view);
    }
  }
}


Scenes.attract.prototype.paintTitle = function(view){

  var color = '#0ff';

  if(Math.random() < 0.05){
    color = '#0cc';
  }
  if(Math.random() < 0.01){
    color = '#099';
  }

  view.ctx.fillStyle = color;
  view.ctx.font = '36pt ubuntu mono, monospace';
  view.ctx.textBaseline = 'middle';
  view.ctx.textAlign = 'center';

  view.ctx.save();
  view.ctx.translate(Math.random(), Math.random());
  view.ctx.scale(1 + (Math.random() * 0.005), 1 + (Math.random() * 0.005));
  view.ctx.fillText(this.attrs.mode, this.opts.max_x * 0.8,this.opts.max_y * 0.1);
  view.ctx.restore();
};

Scenes.attract.prototype.paintData = function(view){

  if(!this.stats[this.attrs.mode]){
    return;
  }

  var keys = ['type', 'mission', 'speed', 'range', 'weapon', 'activate'];

  view.ctx.save();


  view.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.5 );
  view.ctx.fillStyle = '#0f0';
  view.ctx.font = '24pt ubuntu mono, monospace';

  var t = Math.floor(this.attrs.time * 2);

  var c = 0;

  var yy = 0;
  for (var i = 0; i < keys.length; i++) {
    var s, q, v;

    view.ctx.textAlign = 'right';

    view.ctx.fillStyle = '#0f0';
    if(Math.random() < 0.05){
      view.ctx.fillStyle = '#090';
    }
    if(Math.random() < 0.01){
      view.ctx.fillStyle = '#060';
    }

    s = keys[i];

    q = s.length;
    v = 0;

    while (c < t && v <= q) {
      view.ctx.save();
      view.ctx.translate(Math.random(), Math.random());
      view.ctx.fillText(s.substr(q - v, v), this.opts.max_x * 0.18, yy + (40 * i));
      view.ctx.restore();
      v++;
      c++;
    }

    view.ctx.textAlign = 'left';

    view.ctx.fillStyle = '#fff';
    if(Math.random() < 0.05){
      view.ctx.fillStyle = '#999';
    }
    if(Math.random() < 0.01){
      view.ctx.fillStyle = '#666';
    }

    s = this.stats[this.attrs.mode][keys[i]];

    q = s.length;
    v = 0;

    while (c < t && v <= q) {
      view.ctx.save();
      view.ctx.translate(Math.random(), Math.random());
      view.ctx.fillText(s.substr(0, v), this.opts.max_x * 0.20, yy + (40 * i));
      view.ctx.restore();
      v++;
      c++;
    }

  }

  view.ctx.restore();

};

Scenes.attract.prototype.paintActor = function(view){

  // actors

  var color = '#0ff';

  if(Math.random() < 0.05){
    color = '#0cc';
  }
  if(Math.random() < 0.01){
    color = '#099';
  }

  view.ctx.save();
  view.ctx.translate(this.opts.max_x * 0.8, this.opts.max_y * 0.3);

  var info;

  if (this.attrs.mode === 'capital') {
    info = 'detects and commands';

    if (this.capitals[0].attrs.flash) {
      view.ctx.fillStyle = color;
    } else {
      view.ctx.fillStyle = 'rgba(' + hex2rgb(color) + ',0.25)';
    }

    view.ctx.strokeStyle = color;
    view.ctx.lineWidth = 8;
    view.ctx.beginPath();
    view.ctx.rect(-50, -50, 100, 100);
    view.ctx.fill();
    view.ctx.stroke();

    if (this.capitals[0].attrs.flash) {
      view.ctx.fillStyle = '#000';
    } else {
      view.ctx.fillStyle = color;
    }
    view.ctx.font = '48pt ubuntu mono, monospace';
    view.ctx.textBaseline = 'middle';
    view.ctx.textAlign = 'center';

    view.ctx.fillText(this.capitals[0].attrs.defcon, 0, 3);

  }

  if (this.attrs.mode === 'city') {
    info = 'provides labour';
    view.ctx.strokeStyle = color;
    view.ctx.fillStyle = color;
    view.ctx.lineWidth = 8;
    view.ctx.beginPath();
    view.ctx.arc(0, 0, 50, 0, 2 * Math.PI);
    view.ctx.stroke();
  }

  if (this.attrs.mode === 'factory') {
    info = 'builds munitions';
    view.ctx.strokeStyle = color;
    view.ctx.fillStyle = color;
    view.ctx.lineWidth = 8;
    view.ctx.beginPath();
    view.ctx.beginPath();
    view.ctx.moveTo(0, -50);
    view.ctx.lineTo(50, 50);
    view.ctx.lineTo(-50, 50);
    view.ctx.closePath();
    view.ctx.stroke();
  }

  if (this.attrs.mode === 'base') {
    info = 'stockpiles munitions';
    view.ctx.strokeStyle = color;
    view.ctx.fillStyle = color;
    view.ctx.lineWidth = 8;
    view.ctx.beginPath();
    view.ctx.rect(-50, -50, 100, 100);
    view.ctx.stroke();

    view.ctx.fillStyle = color;
    view.ctx.font = '24pt ubuntu mono, monospace';
    view.ctx.textBaseline = 'middle';
    if (this.bases[0] && this.bases[0].attrs.stock.bombers > 0) {
      view.ctx.textAlign = 'right';
      view.ctx.fillStyle = color;
      view.ctx.fillText(this.bases[0].attrs.stock.bombers, -70, -30);
      view.ctx.fillStyle = '#999';
      view.ctx.fillText('bombers', -140, -30);

    }

    if (this.bases[0].attrs.stock.fighters > 0) {
      view.ctx.textAlign = 'right';
      view.ctx.fillStyle = color;
      view.ctx.fillText(this.bases[0].attrs.stock.fighters, -70, 30);
      view.ctx.fillStyle = '#999';
      view.ctx.fillText('fighters', -140, 30);
    }

    if (this.bases[0].attrs.stock.icbms > 0) {
      view.ctx.textAlign = 'left';
      view.ctx.fillStyle = color;
      view.ctx.fillText(this.bases[0].attrs.stock.icbms, 70, -30);
      view.ctx.fillStyle = '#999';
      view.ctx.fillText('icbms', 140, -30);
    }

    if (this.bases[0].attrs.stock.abms > 0) {
      view.ctx.textAlign = 'left';
      view.ctx.fillStyle = color;
      view.ctx.fillText(this.bases[0].attrs.stock.abms, 70, 30);
      view.ctx.fillStyle = '#999';
      view.ctx.fillText('abms', 140, 30);
    }

  }

  view.ctx.restore();

  if(info){
    view.ctx.save();
    view.ctx.translate(Math.random(), Math.random());
    view.ctx.textAlign = 'center';
    view.ctx.font = '24pt ubuntu mono, monospace';
    view.ctx.fillText(info, this.opts.max_x * 0.8, this.opts.max_y * 0.7);
    view.ctx.restore();
  }

};

Scenes.attract.prototype.paintObject = function(view){

  var z = 48;

  view.ctx.save();
  view.ctx.translate(this.opts.max_x * 0.8, this.opts.max_y * 0.3 );
  view.ctx.rotate(this.attrs.angle);

  var color = '#0ff';

  if(Math.random() < 0.05){
    color = '#0cc';
  }
  if(Math.random() < 0.01){
    color = '#099';
  }


  view.ctx.fillStyle = color;
  view.ctx.strokeStyle = color;

  switch (this.attrs.mode) {
  case 'bomber':
    view.ctx.lineWidth = 1
    view.ctx.beginPath();
    view.ctx.moveTo(z, 0);
    view.ctx.lineTo(-z, -z);
    view.ctx.lineTo(-z / 2, 0);
    view.ctx.lineTo(-z, z);
    view.ctx.lineTo(z, 0);
    view.ctx.closePath();
    view.ctx.fill();
    view.ctx.stroke();
    break;

  case 'fighter':
    view.ctx.lineWidth = 24;
    view.ctx.beginPath();
    view.ctx.moveTo(-z, -z);
    view.ctx.lineTo(0, 0);
    view.ctx.lineTo(-z, z);
    view.ctx.stroke();

    view.ctx.beginPath();
    view.ctx.lineTo(0, 0);
    view.ctx.lineTo(z, 0);
    view.ctx.stroke();
    break;

  case 'icbm':
    z = 48;
    view.ctx.beginPath();
    view.ctx.moveTo(2 * z, 0);
    view.ctx.lineTo(-z, -z);
    view.ctx.lineTo(-z, z);
    view.ctx.lineTo(2 * z, 0);
    view.ctx.closePath();
    view.ctx.fill();
    break;

  case 'abm':
    view.ctx.fillStyle = '#0ff';
    view.ctx.beginPath();
    view.ctx.fillRect(-z * 0.5, -z * 0.5, z, z);
    break;

  case 'sat':
    view.ctx.lineWidth = 12
    view.ctx.fillStyle = '#000';
    view.ctx.fillRect(-z, -z, 2 * z, 2 * z);

    view.ctx.fillStyle = '#0ff';
    view.ctx.strokeStyle = '#0ff';

    view.ctx.beginPath();
    view.ctx.moveTo(-z, -z);
    view.ctx.lineTo(z, z);
    view.ctx.stroke();

    view.ctx.beginPath();
    view.ctx.rect(-z, -z, 2 * z, 2 * z);
    view.ctx.stroke();
    break;

  }

  view.ctx.restore();
};


Scenes.attract.prototype.paintElevation = function(view){

  for(var set, n=0, nn=this.sets.length; n<nn; n++){
    set = this.sets[n];
    for(i=0, ii=set.length; i<ii; i++){
      set[i].elevation(view);
    }
  }

};


Scenes.attract.prototype.mode_init = function(){

  this.enemy_capital = new Actors.Capital(
    this.env, {
      scene: this,
    }, {
      x: this.opts.max_x * 0.8,
      y: this.opts.max_y * 0.5,
      z: 0,
      color: '#f05',
      defcon: 5,
      unit_rate: 0,
      bases_max: 0,
      cities_max: 0,
      factories_max: 0,
      sats_max: 0,
      bomber_launch_max: 0,
      fighter_launch_max: 0,
      icbm_launch_max: 0,
      abm_launch_max: 0,
      bombers_max: 0,
      fighters_max: 0,
      icbms_max: 0,
      abms_max: 0
    });

  this.maps = [];
  this.booms = [];
  this.capitals = [];
  this.cities = [];
  this.bases = [];
  this.factories = [];
  this.supplies = [];
  this.bombers = [];
  this.fighters = [];
  this.icbms = [];
  this.abms = [];
  this.sats = [];
  this.decoys = [];

  this.sets = [
    this.capitals,
    this.cities,
    this.bases,
    this.factories,
    this.sats,
    this.bombers,
    this.supplies,
    this.fighters,
    this.icbms,
    this.abms,
    this.booms,
    this.decoys
  ];

  var capital;

  if (this.attrs.mode === 'capital') {
    capital = new Actors.Capital(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.2,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        defcon: 5,
        unit_rate: 0,
        bases_max: 0,
        cities_max: 0,
        factories_max: 0,
        sats_max: 0,
        bomber_launch_max: 1,
        fighter_launch_max: 1,
        icbm_launch_max: 1,
        abm_launch_max: 1,
        bombers_max: 0,
        fighters_max: 0,
        icbms_max: 0,
        abms_max: 0
      });

  }

  if (this.attrs.mode === 'city') {
    capital = new Actors.Capital(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.2,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        defcon: 5,
        unit_rate: 0,
        bases_max: 0,
        cities_max: 1,
        factories_max: 0,
        sats_max: 0,
        bomber_launch_max: 1,
        fighter_launch_max: 1,
        icbm_launch_max: 1,
        abm_launch_max: 1,
        bombers_max: 0,
        fighters_max: 0,
        icbms_max: 0,
        abms_max: 0
      });
  }

  if (this.attrs.mode === 'factory') {
    capital = new Actors.Capital(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.2,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        defcon: 5,
        unit_rate: 0,
        bases_max: 0,
        cities_max: 1,
        factories_max: 1,
        sats_max: 0,
        bomber_launch_max: 1,
        fighter_launch_max: 1,
        icbm_launch_max: 1,
        abm_launch_max: 1,
        bombers_max: 0,
        fighters_max: 0,
        icbms_max: 0,
        abms_max: 0
      });
  }

  if (this.attrs.mode === 'base') {
    capital = new Actors.Capital(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.2,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        defcon: 5,
        unit_rate: 1,
        bases_max: 1,
        cities_max: 2,
        factories_max: 2,
        sats_max: 0,
        bomber_launch_max: 1,
        fighter_launch_max: 1,
        icbm_launch_max: 1,
        abm_launch_max: 1,
        bombers_max: 0,
        fighters_max: 0,
        icbms_max: 0,
        abms_max: 0
      });
  }

  if (this.attrs.mode === 'bomber') {
    capital = new Actors.Capital(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.2,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        defcon: 5,
        unit_rate: 0,
        bases_max: 1,
        cities_max: 0,
        factories_max: 0,
        sats_max: 0,
        bomber_launch_max: 1,
        fighter_launch_max: 1,
        icbm_launch_max: 1,
        abm_launch_max: 1,
        bombers_max: 1,
        fighters_max: 1,
        icbms_max: 1,
        abms_max: 1
      });

    this.decoys.push(new Actors.Decoy(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.55,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#f0f',
        hidden: false
      }));


    this.decoys.push(new Actors.Decoy(
      this.env, {
        scene: this,
        capital: capital,
      }, {
        x: capital.pos.x + capital.attrs.base_r,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        hidden: true,
        bombers: 1
      }));

  }

  if (this.attrs.mode === 'fighter') {

    capital = new Actors.Capital(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.2,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        defcon: 4,
        unit_rate: 0,
        bases_max: 1,
        cities_max: 0,
        factories_max: 0,
        sats_max: 0,
        bomber_launch_max: 1,
        fighter_launch_max: 1,
        icbm_launch_max: 1,
        abm_launch_max: 1,
        bombers_max: 1,
        fighters_max: 0,
        icbms_max: 0,
        abms_max: 0,
        stock: {
          bombers: 0,
          fighters: 1,
          icbms: 0,
          abms: 0
        }
      });

    this.decoys.push(new Actors.Decoy(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.55,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#f0f',
        hidden: false,
        bombers: 1
      }));


    this.decoys.push(new Actors.Decoy(
      this.env, {
        scene: this,
        capital: capital,
      }, {
        x: capital.pos.x + capital.attrs.base_r,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        hidden: true,
        fighters: 10
      }));

  }

  if (this.attrs.mode === 'icbm') {

    capital = new Actors.Capital(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.2,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        defcon: 4,
        unit_rate: 0,
        bases_max: 1,
        cities_max: 0,
        factories_max: 0,
        sats_max: 0,
        bomber_launch_max: 1,
        fighter_launch_max: 1,
        icbm_launch_max: 1,
        abm_launch_max: 1,
        bombers_max: 1,
        fighters_max: 0,
        icbms_max: 0,
        abms_max: 0,
      });


    this.decoys.push(new Actors.Decoy(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.55,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#f0f',
        hidden: false,
        icbms: 0
      }));

    this.decoys.push(new Actors.Decoy(
      this.env, {
        scene: this,
        capital: capital,
      }, {
        x: capital.pos.x + capital.attrs.base_r,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        hidden: true,
        icbms: 1
      }));

  }

  if (this.attrs.mode === 'abm') {

    capital = new Actors.Capital(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.2,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        defcon: 4,
        unit_rate: 0,
        bases_max: 1,
        cities_max: 0,
        factories_max: 0,
        sats_max: 0,
        bomber_launch_max: 1,
        fighter_launch_max: 1,
        icbm_launch_max: 1,
        abm_launch_max: 1,
        bombers_max: 1,
        fighters_max: 0,
        icbms_max: 0,
        abms_max: 0,
      });


    this.decoys.push(new Actors.Decoy(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.55,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#f0f',
        hidden: false,
        icbms: 1
      }));

    this.decoys.push(new Actors.Decoy(
      this.env, {
        scene: this,
        capital: capital,
      }, {
        x: capital.pos.x + capital.attrs.base_r,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        hidden: true,
        abms: 20
      }));

  }

  if (this.attrs.mode === 'sat') {

    capital = new Actors.Capital(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.2,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        defcon: 4,
        unit_rate: 0,
        bases_max: 1,
        cities_max: 0,
        factories_max: 0,
        sats_max: 0,
        bomber_launch_max: 1,
        fighter_launch_max: 1,
        icbm_launch_max: 1,
        abm_launch_max: 1,
        bombers_max: 1,
        fighters_max: 0,
        icbms_max: 0,
        abms_max: 0,
        sats_max: 0
      });

    var sat = new Actors.Sat(
      this.env, {
        scene: this,
        capital: capital,
      }, {
        x: this.opts.max_x * 0.5,
        y: this.opts.max_y * 0.5,
        z: this.opts.max_z * 0.85,
        color: '#fc0',
        laser_range: this.opts.max * 0.3
      });

    this.sats.push(sat);

    this.decoys.push(new Actors.Decoy(
      this.env, {
        scene: this,
      }, {
        x: this.opts.max_x * 0.55,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#f0f',
        hidden: false,
        icbms: 1
      }));

    this.decoys.push(new Actors.Decoy(
      this.env, {
        scene: this,
        capital: capital,
      }, {
        x: capital.pos.x + capital.attrs.base_r,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0',
        hidden: true,
      }));

  }

  this.capitals.push(capital);

};


Scenes.attract.prototype.stats = {
  bomber: {
    type: 'BOMBER',
    mission: 'destroy',
    speed: 'slow',
    range: 'long',
    weapon: 'laser',
    activate: 'defcon 5'
  },
  fighter: {
    type: 'FIGHTER',
    mission: 'intercept',
    speed: 'fast',
    range: 'medium',
    weapon: 'laser',
    activate: 'defcon 4'
  },
  icbm: {
    type: 'ICBM',
    mission: 'destroy',
    speed: 'supersonic',
    range: 'intercontinental',
    weapon: 'warhead',
    activate: 'defcon 3'
  },
  abm: {
    type: 'ABM',
    mission: 'intercept',
    speed: 'fast',
    range: 'short',
    weapon: 'hi-ex',
    activate: 'auto'
  },
  sat: {
    type: 'SAT',
    mission: 'intercept',
    speed: 'fast',
    range: 'orbital',
    weapon: 'laser',
    activate: 'defcon 2'

  },
};
