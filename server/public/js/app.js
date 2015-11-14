/*global App:true, Vec3:true */
/*jshint browser:true */
/*jshint strict:false */

var Scenes = {};
var Actors = {};

function Coldwar(){
  this.boot();
}

document.addEventListener("DOMContentLoaded", function(event) {
  window.COLDWAR = new Coldwar();
});

Coldwar.prototype.boot = function(){
  // first load
  var opts = {};
  var path = window.location.pathname.split('/');
  var scene = path.pop();
  var pairs;
  if(window.location.search.substr(0,1) === '?'){
    pairs = window.location.search.substr(1).split('&');
    /*jshint loopfunc:true */
    pairs.forEach(function(pair, ix){
      pair = pair.split('=');
      var keys = pair[0].split('-');
      if(!opts.hasOwnProperty(keys[0])){
        opts[keys[0]] = {};
      }
      opts[keys[0]][keys[1]] = Number(pair[1]);
    });
    /*jshint loopfunc:false */
  }
  if(!Scenes.hasOwnProperty(scene)){
    scene = 'index';
  }
  this.opts = {}; // easy access
  this.optsKeys = []; // keep order
  this.optsVals = {};
  this.setOpts('scene', Scenes[scene].prototype.defaults, opts.scene);
  var cast = Scenes[scene].prototype.getCast();
  for(var i in cast){
    this.setOpts(i, Actors[i].prototype.defaults, opts[i]);
  }
  this.env = this.genEnv();
  this.Scene = Scenes[scene];

  if(scene === 'index'){
    this.env.show_opts = false;
  }

  // if scene has changed, rerender

  this.layout();
  window.addEventListener('resize', this.render.bind(this), true);
  this.bindKeys();
  this.start();
};

Coldwar.prototype.start = function(scene, opts){

  this.env.gameover = false;
  this.env.at = 0;
  this.env.timer = 0;

  this.scene = new this.Scene(
    this.env,
    this.optsVals.scene
  );

  // start animated scene
  this.render();

  if(this.raf){
    window.cancelAnimationFrame(this.raf);
  }

  this.raf = window.requestAnimationFrame(this.tick.bind(this));

};

Coldwar.prototype.setOpts = function(key, params, opts){
  if(!opts){
    opts = {};
  }
  var prev = null;
  if(this.optsKeys.length>0){
    prev = this.optsKeys[this.optsKeys.length-1];
  }
  this.optsKeys.push(key);
  this.opts[key] = {
    key: key,
    title: key,
    params: params
  };
  this.optsVals[key] = {};

  params.forEach(function(param){
    if (opts.hasOwnProperty(param.key)){
      param.value = opts[param.key];
    }
    if(param.inherit){
      param.value = this.optsVals[prev][param.key];
    } else {
      this.optsVals[key][param.key] = param.value;
    }
  }, this);
};

Coldwar.prototype.tick = function(){
  this.update();
  var timer = Date.now();
  this.paintScene();
  this.paintCaptions();
  this.env.timers.paint = Date.now() - timer;
  this.env.timers.total = this.env.timers.update + this.env.timers.paint;
  this.paintMeta();
  this.raf = window.requestAnimationFrame(this.tick.bind(this));
};

Coldwar.prototype.stop = function(){
  if(this.raf){
    window.cancelAnimationFrame(this.raf);
  }
};

Coldwar.prototype.update = function(){

  var at = Date.now();
  var delta = this.env.delta = (at - this.env.last)/16.77;
  var fps = (1000 / (at - this.env.last)).toFixed(0);

  this.env.fps_hist.push(fps);
  while(this.env.fps_hist.length > 60){
    this.env.fps_hist.shift();
  }
  var acc = 0;
  for(var i = 0, ii=this.env.fps_hist.length; i<ii; i++){
    acc += Number(this.env.fps_hist[i]);
  }

  this.env.fps = acc / this.env.fps_hist.length;

  this.env.delta = delta;
  this.env.at += (at - this.env.last);
  this.env.last = at;

  // 0 - 60
  // blink once a second
  this.env.blink = false;
  this.env.timer += delta;
  if (this.env.timer > 60) {
    this.env.blink = true;
    this.env.timer = 0;
  }

  // 0 - 1
  this.env.clock += delta;
  this.env.clock = this.env.clock % 1;

  this.env.flash = false;

  var timer = Date.now();
  if(this.scene){
    this.scene.update(delta);
  }
  this.env.timers.update = Date.now() - timer;

};

