/*global Scenes:true, Boom:true, Capital:true, World:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.coldwar = function(el, opts){

  var self = this;

  var sets = [];
  var scenarios = [];
  loadScenarios();

  this.el = el;
  this.show_opts = false;
  this.show_meta = false;
  this.show_help = false;
  this.show_help_changed = false;

  var views = {
    map: null,
    elevation: null
  };

  this.zoom = 1;
  this.page_x = 0;
  this.page_y = 0;

  var timers = {
    update: null,
    paint: null
  };

  setParams(opts);
  init();

  function setParams(){
    self.params = [{
      key: 'scenario',
      info: 'Scenario',
      value: 0,
      min: 0,
      max: scenarios.length-1
    }, {
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


  function update(){

    var timer = Date.now();

    var n, nn, set, i, ii;
    var at = Date.now();
    var delta = self.delta = (at - self.at)/16.77;
    self.at = at;

    self.world.update();

    for(n=0, nn=sets.length; n<nn; n++){
      set = sets[n];
      for(i=0, ii=set.length; i<ii; i++){
        set[i].update(delta);
        if(set[i].dead){
          set.splice(i, 1);
          i--;
          ii--;
        }
      }
    }

    if(self.opts.capital_count > 1 && self.world.capitals.length <= 1 && ! self.gameover){
      self.gameover = true;
      setTimeout(init, self.opts.gameover_restart_delay * 1000, self);
    }

    timers.update = Date.now() - timer;

    if(self.show_help_changed){
      if(self.show_help){
        document.getElementById('help').style.display='block';
      } else {
        views.help.el.style.display='none';
      }
      self.show_help_changed = false;
    }


  }

  function paint(){

    var n, nn, set, i, ii, text_x;

    var timer = Date.now();

    // map
    views.map.ctx.clearRect(0, 0, views.map.w, views.map.h);
    views.map.ctx.save();

    views.map.ctx.translate(self.page_x, self.page_y);
    views.map.ctx.scale(self.zoom, self.zoom);

    if(self.world.flash && !self.opts.safe_mode){
      views.map.ctx.fillStyle='#ffffff';
      views.map.ctx.fillRect(0, 0, views.map.w, views.map.h);
    }

    views.map.ctx.translate(views.map.offset_x, views.map.offset_y);
    views.map.ctx.scale(views.map.scale, views.map.scale);

    // elevation
    views.elv.ctx.clearRect(0, 0, views.elv.w, views.elv.h);
    views.elv.ctx.save();

    //views.elv.ctx.translate(self.page_x, 0);
    //views.elv.ctx.scale(self.zoom, self.zoom);

    if(self.world.flash && !self.opts.safe_mode){
      views.elv.ctx.fillStyle='#fff';
      views.elv.ctx.fillRect(0, 0, views.elv.w, views.elv.h);
    }

    views.elv.ctx.translate(views.elv.offset_x, views.elv.offset_z);
    views.elv.ctx.scale(views.elv.scale, views.elv.scale);

    for(n=0, nn=sets.length; n<nn; n++){
      set = sets[n];
      for(i=0, ii=set.length; i<ii; i++){
        set[i].paint(views.map);
        set[i].elevation(views.elv);
      }
    }

    if(self.gameover && Date.now()/400 % 1 > 0.5){

      if(self.world.capitals.length === 0){
        views.map.ctx.fillStyle = '#fff';
        views.map.ctx.font = '32pt ubuntu mono, monospace';
        views.map.ctx.textBaseline = 'middle';
        views.map.ctx.textAlign = 'center';
        views.map.ctx.fillText('MAD', self.max_x/2, self.max_y * 0.1);

        views.elv.ctx.fillStyle = '#fff';
        views.elv.ctx.font = '24pt ubuntu mono, monospace';
        views.elv.ctx.textBaseline = 'middle';
        views.elv.ctx.textAlign = 'center';
        views.elv.ctx.fillText('MAD', self.max_x/2, self.max_y * 0.1);
      }

      if(self.world.capitals.length === 1){
        views.map.ctx.fillStyle = '#fff';
        views.map.ctx.font = '32pt ubuntu mono, monospace';
        views.map.ctx.textBaseline = 'middle';
        views.map.ctx.textAlign = 'center';
        views.map.ctx.fillText('WIN', self.world.capitals[0].pos.x, self.max_y * 0.1);

        views.elv.ctx.fillStyle = '#fff';
        views.elv.ctx.font = '24 ubuntu mono, monospace';
        views.elv.ctx.textBaseline = 'middle';
        views.elv.ctx.textAlign = 'center';
        views.elv.ctx.fillText('WIN', self.world.capitals[0].pos.x, self.max_y * 0.1);
      }

    }

    views.map.ctx.restore();
    views.elv.ctx.restore();

    timers.paint = Date.now() - timer;
    timers.total = timers.update + timers.paint;

    if(self.gameover && Date.now()/1000 % 1 > 0.5){
      views.elv.ctx.fillStyle = '#f00';
      views.elv.ctx.font = '24pt ubuntu mono, monospace';
      views.elv.ctx.textBaseline = 'middle';
      views.elv.ctx.textAlign = 'center';
      views.elv.ctx.fillText('GAME OVER', views.elv.w/2, views.elv.h/2);

      views.map.ctx.fillStyle = '#f00';
      views.map.ctx.font = '48pt ubuntu mono, monospace';
      views.map.ctx.textBaseline = 'middle';
      views.map.ctx.textAlign = 'center';
      views.map.ctx.fillText('GAME OVER', views.map.w/2, views.map.h/2);
    }

    if(self.show_meta){
      text_x = 148;
      views.map.ctx.font = '16pt ubuntu mono, monospace';
      views.map.ctx.textBaseline = 'middle';
      views.map.ctx.textAlign = 'right';

      views.map.ctx.fillStyle = '#999';
      if(timers.update > 12){
        views.map.ctx.fillStyle = '#f00';
      }
      views.map.ctx.fillText(timers.update + 'ms update  ', text_x, 32);

      views.map.ctx.fillStyle = '#999';
      if(timers.paint > 12){
        views.map.ctx.fillStyle = '#f00';
      }
      views.map.ctx.fillText(timers.paint + 'ms paint   ', text_x, 56);
      views.map.ctx.fillStyle = '#999';
      if(timers.total > 12){
        views.map.ctx.fillStyle = '#f00';
      }
      views.map.ctx.fillText((timers.total) + 'ms total   ', text_x, 80);

      text_x = views.map.w - 24;

      views.map.ctx.font = '16pt ubuntu mono, monospace';
      views.map.ctx.textBaseline = 'middle';
      views.map.ctx.textAlign = 'right';
      views.map.ctx.fillStyle = '#999';

      views.map.ctx.fillText(self.world.bombers.length + ' bombers ', text_x, 32);
      views.map.ctx.fillText(self.world.fighters.length + ' fighters', text_x, 56);
      views.map.ctx.fillText(self.world.icbms.length + ' icbms   ', text_x, 80);
      views.map.ctx.fillText(self.world.abms.length + ' abms    ', text_x, 104);
      views.map.ctx.fillText(self.world.booms.length + ' booms   ', text_x, 128);
      var total = self.world.bombers.length + self.world.fighters.length + self.world.icbms.length + self.world.abms.length + self.world.booms.length;
      views.map.ctx.fillText(total + ' total   ', text_x, 156);
    }

  }

  function tick(){
    update();
    paint();
    self.raf = window.requestAnimationFrame(tick);
  }

  function init(){

    self.gameover = false;
    self.raf = null;
    self.at = 0;

    // world size
    self.max_x = self.opts.max_x;
    self.max_y = self.opts.max_y;
    self.max_z = self.opts.max_z;

    self.world = new World({
      opts: self.opts,
      max_x: self.opts.max_x,
      max_y: self.opts.max_y,
      max_z: self.opts.max_z
    });

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

    sets = [
      self.world.maps,
      self.world.supplies,
      self.world.capitals,
      self.world.cities,
      self.world.bases,
      self.world.factories,
      self.world.bombers,
      self.world.fighters,
      self.world.icbms,
      self.world.abms,
      self.world.booms,
      self.world.sats
    ];

    scenarios[self.opts.scenario]();

  }

  function loadScenarios(){


    scenarios[0] = function(){

      // capital and rings

      var capitals = [];

      if(self.opts.capital_count === 4){

        capitals.push({
          x: self.world.max_x * 0.2,
          y: self.world.max_y * 0.6,
          z: 0,
          color: '#fc0'
        });

        capitals.push({
          x: self.world.max_x * 0.8,
          y: self.world.max_y * 0.4,
          z: 0,
          color: '#0ff',
        });

        capitals.push({
          x: self.world.max_x * 0.4,
          y: self.world.max_y * 0.2,
          z: 0,
          color: '#f00'
        });

        capitals.push({
          x: self.world.max_x * 0.6,
          y: self.world.max_y * 0.9,
          z: 0,
          color: '#090',
        });

      } else if(self.opts.capital_count === 3){

        capitals.push({
          x: self.world.max_x * 0.35,
          y: self.world.max_y * 0.8,
          z: 0,
          color: '#fc0'
        });

        capitals.push({
          x: self.world.max_x * 0.65,
          y: self.world.max_y * 0.8,
          z: 0,
          color: '#0ff',
        });

        capitals.push({
          x: self.world.max_x * 0.5,
          y: self.world.max_y * 0.2,
          z: 0,
          color: '#f00'
        });

      } else if(self.opts.capital_count === 1){

        capitals.push({
          x: self.world.max_x * 0.5,
          y: self.world.max_y * 0.5,
          z: 0,
          color: '#0ff',
        });

      } else {
        capitals = [{
          x: self.world.max_x * 0.25,
          y: self.world.max_y * 0.5,
          z: 0,
          color: '#fc0'
        }, {
          x: self.world.max_x * 0.75,
          y: self.world.max_y * 0.5,
          z: 0,
          color: '#0ff',
        }];
      }

      if(self.opts.first_strike){
        // select one capital to attack first
        capitals.forEach(function(attrs, xx){
          attrs.strike = false;
        });
        capitals[Math.floor(Math.random() * capitals.length)].strike = true;
      } else {
        // all capitals attack
        capitals.forEach(function(attrs){
          attrs.strike = true;
        });
      }

      capitals.forEach(function(attrs){

        self.world.capitals.push(new Capital({
          x: attrs.x,
          y: attrs.y,
          z: attrs.z,
          color: attrs.color,

          world: self.world,
          strike: attrs.strike,
          defcon: self.opts.defcon,
          unit_rate: self.opts.unit_rate,

          bases_max: self.opts.bases_max,
          cities_max: self.opts.cities_max,
          factories_max: self.opts.factories_max,
          sats_max: self.opts.sats_max,

          bomber_launch_max: self.opts.bomber_launch_max,
          fighter_launch_max: self.opts.fighter_launch_max,

          icbm_launch_max: self.opts.icbm_launch_max,
          abm_launch_max: self.opts.abm_launch_max,

          stock: {
            bombers: self.opts.stock_bombers,
            fighters: self.opts.stock_fighters,
            icbms: self.opts.stock_icbms,
            abms: self.opts.stock_abms
          }

        }));

      });


    }


    scenarios[1] = function(){

      // au vs nz

      var capitals = [];

      // au
      capitals.push({
        x: self.world.max_x * 0.3,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#fc0',
        world: self.world,
        strike: false,
        defcon: self.opts.defcon,
        unit_rate: self.opts.unit_rate,

        bases_max: self.opts.bases_max,
        cities_max: self.opts.cities_max,
        factories_max: self.factories_max,
        sats_max: self.opts.sats_max,

        bomber_launch_max: self.opts.bomber_launch_max,
        fighter_launch_max: self.opts.fighter_launch_max,

        icbm_launch_max: self.opts.icbm_launch_max,
        abm_launch_max: self.opts.abm_launch_max,

        stock: {
          bombers: self.opts.stock_bombers,
          fighters: self.opts.stock_fighters,
          icbms: self.opts.stock_icbms,
          abms: self.opts.stock_abms
        },
        title: 'AU',
        outline: [
          [-200, -250, true],
          [-150, -250],
          [-150, -200],
          [-60, -180],
          [-50, -250],
          [70, -60],
          [20, 100],
          [-70, 100],
          [-90, 70],
          [-150, 50],
          [-250, 70],
          [-300, 70],
          [-320, 0],
          [-330, -50],
          [-200, -250],
          [-200, -250],
          // tas
          [-50, 130, true],
          [10, 130],
          [-20, 180],
          [-50, 130],

        ],

        assets: {
          bases: [[30, -120], [30, 50],[-20, 150],[-300, 50]],
          cities: [[50, -20], [-40, 100],[20, -70]],
          factories: [[-50, -20]]
        }


      });

      // nz
      capitals.push({
        x: self.world.max_x * 0.7,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#0cc',

        world: self.world,
        strike: false,
        defcon: self.opts.defcon,
        unit_rate: self.opts.unit_rate,

        bases_max: self.opts.bases_max,
        cities_max: self.opts.cities_max,
        factories_max: self.factories_max,
        sats_max: self.opts.sats_max,

        bomber_launch_max: self.opts.bomber_launch_max,
        fighter_launch_max: self.opts.fighter_launch_max,

        icbm_launch_max: self.opts.icbm_launch_max,
        abm_launch_max: self.opts.abm_launch_max,

        stock: {
          bombers: self.opts.stock_bombers,
          fighters: self.opts.stock_fighters,
          icbms: self.opts.stock_icbms,
          abms: self.opts.stock_abms
        },

        title: 'NZ',
        outline: [
          // ni
          [-30, 20, true],
          [0, -60],
          [-60, -90],
          [0, -120],
          [-20, -200],
          [10, -230],
          [40, -120],
          [90, -120],
          [90, -100],
          [50, -60],
          [70, -60],
          [0, 40],
          [-30, 20],
          // si
          [-60, 60, true],
          [0, 70],
          [20, 90],
          [-40, 180],
          [-40, 240],
          [-120, 240],
          [-100, 190],
          [-60, 60],

          // stewart island
          [-100, 260, true],
          [-60, 260],
          [-80, 290],
          [-100, 260],

        ],

        assets: {
          bases: [[10, -150], [-40, -80], [-40, 70], [-90, 220]],
          cities: [[30, -120], [-10, 140], [10, 100], [50, -40]],
          factories: [[-50, 170], [20, -70], ]
        }

      });

      if(self.first_strike){
        // select one capital to attack first
        capitals.forEach(function(attrs, xx){
          attrs.strike = false;
        });
        capitals[Math.floor(Math.random() * capitals.length)].strike = true;
      } else {
        // all capitals attack
        capitals.forEach(function(attrs){
          attrs.strike = true;
        });
      }

      capitals.forEach(function(attrs){
        self.world.capitals.push(new Capital(attrs));
        self.world.maps.push(new Map({
          x: attrs.x,
          y: attrs.y,
          z: attrs.z,
          color: attrs.color,
          world: self.world,
          title: attrs.title,
          outline: attrs.outline,
        }));
      });

    }

    scenarios[2] = function(){

        // ca vs tx

        var capitals = [];

        // ca
        capitals.push({
          x: self.world.max_x * 0.3,
          y: self.world.max_y * 0.5,
          z: 0,
          color: '#fc0',
          world: self.world,
          strike: false,
          defcon: self.opts.defcon,
          unit_rate: self.opts.unit_rate,

          bases_max: self.opts.bases_max,
          cities_max: self.opts.cities_max,
          factories_max: self.factories_max,
          sats_max: self.opts.sats_max,

          bomber_launch_max: self.opts.bomber_launch_max,
          fighter_launch_max: self.opts.fighter_launch_max,

          icbm_launch_max: self.opts.icbm_launch_max,
          abm_launch_max: self.opts.abm_launch_max,

          stock: {
            bombers: self.opts.stock_bombers,
            fighters: self.opts.stock_fighters,
            icbms: self.opts.stock_icbms,
            abms: self.opts.stock_abms
          },

          title: 'CA',
          outline: [
            [20, -180, true],
            [20, -80],
            [150, 160],
            [150, 170],
            [140, 190],
            [140, 200],
            [140, 200],
            [80, 210],
            [70, 180],
            [0, 130],
            [0, 120],
            [-100, -100],
            [-80, -170],
            [-80, -200],
            [20, -180]
          ],

          assets: {
            bases: [[-30, -150], [30, 50],[90, 200],[20, -80]],
            cities: [[45, 160], [-70, -60],[-30, 40], [-10, 90]],
            factories: [[-50, -20],[60, 100]]
          }


        });

        // tx
        capitals.push({
          x: self.world.max_x * 0.7,
          y: self.world.max_y * 0.5,
          z: 0,
          color: '#0cc',

          world: self.world,
          strike: false,
          defcon: self.opts.defcon,
          unit_rate: self.opts.unit_rate,

          bases_max: self.opts.bases_max,
          cities_max: self.opts.cities_max,
          factories_max: self.factories_max,
          sats_max: self.opts.sats_max,

          bomber_launch_max: self.opts.bomber_launch_max,
          fighter_launch_max: self.opts.fighter_launch_max,

          icbm_launch_max: self.opts.icbm_launch_max,
          abm_launch_max: self.opts.abm_launch_max,

          stock: {
            bombers: self.opts.stock_bombers,
            fighters: self.opts.stock_fighters,
            icbms: self.opts.stock_icbms,
            abms: self.opts.stock_abms
          },

          title: 'TX',
          outline: [
            [0, -190, true],
            [0, -80],
            [100, -70],
            [150, -80],
            [180, -70],
            [180, 0],
            [200, 35],
            [190, 80],
            [80, 140],
            [80, 200],
            [20, 180],
            [-40, 100],
            [-70, 100],
            [-90, 120],
            [-100, 120],
            [-120, 120],
            [-150, 60],
            [-200, 0],
            [-100, 0],
            [-100, -190],
            [0, -190]


          ],

          assets: {
            bases: [[100, 40], [-50, -160], [-190, 0], [100, 140]],
            cities: [[-50, -100], [-50, 40], [-80, 70], [50, -40]],
            factories: [[100, -40], [150, 100]]
          }

        });

      if(self.first_strike){
        // select one capital to attack first
        capitals.forEach(function(attrs, xx){
          attrs.strike = false;
        });
        capitals[Math.floor(Math.random() * capitals.length)].strike = true;
      } else {
        // all capitals attack
        capitals.forEach(function(attrs){
          attrs.strike = true;
        });
      }

      capitals.forEach(function(attrs){
        self.world.capitals.push(new Capital(attrs));
        self.world.maps.push(new Map({
          x: attrs.x,
          y: attrs.y,
          z: attrs.z,
          color: attrs.color,
          world: self.world,
          title: attrs.title,
          outline: attrs.outline,
        }));
      });

    };
  }


  function render(){
    resetZoom();
    var html;
    var c = self.show_opts ? 'has-controls' : '';
    html = '';
    html += '<div id="map" class="' + c + '"><canvas id="cMap"></canvas></div>';
    html += '<div id="elevation" class="' + c + '"><canvas id="cElevation"></canvas></div>';
    if(self.show_opts){
      html += '<div id="controls">';
      html += '<div id="params">';
      html += '<div class="expose expose-params expose-active">&equiv;</div>';
      html += '<div class="title">Cold War</div>';
      html += '<p><a href="https://twitter.com/simon_swain" target="new">@simon_swain</a></p>';
      html += '<p><a href="https://github.com/simonswain/coldwar" target="new">#coldwar</a></p>';
      html += '<p>Type <strong>?</strong> for Help</p>';
      html += '</div>';
      html += '<div id="options"></div>';
      html += '</div>';
    } else {
      html += '<div class="title">Cold War</div>';
      html += '<div class="expose expose-params">&equiv;</div>';
    }

    html += '<div class="expose expose-help">?</div>';

    self.el.innerHTML = html;

    document.querySelector('.expose-params').addEventListener ('click', function(e){
      toggleOpts();
    }, false);

    document.querySelector('.expose-help').addEventListener ('click', function(e){
      toggleHelp();
    }, false);

    self.w = self.el.offsetWidth;
    self.h = self.el.offsetHeight;

    views.help = {};
    views.help.el = document.getElementById('help');

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

    views.map.offset_x = (views.map.w/2) - ((self.world.max_x * views.map.scale)/2);
    views.map.offset_y = (views.map.h/2) - ((self.world.max_y * views.map.scale)/2);

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

    views.elv.offset_x = (views.elv.w/2) - ((self.world.max_x * views.elv.scale)/2);
    views.elv.offset_y = (views.elv.h/2) - (((views.elv.h / self.world.max_z) * views.elv.scale)/2);
    views.elv.yscale = views.elv.h / self.world.max_z / views.elv.scale;

    views.map.wrap.onmousemove = handleMouseMove;
    views.map.wrap.onmousedown = handleMouseDown;
    views.map.wrap.onmouseup = handleMouseUp;

    views.map.wrap.addEventListener("mousewheel", handleMouseWheel);
    views.map.wrap.addEventListener("DOMMouseScroll", handleMouseWheel);

    if(self.show_opts){
      paintOpts();
    }

  }

  function doZoom(delta, x, y){

    if(!x || !y){
      x = self.world.max_x / 2;
      y = self.world.max_y / 2;
    }

    var rx = (x / self.world.max_x);
    var ry = (y / self.world.max_y);

    var zoom;
    var dx, dy, dz;

    if(delta > 0){
      zoom = self.zoom * 1.2;
    }

    if(delta < 0){
      zoom = self.zoom * 0.83333;
    }

    if(zoom > 16){
      zoom = 16;
    }

    if(zoom < 0.25){
      zoom = 0.25;
    }

    dx = ((self.world.max_x * zoom) - (self.world.max_x)) * (rx);
    dy = ((self.world.max_y * zoom) - (self.world.max_y)) * (ry);

    self.page_x = - dx;
    self.page_y = - dy;
    self.zoom = zoom;

  }

  function resetZoom(){
    self.zoom = 1;
    self.page_x = 0;
    self.page_y = 0;
  }


  function paintOpts(){

    var elParams = document.getElementById('params');
    var elOptions = document.getElementById('options');

    self.params.forEach(function(param){
      var el = document.createElement('div');
      var html;
      html = '';
      html += '<label title="' + param.info + '">' + param.key + '</label>';
      html += '<input type="range" value="' + self.opts[param.key] + '" min="' + param.min + '" max="' + param.max + '" step="' + param.step + '" />';
      html += '<span class="value">' + self.opts[param.key] + '</span>';
      el.innerHTML = html;
      elOptions.appendChild(el);
      el.getElementsByTagName('input')[0].addEventListener ('change', function(e){
        var val = Number(e.target.value);
        if(val > param.max){
          val = param.max;
          e.target.value = val;
          return;
        }
        if(val < param.min){
          val = param.min;
          e.target.value = val;
          return;
        }
        setOpt(param.key, val);
      }, false);
    });
  }

  this.mouseDown = false
  this.drag_from_x = null;
  this.drag_from_y = null;

  function handleMouseMove (e){
    if(self.mouseDown){
      self.page_x += ((e.layerX - self.drag_from_x));
      self.page_y += ((e.layerY - self.drag_from_y));
    }
    self.drag_from_x = e.layerX;
    self.drag_from_y = e.layerY;
  }

  function handleMouseUp (e){
    if(self.mouseDown){
      self.mouseDown = false;
      this.drag_from_x = null;
      this.drag_from_y = null;
    }
  }

  function handleMouseDown (e){
    if(!self.mouseDown){
      this.drag_from_x = null;
      this.drag_from_y = null;
      self.mouseDown = true;
    }
  }

  function handleMouseWheel (e){
    var delta = e.wheelDelta ? e.wheelDelta : -e.detail;
    delta = delta > 0 ? 1 : -1;
    var x = e.layerX;
    var y = e.layerY;
    doZoom(delta, x, y);
  }

  function setOpt(key, val){
    self.opts[key] = val;
    var opts = [];
    self.params.forEach(function(param){
      opts.push(param.key + '=' + self.opts[param.key]);
    });
    history.pushState(null, null, '?' + opts.join('&'));
    restart();
  }

  function start(){
    render();
    init();
    self.at = Date.now();
    self.raf = window.requestAnimationFrame(tick);
  }

  function stop(){
    if(self.raf){
      window.cancelAnimationFrame(self.raf);
    }
  }

  function toggleOpts(){
    self.show_opts = !self.show_opts;
    render();
  }

  function toggleMeta(){
    self.show_meta = !self.show_meta;
  }

  function toggleHelp(){
    self.show_help = !self.show_help;
    self.show_help_changed = true;
  }

  function hideHelp(){
    self.show_help = false;
    self.show_help_changed = true;
  }

  function toggleVectors(){
    self.world.show_vectors = !self.world.show_vectors;
  }

  function restart(){
    stop();
    setTimeout(start, 100);
  }

  return {
    start: start,
    stop: stop,
    restart: restart,
    toggleOpts: toggleOpts,
    toggleMeta: toggleMeta,
    toggleHelp: toggleHelp,
    hideHelp: hideHelp,
    resetZoom: resetZoom,
    toggleVectors: toggleVectors
  };

};
