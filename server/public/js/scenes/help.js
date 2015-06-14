/*global Scenes:true, Scanlines:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.help = function(el, opts){
  var self = this;
  this.el = el;

  this.raf = null;
  this.stopped = false;

  this.max_x = 1600;
  this.max_y = 700;

  //this.code = opts.code;
  this.code = [
        '10 GAME LOOP',
        '20 REQUEST ANIMATION FRAME',
        '30 CANVAS'
      ];
 
  var views = {
    fx: null,
    gx: null
  };

  function init(){
  }

  function boot(){
    init();
    self.stopped = false;
    self.at = Date.now();
    self.raf = window.requestAnimationFrame(tick);
  }

  function update(){
    var at = Date.now();
    var delta = self.delta = (at - self.at)/16.77;
    self.at = at;
  }

  function paint(){

    views.fx.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    views.fx.ctx.fillRect(0, 0, self.w, self.h);

    if(Math.random() < 0.005){
      views.fx.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    }

    views.fx.ctx.fillRect(0, 0, self.w, self.h);

    views.fx.ctx.save();

    if(Math.random() < 0.0025){
      views.fx.ctx.rotate(2*Math.PI * Math.random());
    }

    views.fx.ctx.translate(views.gx.offset_x, views.gx.offset_y);
    views.fx.ctx.scale(views.gx.scale, views.gx.scale);

    views.gx.ctx.clearRect(0, 0, self.w, self.h);

    views.gx.ctx.save();
    views.gx.ctx.translate(views.gx.offset_x, views.gx.offset_y);
    views.gx.ctx.scale(views.gx.scale, views.gx.scale);

    paintCode();

    views.gx.ctx.restore();
    views.fx.ctx.restore();

  }

  function paintCode(){

    var lines = self.code;

    views.fx.ctx.fillStyle = '#0f0';
    if(Math.random() < 0.05){
      views.fx.ctx.fillStyle = '#090';
    }
    if(Math.random() < 0.01){
      views.fx.ctx.fillStyle = '#060';
    }

    views.fx.ctx.font = '32pt ubuntu mono';

    views.fx.ctx.save();
    if(Math.random() < 0.005){
      views.fx.ctx.translate((Math.random()-0.5)* 32, (Math.random()-0.5) * 32);
    }

    var yy = (self.max_y * 0.05);
    for(var i=0; i<lines.length; i++){
      views.fx.ctx.save();
      if(Math.random() < 0.0025){
        views.fx.ctx.rotate(2*Math.PI * Math.random());
      }
      views.fx.ctx.translate((Math.random()-0.5) * 1, (Math.random()-0.5) * 1);
      views.fx.ctx.fillText(lines[i], self.max_x * 0.1, yy + (56 * i));
      views.fx.ctx.restore();
    }
    views.fx.ctx.restore();
  }


  function tick(){
    update();
    paint();
    if(!self.stopped){
      self.raf = window.requestAnimationFrame(tick);
    }
  }

  function start(){

    var html;
    html = '';
    html += '<div id="fx"><canvas id="cfx"></canvas></div><div id="gx"><canvas id="cgx"></canvas></div>';
    self.el.innerHTML = html;

    self.w = self.el.offsetWidth;
    self.h = self.el.offsetHeight;

    views.fx = {};
    views.fx.wrap = document.getElementById('fx');
    views.fx.el = document.getElementById('cfx');
    views.fx.ctx = views.fx.el.getContext('2d');

    views.fx.w = views.fx.wrap.offsetWidth;
    views.fx.h = views.fx.wrap.offsetHeight;

    views.fx.el.width = views.fx.w;
    views.fx.el.height = views.fx.h;

    views.fx.scale_x = views.fx.w / self.max_x;
    views.fx.scale_y = views.fx.h / self.max_y;
    views.fx.scale = Math.min(views.fx.scale_x, views.fx.scale_y);

    views.fx.offset_x = (views.fx.w/2) - ((self.max_x * views.fx.scale)/2);
    views.fx.offset_y = (views.fx.h/2) - ((self.max_y * views.fx.scale)/2);

    views.gx = {};
    views.gx.wrap = document.getElementById('gx');
    views.gx.el = document.getElementById('cgx');
    views.gx.ctx = views.gx.el.getContext('2d');

    views.gx.w = views.gx.wrap.offsetWidth;
    views.gx.h = views.gx.wrap.offsetHeight;

    views.gx.el.width = views.gx.w;
    views.gx.el.height = views.gx.h;

    views.gx.scale_x = views.gx.w / self.max_x;
    views.gx.scale_y = views.gx.h / self.max_y;
    views.gx.scale = Math.min(views.gx.scale_x, views.gx.scale_y);

    views.gx.offset_x = (views.gx.w/2) - ((self.max_x * views.gx.scale)/2);
    views.gx.offset_y = (views.gx.h/2) - ((self.max_y * views.gx.scale)/2);

    boot();
  }

  function stop(){
    self.stopped = true;
  }

  function restart(){
    if(self.stopped){
      return;
    }
    stop();
    setTimeout(start, 100);
  }

  window.onresize = restart;

  return {
    start: start,
    stop: stop
  };

};