Coldwar.prototype.show_help = function(){
  if(!this.scene.help){
    return;
  }
  var html = '';
  var title = this.scene.title === 'Index' ? 'Cold War' : this.scene.title;
  html += '<h1>' + title + '</h1>';
  for(var i = 0, ii = this.scene.help.length; i<ii; i++){
    html += '<p>' + this.scene.help[i] + '</p>';
  }
  document.querySelectorAll('#help .help-content')[0].innerHTML = html;
  document.getElementById('help').style.display='block';
};

Coldwar.prototype.hide_help = function(){
  document.getElementById('help').style.display='none';
};


Coldwar.prototype.paintScene = function(){

  var ex = this.env.views.ex;
  var fx = this.env.views.fx;
  var gx = this.env.views.gx;
  var sx = this.env.views.sx;

  ex.ctx.clearRect(0, 0, ex.w, ex.h);

  fx.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  fx.ctx.fillRect(0, 0, fx.w, fx.h);

  gx.ctx.clearRect(0, 0, gx.w, gx.h);

  if(this.scene && typeof this.scene.flash === 'function'){
    this.scene.flash(fx, gx, sx);
  } else {
    gx.ctx.clearRect(0, 0, gx.w, gx.h);
    if(this.env.flash && !this.opts.safe_mode){
      gx.ctx.fillStyle='#ffffff';
      gx.ctx.fillRect(0, 0, gx.w, gx.h);
    }
  }

  gx.ctx.save();

  // autocenter
  gx.ctx.translate(gx.offset_x, gx.offset_y);
  // pan
  gx.ctx.translate(this.env.page_x, this.env.page_y);
  // zoom
  gx.ctx.scale(this.env.zoom, this.env.zoom);
  // scale
  gx.ctx.scale(gx.scale, gx.scale);

  fx.ctx.save();
  fx.ctx.translate(fx.offset_x, fx.offset_y);
  fx.ctx.translate(this.env.page_x, this.env.page_y);
  fx.ctx.scale(this.env.zoom, this.env.zoom);
  fx.ctx.scale(fx.scale, fx.scale);

  // fx.ctx.strokeStyle='#ffffff';
  // fx.ctx.lineWidth=2;
  // fx.ctx.beginPath();
  // fx.ctx.rect(0, 0, this.optsVals.scene.max_x, this.optsVals.scene.max_y);
  // fx.ctx.stroke();

  if(sx){
    sx.ctx.clearRect(0, 0, sx.w, sx.h);
    if(this.env.flash && !this.opts.safe_mode){
      sx.ctx.fillStyle='#ffffff';
      sx.ctx.fillRect(0, 0, sx.w, sx.h);
    }
    sx.ctx.save();
    sx.ctx.translate(sx.offset_x, sx.offset_z);
    sx.ctx.scale(sx.scale, sx.scale);
  }

  this.scene.paint(fx, gx, sx, ex);

  fx.ctx.restore();
  gx.ctx.restore();

  if(sx){
    sx.ctx.restore();
  }

};


Coldwar.prototype.paintMeta = function(){

  if(!this.env.show_meta){
    return;
  }

  var view = this.env.views.gx;

  var n, nn, set, i, ii, text_x;

  view.ctx.font = '16pt ubuntu mono, monospace';
  view.ctx.textBaseline = 'top';
  view.ctx.textAlign = 'right';

  view.ctx.fillStyle = '#999';
  view.ctx.fillText((this.env.at/1000).toFixed(0) + ' s', view.w - 32,view.h - 56);
  view.ctx.fillText((this.env.delta).toFixed(1) + ' d', view.w - 32,view.h - 80);
  view.ctx.fillText((this.env.timer).toFixed(1) + ' t', view.w - 32,view.h - 104);
  view.ctx.fillText((this.env.clock).toFixed(1) + ' c', view.w - 32,view.h - 128);

  text_x = 160;

  view.ctx.fillStyle = '#999';
  if(this.env.timers.update > 12){
    view.ctx.fillStyle = '#f00';
  }
  view.ctx.fillText(this.env.timers.update + ' update  ', text_x, 56);

  view.ctx.fillStyle = '#999';
  if(this.env.timers.paint > 12){
    view.ctx.fillStyle = '#f00';
  }
  view.ctx.fillText(this.env.timers.paint + ' paint   ', text_x, 80);
  view.ctx.fillStyle = '#999';
  if(this.env.timers.total > 12){
    view.ctx.fillStyle = '#f00';
  }

  view.ctx.fillText((this.env.timers.total) + ' total   ', text_x, 104);

  view.ctx.fillStyle = '#999';

  view.ctx.fillText((this.env.fps.toFixed(0)) + ' fps     ', text_x, 128);

  this.paintMouse();
};

