/*global Scenes:true, Boom:true, Capital:true, World:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.coldwar = function(el, opts){
  var self = this;

  this.el = el;
  this.show_meta = false;
  this.show_help = false;
  this.show_help_changed = false;

  // world size
  this.max_x = 1600;
  this.max_y = 500;
  this.max_z = 200;

  this.world = new World({
    max_x: self.max_x,
    max_y: self.max_y,
    max_z: self.max_z
  });

  this.params = [{
    key: 'capital_count',
    info: 'Capitals',
    min: 1,
    max: 4
  }, {
    key: 'defcon',
    info: 'Defcon',
    min: 1,
    max: 5
  }, {
    key: 'bases_max',
    info: 'Number of Bases each Nation State starts with',
    min: 0,
    max: 5
  }, {
    key: 'cities_max',
    info: 'Number of Cities each Nation State starts with',
    min: 0,
    max: 5
  }, {
    key: 'factories_max',
    info: 'Number of Factories each Nation State starts with',
    min: 0,
    max: 5
  }, {
    key: 'units',
    info: 'Starting Units for Factory',
    min: 0,
    max: 1000
  }, {
    key: 'unit_rate',
    info: 'Unit Production Rate for Factories',
    min: 0,
    max: 5
  }, {
    key: 'stock_bombers',
    info: 'Number of Bombers each Base starts with',
    min: 0,
    max: 1000
  }, {
    key: 'stock_fighters',
    info: 'Number of Fighters each Base starts with',
    min: 0,
    max: 1000
  }, {
    key: 'stock_icbms',
    info: 'Number ICBMs each Base starts with. ICBMs launch intermittently below Defcon3. At Defcon 1, they all launch.',
    min: 0,
    max: 1000
  }, {
    key: 'stock_abms',
    info: 'Number ABMs each Base starts with. ABMs launch when ICBMs get close.',
    min: 0,
    max: 1000
  }, {
    key: 'fighter_launch_max',
    info: 'Number of Fighters each Base can have in air at any time.',
    min: 0,
    max: 100
  }, {
    key: 'bomber_launch_max',
    info: 'Number of Bombers each Base can have in air at any time.',
    min: 0,
    max: 100
  }, {
    key: 'icbm_launch_max',
    info: 'Number of ICBMs each Base can have in air at any time.',
    min: 0,
    max: 100
  }, {
    key: 'abm_launch_max',
    info: 'Number of ABMs each Base can have in air at any time',
    min: 0,
    max: 100
  }, {
    key: 'sats_max',
    info: 'Number of Satellites each Capital can have. Sats launch at Defcon 3.',
    min: 0,
    max: 10
  }, {
    key: 'first_strike',
    info: 'First Strike',
    min: 0,
    max: 1
  }];

  // defaults

  this.first_strike = false;

  this.capital_count = 2;
  this.defcon = 5;

  this.unit_rate = 1;
  this.units = 0;

  this.bases_max = 3;
  this.cities_max = 3;
  this.factories_max = 3;
  this.bomber_launch_max = 10;
  this.fighter_launch_max = 10;

  this.icbm_launch_max = 5;
  this.abm_launch_max = 10;

  this.sats_max = 1;

  this.stock_bombers = 0;
  this.stock_fighters = 0;
  this.stock_icbms = 0;
  this.stock_abms = 0;

  if(opts){
    this.params.forEach(function(param){
      if(opts.hasOwnProperty(param.key)){
        if(opts[param.key] === 'true'){
          self[param.key] = 1;
        } else if(opts[param.key] === 'false'){
          self[param.key] = 0;
        } else {
          self[param.key] = parseInt(opts[param.key], 10);
        }
      }
    });
  }


  this.gameover = false;

  this.raf = null;
  this.stopped = false;
  this.at = 0;

  var views = {
    map: null,
    elevation: null
  };

  var timers = {
    update: null,
    paint: null
  };

  var sets = [];

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

    if(self.capital_count > 1 && self.capitals.length <= 1 && ! self.gameover){
      self.gameover = true;
      setTimeout(init, 5000, self);
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

    views.map.ctx.save();
    views.map.ctx.clearRect(0, 0, views.map.w, views.map.h);

    if(self.world.flash){
      views.map.ctx.fillStyle='#ffffff';
      views.map.ctx.fillRect(0, 0, views.map.w, views.map.h);
    }

    views.map.ctx.translate(views.map.offset_x, views.map.offset_y);
    views.map.ctx.scale(views.map.scale, views.map.scale);

    views.elv.ctx.save();
    views.elv.ctx.clearRect(0, 0, views.elv.w, views.elv.h);

    if(self.world.flash){
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

    views.map.ctx.restore();
    views.elv.ctx.restore();

    timers.paint = Date.now() - timer;
    timers.total = timers.update + timers.paint;

    if(self.gameover && Date.now()/1000 % 1 > 0.5){
      views.elv.ctx.fillStyle = '#f00';
      views.elv.ctx.font = '24pt monospace';
      views.elv.ctx.textBaseline = 'middle';
      views.elv.ctx.textAlign = 'center';
      views.elv.ctx.fillText('GAME OVER', views.elv.w/2, views.elv.h/2);

      views.map.ctx.fillStyle = '#f00';
      views.map.ctx.font = '32pt monospace';
      views.map.ctx.textBaseline = 'middle';
      views.map.ctx.textAlign = 'center';
      views.map.ctx.fillText('GAME OVER', views.map.w/2, views.map.h/2);
    }

    if(self.show_meta){

      text_x = self.w - 240;

      views.map.ctx.font = '16pt ubuntu mono';
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

      views.map.ctx.font = '16pt ubuntu mono';
      views.map.ctx.textBaseline = 'middle';
      views.map.ctx.textAlign = 'right';
      views.map.ctx.fillStyle = '#999';

      views.map.ctx.fillText(self.bombers.length + ' bombers ', text_x, 120);
      views.map.ctx.fillText(self.fighters.length + ' fighters', text_x, 144);
      views.map.ctx.fillText(self.icbms.length + ' icbms   ', text_x, 168);
      views.map.ctx.fillText(self.abms.length + ' abms    ', text_x, 192);
      views.map.ctx.fillText(self.booms.length + ' booms   ', text_x, 216);
      var total = self.bombers.length + self.fighters.length + self.icbms.length + self.abms.length + self.booms.length;
      views.map.ctx.fillText(total + ' total   ', text_x, 240);
    }

  }

  function tick(){
    update();
    paint();
    if(!self.stopped){
      self.raf = window.requestAnimationFrame(tick);
    }
  }

  function init(){

    self.gameover = false;

    self.world.booms = self.booms = [];

    self.world.capitals = self.capitals = [];
    self.world.cities = self.cities = [];
    self.world.bases = self.bases = [];
    self.world.factories = self.factories = [];
    self.world.supplies = self.supplies = [];

    self.world.bombers = self.bombers = [];
    self.world.fighters = self.fighters = [];
    self.world.icbms = self.icbms = [];
    self.world.abms = self.abms = [];
    self.world.sats = self.sats = [];

    var capitals = [];

    if(self.capital_count === 4){

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

    } else if(self.capital_count === 3){

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

    } else if(self.capital_count === 1){

      capitals.push({
        x: self.world.max_x * 0.5,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#0ff',
      });

    } else {
      capitals = [{
        x: self.world.max_x * 0.2,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#fc0'
      }, {
        x: self.world.max_x * 0.8,
        y: self.world.max_y * 0.5,
        z: 0,
        color: '#0ff',
      }];
    }


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

      self.capitals.push(new Capital({
        x: attrs.x,
        y: attrs.y,
        z: attrs.z,
        color: attrs.color,

        world: self.world,
        strike: attrs.strike,
        defcon: self.defcon,
        unit_rate: self.unit_rate,

        bases_max: self.bases_max,
        cities_max: self.cities_max,
        factories_max: self.factories_max,
        sats_max: self.sats_max,

        bomber_launch_max: self.bomber_launch_max,
        fighter_launch_max: self.fighter_launch_max,

        icbm_launch_max: self.icbm_launch_max,
        abm_launch_max: self.abm_launch_max,

        stock: {
          bombers: self.stock_bombers,
          fighters: self.stock_fighters,
          icbms: self.stock_icbms,
          abms: self.stock_abms
        }

      }));

    });

    sets = [
      self.supplies,
      self.capitals,
      self.cities,
      self.bases,
      self.factories,
      self.bombers,
      self.fighters,
      self.icbms,
      self.abms,
      self.booms,
      self.sats
    ];

  }

  function boot(){
    init();
    self.stopped = false;
    self.at = Date.now();
    self.raf = window.requestAnimationFrame(tick);
  }

  function setOpt(key, val){
    self[key] = val;
    var opts = [];
    self.params.forEach(function(param){
      opts.push(param.key + '=' + self[param.key]);
    });
    history.pushState(null, null, '?' + opts.join('&'));
    restart();
  }

  function start(){

    var html;
    html = '';
    html += '<div id="map" class="has-controls"><canvas id="cMap"></canvas></div>';
    html += '<div id="elevation" class="has-controls"><canvas id="cElevation"></canvas></div>';
    html += '<div id="params"><h3>Cold War</h3><p><a href="https://twitter.com/simon_swain" target="new">@simon_swain</a></p></div>';
    html += '<div id="options"></div>';
    self.el.innerHTML = html;

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

    views.elv.scale = views.elv.scale_x; //Math.min(views.elv.scale_x, views.elv.scale_z);

    views.elv.offset_x = (views.elv.w/2) - ((self.world.max_x * views.elv.scale)/2);
    views.elv.offset_y = (views.elv.h/2) - (((views.elv.h / self.world.max_z) * views.elv.scale)/2);
    views.elv.yscale = views.elv.h / self.world.max_z / views.elv.scale;

    var elParams = document.getElementById('params');
    var elOptions = document.getElementById('options');

    var el;

    el = document.createElement('div');
    el.innerHTML = '<p>Type <strong>?</strong> for Help</p>';
    elParams.appendChild(el);

    el = document.createElement('div');
    el.innerHTML = '<button>Restart</label>';
    el.classList.add('restart');
    elParams.appendChild(el);
    el.getElementsByTagName('button')[0].onclick=restart;

    self.params.forEach(function(param){
      // if(param.key === 'first_strike'){
      //   return;
      // }
      var el = document.createElement('div');
      var html;
      html = '';
      html += '<label title="' + param.info + '">' + param.key + '</label>';
      html += '<input type="range" value="' + self[param.key] + '" min="' + param.min + '" max="' + param.max + '" />';
      html += '<span class="value">' + self[param.key] + '</span>';
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

    // el = document.createElement('div');
    // html = '';
    // html += '<label id="first_strike" title="First Strike">first_strike</label>';
    // html += '<input type="checkbox" value="1" for="first_strike" />';
    // el.innerHTML = html;
    // elOptions.appendChild(el);
    // if(self.first_strike){
    //   el.getElementsByTagName('input')[0].checked=true;
    // }
    // el.getElementsByTagName('input')[0].addEventListener ('change', function(e){
    //   setOpt('first_strike', e.target.checked);
    // });

    boot();
  }

  function stop(){
    self.stopped = true;
  }

  function toggleMeta(){
    self.show_meta = !self.show_meta;
  }

  function toggleHelp(){
    self.show_help = !self.show_help;
    self.show_help_changed = true;
  }

  function toggleVectors(){
    self.world.show_vectors = !self.world.show_vectors;
  }

  function restart(){
    if(self.stopped){
      return;
    }
    stop();
    setTimeout(start, 100);
  }

  //window.onresize = restart;

  return {
    start: start,
    stop: stop,
    toggleMeta: toggleMeta,
    toggleHelp: toggleHelp,
    toggleVectors: toggleVectors
  };

};
