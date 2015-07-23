/*global Scenes:true, Boom:true, Capital:true, World:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.attract = function(el, opts) {

  var self = this;
  this.el = el;

  if(!opts){
    opts = {};
  }

  var sets = [];

  this.modes = [
    'capital','city','factory','base',
    'bomber','fighter','icbm','abm','sat'
  ];

  this.modeIndex = 0;
  this.modeLife = 20;
  this.modeTtl = this.modeLife;

  if(this.mode){
    this.mode = opts.mode;
  } else {
    this.mode = this.modes[this.modeIndex];
  }

  var speed_factor = 1.5;

  this.show_opts = false;
  this.show_meta = false;
  this.show_help = false;
  this.show_help_changed = false;

  this.at = 0;

  var views = {
    map: null,
    elevation: null
  };

  var timers = {
    update: null,
    paint: null
  };

  this.angle = 1.5 * Math.PI;
  this.angle_v = 0.01;

  var time = 0;

  var stats = {
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

  // enemy capital doesn't go in collection or get rendered
  var enemyCapital;

  setParams(opts);
  init();

  function setParams(){
    self.params = [{
      key: 'capital_count',
      info: 'Capitals',
      value: 2,
      min: 1,
      max: 4
    }, {
      key: 'defcon',
      info: 'Defcon',
      value: 5,
      min: 1,
      max: 5
    }, {
      key: 'danger_close',
      info: 'Danger Close',
      value: 350,
      min: 50,
      max: 1000
    }, {
      key: 'bases_max',
      info: 'Number of Bases each Nation State starts with',
      value: 3,
      min: 0,
      max: 5
    }, {
      key: 'cities_max',
      info: 'Number of Cities each Nation State starts with',
      value: 3,
      min: 0,
      max: 5
    }, {
      key: 'factories_max',
      info: 'Number of Factories each Nation State starts with',
      value: 3,
      min: 0,
      max: 5
    }, {
      key: 'units',
      info: 'Starting Units for Factory',
      value: 0,
      min: 0,
      max: 1000
    }, {
      key: 'unit_rate',
      info: 'Unit Production Rate for Factories',
      value: 1,
      min: 0,
      max: 5
    }, {
      key: 'stock_bombers',
      info: 'Number of Bombers each Base starts with',
      value: 0,
      min: 0,
      max: 1000
    }, {
      key: 'stock_fighters',
      info: 'Number of Fighters each Base starts with',
      value: 0,
      min: 0,
      max: 1000
    }, {
      key: 'stock_icbms',
      info: 'Number ICBMs each Base starts with. ICBMs launch intermittently below Defcon3. At Defcon 1, they all launch.',
      value: 0,
      min: 0,
      max: 1000
    }, {
      key: 'stock_abms',
      info: 'Number ABMs each Base starts with. ABMs launch when ICBMs get close.',
      value: 0,
      min: 0,
      max: 1000
    }, {
      key: 'fighter_launch_max',
      info: 'Number of Fighters each Base can have in air at any time.',
      value: 10,
      min: 0,
      max: 100
    }, {
      key: 'bomber_launch_max',
      info: 'Number of Bombers each Base can have in air at any time.',
      value: 10,
      min: 0,
      max: 100
    }, {
      key: 'icbm_launch_max',
      info: 'Number of ICBMs each Base can have in air at any time.',
      value: 5,
      min: 0,
      max: 100
    }, {
      key: 'abm_launch_max',
      info: 'Number of ABMs each Base can have in air at any time',
      value: 10,
      min: 0,
      max: 100
    }, {
      key: 'sats_max',
      info: 'Number of Satellites each Capital can have. Sats launch at Defcon 3.',
      value: 1,
      min: 0,
      max: 10
    }, {
      key: 'fighter_range',
      info: 'Max range from base',
      value: 200,
      min: 0,
      max: 1000
    }, {
      key: 'fighter_range',
      info: 'Max range from base',
      value: 200,
      min: 0,
      max: 1000
    }, {
      key: 'fighter_separation_friend',
      info: 'Separation from Friend',
      value: 0.2,
      min: 0.05,
      max: 1,
      step: 0.05
    }, {
      key: 'fighter_separation_enemy',
      info: 'Separation from Enemy',
      value: 0.1,
      min: 0.05,
      max: 1,
      step: 0.05
    }, {
      key: 'fighter_gas',
      info: 'Gas',
      value: 600,
      min: 0,
      max: 1000
    }, {
      key: 'bomber_hp_multiplier',
      info: '.',
      value: 1,
      min: 0.1,
      max: 10,
      step: 0.1
    }, {
      key: 'bomber_laser_range',
      info: '.',
      value: 0.1,
      min: 0.001,
      max: 0.25,
      step: 0.001
    }, {
      key: 'bomber_separation_friend',
      info: 'Separation from Friend',
      value: 0.025,
      min: 0.005,
      max: 0.2,
      step: 0.005
    }, {
      key: 'bomber_separation_enemy',
      info: 'Separation from Enemy',
      value: 0.02,
      min: 0.005,
      max: 0.2,
      step: 0.005
    }, {
      key: 'bomber_avoidance_enemy',
      info: 'Avoidance from Enemy',
      value: 0.25,
      min: 0.05,
      max: 1,
      step: 0.05
    }, {
      key: 'first_strike',
      info: 'First Strike',
      value: 0,
      min: 0,
      max: 1
    }, {
      key: 'safe_mode',
      info: 'Safe Mode',
      value: 0,
      min: 0,
      max: 1
    }, {
      key: 'sounds',
      info: 'Sounds',
      value: 0,
      min: 0,
      max: 1
    }, {
      key: 'gameover_restart_delay',
      info: 'Game Over restart delay',
      value: 5,
      min: 0,
      max: 30
    }, {
      key: 'max_x',
      info: 'Max X',
      value: 1600,
      min: 400,
      max: 1600
    }, {
      key: 'max_y',
      info: 'Max Y',
      value: 500,
      min: 200,
      max: 1000
    }, {
      key: 'max_z',
      info: 'Max Z',
      value: 200,
      min: 50,
      max: 500
    }];

    self.opts = {};

    self.params.forEach(function(param){
      if(opts && opts.hasOwnProperty(param.key)){
        self.opts[param.key] = Number(opts[param.key]);
      } else {
        self.opts[param.key] = param.value;
      }
    });
  }

  function update() {

    var timer = Date.now();

    var n, nn, set, i, ii;
    var at = Date.now();
    var delta = self.delta = (at - self.at) / 16.77;
    self.at = at;

    time += delta / 5;

    self.angle += self.angle_v;

    self.world.update();

    for (n = 0, nn = sets.length; n < nn; n++) {
      set = sets[n];
      for (i = 0, ii = set.length; i < ii; i++) {
        set[i].update(delta);
        if (set[i].dead) {
          set.splice(i, 1);
          i--;
          ii--;
        }
      }
    }

    if (self.mode === 'capital') {
      var defcon = (5 - Math.floor(time / 30) % 5);
      if (defcon !== self.world.capitals[0].defcon) {
        self.world.capitals[0].defcon = defcon;
        self.world.capitals[0].alert = 2;
      }

    }

    timers.update = Date.now() - timer;

  }

  function paint() {

    var n, nn, set, i, ii, text_x;

    var timer = Date.now();

    views.map.ctx.clearRect(0, 0, views.map.w, views.map.h);
    views.elv.ctx.clearRect(0, 0, views.elv.w, views.elv.h);

    if(self.world.flash) {
      views.map.ctx.fillStyle = '#fff';
      views.map.ctx.fillRect(0, 0, views.map.w, views.map.h);
      views.elv.ctx.fillStyle = '#fff';
      views.elv.ctx.fillRect(0, 0, views.elv.w, views.elv.h);
    }

    views.map.ctx.save();
    views.map.ctx.translate(views.map.offset_x, views.map.offset_y);
    views.map.ctx.scale(views.map.scale, views.map.scale);

    views.elv.ctx.save();
    views.elv.ctx.translate(views.elv.offset_x, views.elv.offset_z);
    views.elv.ctx.scale(views.elv.scale, views.elv.scale);

    for (n = 0, nn = sets.length; n < nn; n++) {
      set = sets[n];
      for (i = 0, ii = set.length; i < ii; i++) {
        set[i].paint(views.map);
        set[i].elevation(views.elv);
      }
    }


    // actors

    var color = '#0ff';

    if(Math.random() < 0.05){
      color = '#0cc';
    }
    if(Math.random() < 0.01){
      color = '#099';
    }

    views.map.ctx.fillStyle = color;
    views.map.ctx.font = '32pt ubuntu mono, monospace';
    views.map.ctx.textBaseline = 'middle';
    views.map.ctx.textAlign = 'center';

    views.map.ctx.save();
    views.map.ctx.translate(Math.random(), Math.random());
    views.map.ctx.fillText(self.mode, self.max_x * 0.7, 12);
    views.map.ctx.restore();

    views.map.ctx.save();
    views.map.ctx.translate(self.max_x * 0.7, self.max_y * 0.3);

    var info;

    if (self.mode === 'capital') {
      info = 'detects and commands';
      if (self.world.capitals[0].flash) {
        views.map.ctx.fillStyle = color;
      } else {
        views.map.ctx.fillStyle = 'rgba(' + hex2rgb(color) + ',0.25)';
      }

      views.map.ctx.strokeStyle = color;
      views.map.ctx.lineWidth = 8;
      views.map.ctx.beginPath();
      views.map.ctx.rect(-50, -50, 100, 100);
      views.map.ctx.fill();
      views.map.ctx.stroke();

      if (self.world.capitals[0].flash) {
        views.map.ctx.fillStyle = '#000';
      } else {
        views.map.ctx.fillStyle = color;
      }
      views.map.ctx.font = '48pt ubuntu mono, monospace';
      views.map.ctx.textBaseline = 'middle';
      views.map.ctx.textAlign = 'center';

      views.map.ctx.fillText(self.world.capitals[0].defcon, 0, 3);

    }

    if (self.mode === 'city') {
      info = 'provides labour';
      views.map.ctx.strokeStyle = color;
      views.map.ctx.fillStyle = color;
      views.map.ctx.lineWidth = 8;
      views.map.ctx.beginPath();
      views.map.ctx.arc(0, 0, 50, 0, 2 * Math.PI);
      views.map.ctx.stroke();
    }

    if (self.mode === 'factory') {
      info = 'builds munitions';
      views.map.ctx.strokeStyle = color;
      views.map.ctx.fillStyle = color;
      views.map.ctx.lineWidth = 8;
      views.map.ctx.beginPath();
      views.map.ctx.beginPath();
      views.map.ctx.moveTo(0, -50);
      views.map.ctx.lineTo(50, 50);
      views.map.ctx.lineTo(-50, 50);
      views.map.ctx.closePath();
      views.map.ctx.stroke();
    }

    if (self.mode === 'base') {
      info = 'stockpiles munitions';
      views.map.ctx.strokeStyle = color;
      views.map.ctx.fillStyle = color;
      views.map.ctx.lineWidth = 8;
      views.map.ctx.beginPath();
      views.map.ctx.rect(-50, -50, 100, 100);
      views.map.ctx.stroke();

      views.map.ctx.fillStyle = color;
      views.map.ctx.font = '24pt ubuntu mono, monospace';
      views.map.ctx.textBaseline = 'middle';
      if (self.world.bases[0] && self.world.bases[0].stock.bombers > 0) {
        views.map.ctx.textAlign = 'right';
        views.map.ctx.fillStyle = color;
        views.map.ctx.fillText(self.world.bases[0].stock.bombers, -70, -30);
        views.map.ctx.fillStyle = '#999';
        views.map.ctx.fillText('bombers', -140, -30);

      }

      if (self.world.bases[0].stock.fighters > 0) {
        views.map.ctx.textAlign = 'right';
        views.map.ctx.fillStyle = color;
        views.map.ctx.fillText(self.world.bases[0].stock.fighters, -70, 30);
        views.map.ctx.fillStyle = '#999';
        views.map.ctx.fillText('fighters', -140, 30);
      }

      if (self.world.bases[0].stock.icbms > 0) {
        views.map.ctx.textAlign = 'left';
        views.map.ctx.fillStyle = color;
        views.map.ctx.fillText(self.world.bases[0].stock.icbms, 70, -30);
        views.map.ctx.fillStyle = '#999';
        views.map.ctx.fillText('icbms', 140, -30);
      }

      if (self.world.bases[0].stock.abms > 0) {
        views.map.ctx.textAlign = 'left';
        views.map.ctx.fillStyle = color;
        views.map.ctx.fillText(self.world.bases[0].stock.abms, 70, 30);
        views.map.ctx.fillStyle = '#999';
        views.map.ctx.fillText('abms', 140, 30);
      }

    }


    if (self.mode === 'bomber') {
      paintObject('bomber');
      paintData('bomber');
    }

    if (self.mode === 'fighter') {
      paintObject('fighter');
      paintData('fighter');
    }

    if (self.mode === 'icbm') {
      paintObject('icbm');
      paintData('icbm');
    }

    if (self.mode === 'abm') {
      paintObject('abm');
      paintData('abm');
    }

    if (self.mode === 'sat') {
      paintObject('sat');
      paintData('sat');
    }


    views.map.ctx.restore();

    if (info) {
      views.map.ctx.fillStyle = color;
      views.map.ctx.font = '24pt ubuntu mono, monospace';
      views.map.ctx.textBaseline = 'middle';
      views.map.ctx.textAlign = 'center';

      if (time < info.length) {
        info = info.substr(0, Math.floor(time));
      }

      views.map.ctx.save();
      views.map.ctx.translate(Math.random(), Math.random());
      views.map.ctx.fillText(info, self.max_x * 0.7, self.max_y * 0.6);
      views.map.ctx.restore();

    }

    //

    views.map.ctx.restore();
    views.elv.ctx.restore();

    views.elv.ctx.fillStyle = '#999';
    views.elv.ctx.font = '14pt ubuntu mono, monospace';
    views.elv.ctx.textBaseline = 'top';
    views.elv.ctx.textAlign = 'left';
    views.elv.ctx.fillText('side view', 16, 16);

    views.map.ctx.fillStyle = '#999';
    views.map.ctx.font = '14pt ubuntu mono, monospace';
    views.map.ctx.textBaseline = 'top';
    views.map.ctx.textAlign = 'left';
    views.map.ctx.fillText('top view', 16, 16);


    timers.paint = Date.now() - timer;
    timers.total = timers.update + timers.paint;


  }

  function paintObject(type) {

    var z = 64;

    //views.map.ctx.translate(self.max_x * 0.7, self.max_y * 0.5);
    views.map.ctx.rotate(self.angle);

    var color = '#0ff';

    if(Math.random() < 0.05){
      color = '#0cc';
    }
    if(Math.random() < 0.01){
      color = '#099';
    }


    views.map.ctx.fillStyle = color;
    views.map.ctx.strokeStyle = color;

    switch (type) {
    case 'bomber':
      views.map.ctx.lineWidth = 1;
      views.map.ctx.beginPath();
      views.map.ctx.moveTo(z, 0);
      views.map.ctx.lineTo(-z, -z);
      views.map.ctx.lineTo(-z / 2, 0);
      views.map.ctx.lineTo(-z, z);
      views.map.ctx.lineTo(z, 0);
      views.map.ctx.closePath();
      views.map.ctx.fill();
      views.map.ctx.stroke();
      break;

    case 'fighter':
      views.map.ctx.lineWidth = 24;
      views.map.ctx.beginPath();
      views.map.ctx.moveTo(-z, -z);
      views.map.ctx.lineTo(0, 0);
      views.map.ctx.lineTo(-z, z);
      views.map.ctx.stroke();

      views.map.ctx.beginPath();
      views.map.ctx.lineTo(0, 0);
      views.map.ctx.lineTo(z, 0);
      views.map.ctx.stroke();
      break;

    case 'icbm':
      z = 48;
      views.map.ctx.beginPath();
      views.map.ctx.moveTo(2 * z, 0);
      views.map.ctx.lineTo(-z, -z);
      views.map.ctx.lineTo(-z, z);
      views.map.ctx.lineTo(2 * z, 0);
      views.map.ctx.closePath();
      views.map.ctx.fill();
      break;

    case 'abm':
      views.map.ctx.fillStyle = '#0ff';
      views.map.ctx.beginPath();
      views.map.ctx.fillRect(-z * 0.5, -z * 0.5, z, z);
      break;

    case 'sat':
      views.map.ctx.lineWidth = 16;
      views.map.ctx.fillStyle = '#000';
      views.map.ctx.fillRect(-z, -z, 2 * z, 2 * z);

      views.map.ctx.fillStyle = '#0ff';
      views.map.ctx.strokeStyle = '#0ff';

      views.map.ctx.beginPath();
      views.map.ctx.moveTo(-z, -z);
      views.map.ctx.lineTo(z, z);
      views.map.ctx.stroke();

      views.map.ctx.beginPath();
      views.map.ctx.rect(-z, -z, 2 * z, 2 * z);
      views.map.ctx.stroke();
      break;

    }

    views.map.ctx.restore();
  }


  function paintData(type) {

    var keys = ['type', 'mission', 'speed', 'range', 'weapon', 'activate'];

    views.map.ctx.save();
    views.map.ctx.translate(self.max_x * 0.5, self.max_y * 0.55);
    views.map.ctx.fillStyle = '#0f0';
    views.map.ctx.font = '24pt ubuntu mono, monospace';
    var t = Math.floor(time * 2);

    var c = 0;

    var yy = 0;
    for (var i = 0; i < keys.length; i++) {

      var s, q, v;

      views.map.ctx.textAlign = 'right';

      views.map.ctx.fillStyle = '#0f0';
      if(Math.random() < 0.05){
        views.map.ctx.fillStyle = '#090';
      }
      if(Math.random() < 0.01){
        views.map.ctx.fillStyle = '#060';
      }

      s = keys[i];
      q = s.length;
      v = 0;

      while (c < t && v <= q) {
        views.map.ctx.save();
        views.map.ctx.translate(Math.random(), Math.random());
        views.map.ctx.fillText(s.substr(q - v, v), self.max_x * 0.18, yy + (40 * i));
        views.map.ctx.restore();
        v++;
        c++;
      }

      views.map.ctx.textAlign = 'left';

      views.map.ctx.fillStyle = '#fff';
      if(Math.random() < 0.05){
        views.map.ctx.fillStyle = '#999';
      }
      if(Math.random() < 0.01){
        views.map.ctx.fillStyle = '#666';
      }

      s = stats[type][keys[i]];
      q = s.length;
      v = 0;

      while (c < t && v <= q) {
        views.map.ctx.save();
        views.map.ctx.translate(Math.random(), Math.random());
        views.map.ctx.fillText(s.substr(0, v), self.max_x * 0.20, yy + (40 * i));
        views.map.ctx.restore();
        v++;
        c++;
      }

    }
  }

  function tick() {
    update();
    paint();

    self.modeTtl -= (self.delta/50);
    if(self.modeTtl <= 0){
      self.modeIndex++;
      if(self.modeIndex >= self.modes.length ){
        self.modeIndex = 0;
      }
      self.mode = self.modes[self.modeIndex];
      self.modeTtl = self.modeLife;
      restart();
      return;
    }

    self.raf = window.requestAnimationFrame(tick);
  }

  function init() {

    self.gameover = false;
    self.raf = null;
    self.at = 0;

    self.max_x = self.opts.max_x;
    self.max_y = self.opts.max_y;
    self.max_z = self.opts.max_z;

    self.world = new World({
      opts: self.opts,
      max_x: self.max_x,
      max_y: self.max_y,
      max_z: self.max_z,
      speed_factor: speed_factor
    });

    enemyCapital = new Capital({
      x: self.max_x * 0.8,
      y: self.max_y * 0.5,
      z: 0,
      color: '#fc0',
      world: self.world,
    });

    self.gameover = false;

    self.world.maps = [];
    self.world.booms = [];
    self.world.capitals = [];
    self.world.cities = [];
    self.world.bases = [];
    self.world.factories = [];
    self.world.supplies = [];
    self.world.bombers = [];
    self.world.fighters = [];
    self.world.icbms = [];
    self.world.abms = [];
    self.world.sats = [];
    self.world.decoys = [];

    sets = [
      self.world.capitals,
      self.world.cities,
      self.world.bases,
      self.world.factories,
      self.world.sats,
      self.world.bombers,
      self.world.supplies,
      self.world.fighters,
      self.world.icbms,
      self.world.abms,
      self.world.booms,
      self.world.decoys
    ];

    var capital;
    if (self.mode === 'capital') {
      capital = new Capital({
        x: self.world.max_x * 0.2,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#fc0',
        world: self.world,
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
        stock: {
          bombers: 0,
          fighters: 0,
          icbms: 0,
          abms: 0
        }
      });
    }

    if (self.mode === 'city') {
      capital = new Capital({
        x: self.world.max_x * 0.2,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#fc0',
        world: self.world,
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
        stock: {
          bombers: 0,
          fighters: 0,
          icbms: 0,
          abms: 0
        }
      });
    }

    if (self.mode === 'factory') {
      capital = new Capital({
        x: self.world.max_x * 0.2,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#fc0',
        world: self.world,
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
        stock: {
          bombers: 0,
          fighters: 0,
          icbms: 0,
          abms: 0
        }
      });
    }

    if (self.mode === 'base') {
      capital = new Capital({
        x: self.world.max_x * 0.2,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#fc0',
        world: self.world,
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
        stock: {
          bombers: 0,
          fighters: 0,
          icbms: 0,
          abms: 0
        }
      });
    }


    if (self.mode === 'bomber') {

      capital = new Capital({
        x: self.world.max_x * 0.2,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#fc0',
        world: self.world,
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
        stock: {
          bombers: 1,
          fighters: 0,
          icbms: 0,
          abms: 0
        }
      });

      self.world.decoys.push(new Decoy({
        //x: self.world.max_x * 0.3,
        x: self.world.max_x * 0.55,
        y: self.world.max_y * 0.5,
        z: 0,
        capital: enemyCapital,
        color: '#f0f',
        hidden: false,
        world: self.world
      }));

      self.world.decoys.push(new Decoy({
        x: self.world.max_x * 0.262,
        y: self.world.max_y * 0.5,
        z: 0,
        capital: capital,
        color: '#fc0',
        world: self.world,
        hidden: true,
        bombers: true
      }));

    }

    if (self.mode === 'fighter') {

      capital = new Capital({
        x: self.world.max_x * 0.2,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#fc0',
        world: self.world,
        defcon: 4,
        unit_rate: 0,
        bases_max: 1,
        cities_max: 0,
        factories_max: 0,
        sats_max: 0,
        bomber_launch_max: 0,
        fighter_launch_max: 0,
        icbm_launch_max: 0,
        abm_launch_max: 0,
        stock: {
          bombers: 0,
          fighters: 1,
          icbms: 0,
          abms: 0
        }
      });

      self.world.decoys.push(new Decoy({
        x: self.world.max_x * 0.55,
        y: self.world.max_y * 0.5,
        z: 0,
        capital: enemyCapital,
        color: '#f0f',
        hidden: false,
        world: self.world,
        bombers: true
      }));

      self.world.decoys.push(new Decoy({
        x: self.world.max_x * 0.262,
        y: self.world.max_y * 0.5,
        z: 0,
        capital: capital,
        color: '#fc0',
        world: self.world,
        hidden: true,
        fighters: 10
      }));

    }

    if (self.mode === 'icbm') {

      capital = new Capital({
        x: self.world.max_x * 0.2,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#fc0',
        world: self.world,
        defcon: 3,
        unit_rate: 0,
        bases_max: 1,
        cities_max: 0,
        factories_max: 0,
        sats_max: 0,
        bomber_launch_max: 1,
        fighter_launch_max: 1,
        icbm_launch_max: 1,
        abm_launch_max: 1,
        stock: {
          bombers: 0,
          fighters: 0,
          icbms: 1,
          abms: 0
        }
      });

      self.world.decoys.push(new Decoy({
        x: self.world.max_x * 0.55,
        y: self.world.max_y * 0.5,
        z: 0,
        capital: enemyCapital,
        color: '#f0f',
        hidden: false,
        world: self.world,
      }));

      self.world.decoys.push(new Decoy({
        x: self.world.max_x * 0.262,
        y: self.world.max_y * 0.5,
        z: 0,
        capital: capital,
        color: '#fc0',
        world: self.world,
        hidden: true,
        icbms: 1
      }));

    }

    if (self.mode === 'abm') {

      capital = new Capital({
        x: self.world.max_x * 0.2,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#fc0',
        world: self.world,
        defcon: 3,
        unit_rate: 0,
        bases_max: 1,
        cities_max: 0,
        factories_max: 0,
        sats_max: 0,
        bomber_launch_max: 1,
        fighter_launch_max: 1,
        icbm_launch_max: 1,
        abm_launch_max: 1,
        stock: {
          bombers: 0,
          fighters: 0,
          icbms: 0,
          abms: 1
        }
      });

      self.world.decoys.push(new Decoy({
        x: self.world.max_x * 0.55,
        y: self.world.max_y * 0.5,
        z: 0,
        capital: enemyCapital,
        color: '#f0f',
        hidden: false,
        world: self.world,
        icbms: 1
      }));

      self.world.decoys.push(new Decoy({
        x: self.world.max_x * 0.262,
        y: self.world.max_y * 0.5,
        z: 0,
        capital: capital,
        color: '#fc0',
        world: self.world,
        hidden: true,
        abms: 20
      }));

    }

    if (self.mode === 'sat') {

      capital = new Capital({
        x: self.world.max_x * 0.2,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#fc0',
        world: self.world,
        defcon: 2,
        unit_rate: 0,
        bases_max: 1,
        cities_max: 0,
        factories_max: 0,
        sats_max: 0,
        bomber_launch_max: 1,
        fighter_launch_max: 1,
        icbm_launch_max: 1,
        abm_launch_max: 1,
        stock: {
          bombers: 0,
          fighters: 0,
          icbms: 0,
          abms: 0
        }
      });

      var sat = new Sat({
        x: self.world.max_x * 0.5,
        y: self.world.max_y * 0.5,
        z: self.world.max_z * 0.8,
        world: self.world,
        capital: enemyCapital,
        color: '#f0f',
      });
      self.world.sats.push(sat);

      self.world.decoys.push(new Decoy({
        x: self.world.max_x * 0.55,
        y: self.world.max_y * 0.5,
        z: 0,
        capital: enemyCapital,
        color: '#f0f',
        hidden: false,
        world: self.world,
        icbms: 0
      }));

      self.world.decoys.push(new Decoy({
        x: self.world.max_x * 0.262,
        y: self.world.max_y * 0.5,
        z: 0,
        capital: capital,
        color: '#fc0',
        world: self.world,
        hidden: true,
        icbms: 1
      }));

    }

    self.world.capitals.push(capital);

  }

  function start(){
    render();
    init();
    self.at = Date.now();
    self.raf = window.requestAnimationFrame(tick);
  }

  function render() {

    var html;
    html = '';
    html += '<div id="map"><canvas id="cMap"></canvas></div>';
    html += '<div id="elevation"><canvas id="cElevation"></canvas></div>';
    html += '<div class="title title-large"><a href="/' + ROOT + '/">Cold War</a></div>';

    self.el.innerHTML = html;

    self.w = self.el.offsetWidth;
    self.h = self.el.offsetHeight;

    views.map = {};
    views.map.wrap = document.getElementById('map');
    views.map.el = document.getElementById('cMap');
    views.map.ctx = views.map.el.getContext('2d');

    views.map.w = views.map.wrap.offsetWidth;
    views.map.h = views.map.wrap.offsetHeight;

    views.map.el.width = views.map.w;
    views.map.el.height = views.map.h;

    views.map.scale_x = views.map.w / self.world.max_x;
    views.map.scale_y = views.map.h / self.world.max_y;
    views.map.scale = Math.min(views.map.scale_x, views.map.scale_y);

    views.map.offset_x = (views.map.w / 2) - ((self.world.max_x * views.map.scale) / 2);
    views.map.offset_y = (views.map.h / 2) - ((self.world.max_y * views.map.scale) / 2);

    views.elv = {};
    views.elv.wrap = document.getElementById('elevation');
    views.elv.el = document.getElementById('cElevation');
    views.elv.ctx = views.elv.el.getContext('2d');

    views.elv.w = views.elv.wrap.offsetWidth;
    views.elv.h = views.elv.wrap.offsetHeight;

    views.elv.el.width = views.elv.w;
    views.elv.el.height = views.elv.h;

    views.elv.scale_x = views.elv.w / self.world.max_x;
    views.elv.scale_z = views.elv.h / (views.elv.h / self.world.max_z);

    views.elv.scale = views.elv.scale_x;

    views.elv.offset_x = (views.elv.w / 2) - ((self.world.max_x * views.elv.scale) / 2);
    views.elv.offset_y = (views.elv.h / 2) - (((views.elv.h / self.world.max_z) * views.elv.scale) / 2);
    views.elv.yscale = views.elv.h / self.world.max_z / views.elv.scale;

  }

  function stop() {
    if(self.raf){
      window.cancelAnimationFrame(self.raf);
    }
  }

  function toggleOpts(){
    self.show_opts = !self.show_opts;
    render();
  }


  function toggleMeta() {
    self.show_meta = !self.show_meta;
  }

  function toggleHelp(){
    self.show_help = !self.show_help;
    self.show_help_changed = true;
  }

  function restart() {
    stop();
    setTimeout(start, 100);
  }

  window.onresize = restart;

  return {
    start: start,
    stop: stop,
    toggleMeta: toggleMeta
  };

};