Coldwar.prototype.paintMouse = function(){

  if(!this.env.show_meta){
    return;
  }

  var view = this.env.views.gx;

  var n, nn, set, i, ii, text_x;

  view.ctx.font = '16pt ubuntu mono, monospace';
  view.ctx.textBaseline = 'top';
  view.ctx.textAlign = 'right';

  view.ctx.fillStyle = '#999';
  view.ctx.fillText((this.env.mouse.x).toFixed(0) + ' mx', view.w - 32, 56);
  view.ctx.fillText((this.env.mouse.y).toFixed(0) + ' my', view.w - 32, 80);

  view.ctx.fillText((this.env.page_x).toFixed(0) + ' px', view.w - 32, 104);
  view.ctx.fillText((this.env.page_y).toFixed(0) + ' py', view.w - 32, 128);

  view.ctx.fillText((this.env.zoom).toFixed(2) + ' z ', view.w - 32, 152);

};

Coldwar.prototype.paintCaptions = function(){

  if(!this.env.show_help){
    return;
  }

  if(!this.scene.captions){
    return;
  }
  var gx = this.env.views.gx;

  gx.ctx.font = '24px monospace, ubuntu mono';
  gx.ctx.textBaseline = 'middle';
  gx.ctx.textAlign = 'center';
  gx.ctx.fillStyle = '#fff';
  gx.ctx.fillText(this.scene.captions[this.env.caption_index].text, gx.w * 0.5, gx.h * 0.75);

};

Coldwar.prototype.paintOpts = function(){

  var html;
  html = '';

  var elOptions = document.getElementById('options');
  elOptions.innerHTML = '';
  var optsEl = document.createElement('div');
  optsEl.classList.add('opts');

  if(this.Scene){
    html += '<h3>' + this.Scene.prototype.title + '</h3>';
  }

  this.optsKeys.forEach(function(key){

    var Default = this.opts[key];

    if(Default.params.length === 0){
      return;
    }

    var optsEl = document.createElement('div');
    optsEl.classList.add('opts');

    var html = '';
    if(Default.title === 'scene'){
      html += '<h3>' + this.Scene.prototype.title + '</h3>';
    } else {
      html += '<h3>' + Default.title + '</h3>';
    }
    optsEl.innerHTML = html;
    elOptions.appendChild(optsEl);

    var self = this;
    key = Default.key;

    Default.params.forEach(function(param){

      var onChangeParam = function(e){
        var key = e.target.getAttribute('data-param');
        var paramKey = e.target.getAttribute('data-key');
        var val;
        if(param.type === 'text'){
          val = e.target.value;
          self.setOpt(key, paramKey, val);
          return;
        }
        val = Number(e.target.value);
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
        self.setOpt(key, paramKey, val);
      }.bind(this);

      var el = document.createElement('div');
      el.classList.add('opt');

      var html;
      html = '';
      html += '<label>' + param.key + '</label>';
      switch(param.type){
      case 'text':
        el.classList.add('opt-wide');
        html += '<textarea data-param="' + Default.key + '" data-key="' + param.key + '">' + self.optsVals[key][param.key] + '</textarea>';
        break;
      default:
        html += '<input type="range" data-param="' + Default.key + '" data-key="' + param.key + '" value="' + self.optsVals[key][param.key] + '" min="' + param.min + '" max="' + param.max + '" step="' + param.step + '" />';
        html += '<span class="value">' + self.optsVals[key][param.key] + '</span>';
        break;
      }

      el.innerHTML = html;
      optsEl.appendChild(el);

      el.innerHTML = html;
      optsEl.appendChild(el);
      switch(param.type){
      case 'text':
        el.getElementsByTagName('textarea')[0].addEventListener ('change', onChangeParam.bind(this), false);
        break;
      default:
        el.getElementsByTagName('input')[0].addEventListener ('change', onChangeParam.bind(this), false);
        break;
      }


    }, this);
  }, this);
};

Coldwar.prototype.genEnv = function(){

  if(localStorage.getItem('show_opts') === null){
    localStorage.setItem('show_opts', true);
  }

  if(localStorage.getItem('show_opts') === null){
    localStorage.setItem('show_opts', true);
  }

  // if(!localStorage.getItem('show_meta')){
  //   localstorage.setItem('show_meta', false);
  // }

  // if(!localStorage.getItem('show_meta')){
  //   localstorage.setItem('show_meta', false);
  // }

  return {
    gameover: false,
    restart: this.restart.bind(this),
    el: document.getElementById('app'),
    views: {
      ex: null,
      fx: null,
      gx: null,
      sx: null
    },
    last: Date.now(),
    at: 0,
    fps: 0,
    fps_hist: [],
    clock: 0,
    blink: true,
    zoom: 0,
    page_x: 0,
    page_y: 0,
    mouse: new Vec3(),
    timers: {
      update: null,
      paint: null
    },
    show_opts: (localStorage.getItem('show_opts') === 'true'),
    show_meta: false,
    show_help: false,
    caption_index: 0,
  };

};

Coldwar.prototype.toggleOpts = function(){
  this.env.show_opts = !this.env.show_opts;
  localStorage.setItem('show_opts', this.env.show_opts);
  this.layout();
};

Coldwar.prototype.toggleMeta = function(){
  this.env.show_meta = !this.env.show_meta;
};

Coldwar.prototype.advanceCaptions = function(){
  this.env.caption_index ++;
  if(this.env.caption_index >= this.scene.captions.length){
    this.env.caption_index = this.scene.captions.length-1;
  }
};

Coldwar.prototype.retreatCaptions = function(){
  this.env.caption_index --;
  if(this.env.caption_index <= 0){
    this.env.caption_index = 0;
  }
};

Coldwar.prototype.toggleHelp = function(){
  // toggle off
  if(this.env.show_help){
    this.env.show_help = false;
    this.hide_help();
  } else {
    this.env.show_help = true;
    this.show_help();
  }
};

Coldwar.prototype.hideHelp = function(){
  this.env.show_help = false;
  this.env.show_help_changed = true;
};

Coldwar.prototype.restart = function(){
  this.stop();
  if(this.restartTimeout){
    clearTimeout(this.restartTimeout);
  }
  this.restartTimeout = setTimeout(this.start.bind(this), 100);
};


Coldwar.prototype.layout = function(){

  this.resetZoom();
  var html;
  var c = this.env.show_opts ? 'has-controls' : '';
  html = '';
  switch(this.Scene.prototype.layout){
  case 'scanner':
    html += '<div id="ex" class="' + c + ' has-sx"><canvas id="Ex" oncontextmenu="return false"></canvas></div>';
    html += '<div id="fx" class="' + c + ' has-sx"><canvas id="Fx"></canvas></div>';
    html += '<div id="gx" class="' + c + ' has-sx"><canvas id="Gx"></canvas></div>';
    html += '<div id="sx" class="' + c + '"><canvas id="Sx"></canvas></div>';
    break;
  default:
    html += '<div id="ex" class="' + c + '"><canvas id="Ex" oncontextmenu="return false"></canvas></div>';
    html += '<div id="fx" class="' + c + '"><canvas id="Fx"></canvas></div>';
    html += '<div id="gx" class="' + c + '"><canvas id="Gx"></canvas></div>';
    break;
  }

  if(this.env.show_opts){
    html += '<div id="controls">';
    html += '<div id="params">';
    html += '<div class="expose expose-params expose-active">&equiv;</div>';
    if(this.Scene){
      html += '<div class="title">' + this.Scene.prototype.title + '</div>';
    }
    html += '</div>';
    html += '<div id="options"></div>';
    html += '</div>';
  } else {
    html += '<div class="expose expose-params">&equiv;</div>';
  }

  html += '<div class="expose expose-help">?</div>';

  html += '<div id="help">';
  html += '<div class="help-content">';
  html += '</div>';
  html += '</div>';

  if(this.scene && typeof this.scene.render ==='function'){
    html += '<div id="content" class="' + c + '"></div>';
  } else if(this.Scene && typeof this.Scene.prototype.render === 'function'){
    html += '<div id="content" class="' + c + '"></div>';
  }

  // html += '<div id="index">';
  // html += '</div>';

  this.env.el.innerHTML = html;

  document.querySelector('.expose-params').addEventListener ('click', this.toggleOpts.bind(this), false);

  document.querySelector('.expose-help').addEventListener ('click', this.toggleHelp.bind(this), false);

  if(this.env.show_opts){
    this.paintOpts();
  }

  this.render();

};


Coldwar.prototype.render = function(){

  this.w = this.env.el.offsetWidth;
  this.h = this.env.el.offsetHeight;

  this.env.views.content = {};
  this.env.views.content.el = document.getElementById('content');

  this.env.views.help = {};
  this.env.views.help.el = document.getElementById('help');


  var keys = ['ex','fx','gx'];
  keys.forEach(function(key){
    this.env.views[key] = {};
    var view = this.env.views[key];
    view.wrap = document.getElementById(key, key.substr(0,1));
    view.el = document.getElementById(key.substr(0,1).toUpperCase() + key.substr(1));
    view.ctx = view.el.getContext('2d');

    view.w = view.wrap.offsetWidth;
    view.h = view.wrap.offsetHeight;

    view.el.width = view.w;
    view.el.height = view.h;
    view.scale_x = view.w / this.optsVals.scene.max_x;
    view.scale_y = view.h / this.optsVals.scene.max_y;
    view.scale = Math.min(view.scale_x, view.scale_y);

    view.offset_x = (view.w * 0.5) - (this.optsVals.scene.max_x * view.scale * 0.5);
    view.offset_y = (view.h * 0.5) - (this.optsVals.scene.max_y * view.scale * 0.5);

  }, this);


  var elSx = document.getElementById('sx');

  if(elSx){
    this.env.views.sx = {};
    this.env.views.sx.wrap = document.getElementById('sx');
    this.env.views.sx.el = document.getElementById('Sx');
    this.env.views.sx.ctx = this.env.views.sx.el.getContext('2d');

    this.env.views.sx.w = this.env.views.sx.wrap.offsetWidth;
    this.env.views.sx.h = this.env.views.sx.wrap.offsetHeight;

    this.env.views.sx.el.width = this.env.views.sx.w;
    this.env.views.sx.el.height = this.env.views.sx.h;

    this.env.views.sx.scale_x = this.env.views.sx.w / this.optsVals.scene.max_x;
    this.env.views.sx.scale_z = this.env.views.sx.h / this.optsVals.scene.max_z;
    this.env.views.sx.scale = Math.min(this.env.views.sx.scale_x, this.env.views.sx.scale_z);

    this.env.views.sx.scale = this.env.views.gx.scale; // = Math.min(this.env.views.sx.scale_x, this.env.views.sx.scale_z);

    this.env.views.sx.offset_x = (this.env.views.sx.w * 0.5) - (this.optsVals.scene.max_x * this.env.views.sx.scale * 0.5);
    this.env.views.sx.offset_z = -60;// (this.env.views.sx.h * 0.5) - (this.optsVals.scene.max_z * this.env.views.sx.scale);
  }

  this.env.views.ex.wrap.onmousemove = this.handleMouseMove.bind(this);
  this.env.views.ex.wrap.onmousedown = this.handleMouseDown.bind(this);
  this.env.views.ex.wrap.onmouseup = this.handleMouseUp.bind(this);

  this.env.views.ex.wrap.addEventListener("mousewheel", this.handleMouseWheel.bind(this));
  this.env.views.ex.wrap.addEventListener("DOMMouseScroll", this.handleMouseWheel.bind(this));


  // non-animated scene
  if(this.scene && typeof this.scene.render === 'function'){
    this.scene.render();
  }

};


Coldwar.prototype.resetZoom = function(){
  this.env.zoom = 1;
  this.env.page_x = 0;
  this.env.page_y = 0;
};



Coldwar.prototype.doZoom = function(delta, x, y){

  // x any y are world coordinates

  if(!x || !y){
    x = (this.optsVals.scene.max_x / 2);
    y = (this.optsVals.scene.max_y / 2);
  }

  var oldzoom = this.env.zoom;
  var zoom;
  
  x = x * oldzoom;
  y = y * oldzoom;
  
  if(delta > 0){
    zoom = this.env.zoom * 1.1111;
  }

  if(delta < 0){
    zoom = this.env.zoom * 0.9;
  }

  if(zoom > 16){
    zoom = 16;
  }

  if(zoom < 0.25){
    zoom = 0.25;
  }

  if(zoom < 0.5){
    zoom = 0.5;
  }

  // world coords
  var old_w = this.optsVals.scene.max_x * oldzoom;
  var old_h = this.optsVals.scene.max_y * oldzoom;

  var new_w = this.optsVals.scene.max_x * zoom;
  var new_h = this.optsVals.scene.max_y * zoom;

  var dx = ((old_w - new_w) * this.env.views.gx.scale) * (x / old_w);
  var dy = ((old_h - new_h) * this.env.views.gx.scale) * (y / old_h);

  // movement of top left of canvas in actual pixels
  this.env.page_x += dx;
  this.env.page_y += dy;
  this.env.zoom = zoom;

};

Coldwar.prototype.handleMouseMove = function(e){

  // world coordinate position of mouse
  var x = ((e.offsetX - this.env.page_x - this.env.views.gx.offset_x) / this.env.views.gx.scale) / this.env.zoom;
  var y = ((e.offsetY - this.env.page_y - this.env.views.gx.offset_y) / this.env.views.gx.scale) / this.env.zoom;

  this.env.mouse.x = x;
  this.env.mouse.y = y;

  if(this.scene.nozoom){
    return;
  }

  if(this.env.mouseDown){
    this.env.page_x += ((e.offsetX - this.env.drag_from_x));
    this.env.page_y += ((e.offsetY - this.env.drag_from_y));
  }

  this.env.drag_from_x = e.offsetX;
  this.env.drag_from_y = e.offsetY;
};

Coldwar.prototype.handleMouseUp = function(e){
  if(this.env.mouseDown){
    this.env.mouseDown = false;
    this.env.drag_from_x = null;
    this.env.drag_from_y = null;
  }
};

Coldwar.prototype.handleMouseDown = function(e){

  if(!this.env.mouseDown){
    this.env.drag_from_x = e.offsetX;
    this.env.drag_from_y = e.offsetY;
    this.env.mouseDown = true;
  }

  if(this.scene && typeof this.scene.onClick === 'function'){
    this.scene.onClick(this.env.mouse.x, this.env.mouse.y, e);
  }

};

Coldwar.prototype.handleMouseWheel = function(e){
  var delta = e.wheelDelta ? e.wheelDelta : -e.detail;
  delta = delta > 0 ? 1 : -1;
  this.doZoom(delta, this.env.mouse.x, this.env.mouse.y);
};

Coldwar.prototype.setOpt = function(key, param, val){
  this.optsVals[key][param] = val;
  var self = this;
  if(Actors.hasOwnProperty(key)){
    Actors[key].prototype.defaults.forEach(function(x){
      if(x.key !== param){
        return;
      }
      x.value = val;
    }, this);
  }
  if(key === 'scene' && this.Scene){
    this.Scene.prototype.defaults.forEach(function(x){
      if(x.key !== param){
        return;
      }
      x.value = val;
    });
  }

  this.pushOpts();
  this.paintOpts();
  this.restart();
};

Coldwar.prototype.pushOpts = function(){

  var opts = [];
  for(var key in this.opts){
    /*jshint loopfunc:true */
    this.opts[key].params.forEach(function(param){
      opts.push(key + '-' + param.key + '=' + param.value);
    });
    /*jshint loopfunc:false */
  }
  history.pushState(null, null, '?' + opts.join('&'));


};

Coldwar.prototype.bindKeys = function(){
  var self = this;
  window.addEventListener("keydown", self.onKey.bind(this));
};

Coldwar.prototype.onKey = function(e){
  switch(e.which){
  case 9:
    // 'tab'
    e.preventDefault();
    this.toggleOpts();
    break;

  case 13:
    // 'cr'
    e.preventDefault();
    this.restart();
    break;

  case 27:
    // 'esc'
    e.preventDefault();
    window.location.href='/';
    break;

  case 32:
    // 'space'
    e.preventDefault();
    this.advanceCaptions();
    break;

  case 39:
    e.preventDefault();
    this.advanceCaptions();
    break;

  case 37:
    e.preventDefault();
    this.retreatCaptions();
    break;

  case 48:
    // '0'
    e.preventDefault();
    this.resetZoom();
    break;

  case 96:
    // pad '0'
    e.preventDefault();
    this.resetZoom();
    break;

  case 107:
  case 187:
    // +
    e.preventDefault();
    this.doZoom(1);
    break;

  case 109:
  case 189:
    // -
    e.preventDefault();
    this.doZoom(-1);
    break;

  case 220:
    // '\'
    e.preventDefault();
    this.toggleMeta();
    break;

  case 191:
    // '?'
    e.preventDefault();
    if(e.shiftKey){
      this.toggleHelp();
    }
    break;
  }
};
