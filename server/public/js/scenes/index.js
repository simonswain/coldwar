/*global Scenes:true, Actors:true, Scene:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.index = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.env.show_opts = false;
  this.init();
};

Scenes.index.prototype = Object.create(Scene.prototype);

Scenes.index.prototype.title = 'Index';
Scenes.index.prototype.fullscreen = true;

Scenes.index.prototype.genAttrs = function(attrs){
  return {
    color_slow: Math.floor(Math.random() * 360),
    color_fast: Math.floor(Math.random() * 360),
    color_crawl: Math.floor(Math.random() * 360)
  };
};

Scenes.index.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 1024,
  min: 200,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 1024,
  min: 200,
  max: 1000
}, {
  key: 'horizap',
  value: 0.1,
  min: 0,
  max: 1,
  step: 0.1,
}, {
  key: 'ttl_base',
  value: 10,
  min: 0,
  max: 100,
}, {
  key: 'star_radius',
  value: 1,
  min: 1,
  max: 5,
}, {
  key: 'ttl_flux',
  value: 20,
  min: 0,
  max: 100,
}, {
  key: 'yv_base',
  value: 0,
  min: 0,
  max: 5,
  step: 0.1
}, {
  key: 'yv_flux',
  value: 2,
  min: 0,
  max: 5,
  step: 0.1
}, {
  key: 'slide_px',
  value: -1,
  min: -5,
  max: 5,
  step: 0.1
}];

Scenes.index.prototype.getCast = function(){
  return [];
}

Scenes.index.prototype.update = function(delta){

  this.attrs.color_fast += 9;
  if(this.attrs.color_fast >= 360){
    this.attrs.color_fast = 0;
  }

  this.attrs.color_slow += 1;
  if(this.attrs.color_slow >= 360){
    this.attrs.color_slow = 0;
  }

  this.attrs.color_crawl += 0.13;
  if(this.attrs.color_crawl >= 360){
    this.attrs.color_crawl = 0;
  }

  document.getElementsByClassName('color-cycle-fast')[0].style.color='hsla(' + this.attrs.color_fast +', 100%, 50%, 0.9)';
  document.getElementsByClassName('color-cycle-slow')[0].style.color='hsla(' + this.attrs.color_slow +', 100%, 50%, 0.9)';

  var over = document.getElementsByClassName('color-cycle-over');
  if(over.length>0){
    over[0].style.backgroundColor='hsla(' + this.attrs.color_crawl +', 100%, 50%, 0.9)';
    over[0].style.color='hsla(' + ((this.attrs.color_crawl + 180)%360) +', 100%, 50%, 1)';
  }

  for(var i=0, ii=this.indexItems.length; i<ii; i++){
    this.indexItems[i].style.borderColor='hsla(' + this.attrs.color_crawl +', 100%, 50%, 0.5)'
  }
  
  for(var i=0, ii=this.stars.length; i<ii; i++){
    this.stars[i].ttl --;
    this.stars[i].y += this.stars[i].yv;
    if(this.stars[i].ttl <= 0){
      this.stars.splice(i, 1);
      i--;
      ii--;
    }
  }

  while(this.stars.length < 100){
    this.stars.push({
      x: this.opts.max_x * Math.random(),
      y: this.opts.max_y * Math.random(),
      yv: this.opts.yv_base + (Math.random() * this.opts.yv_flux),
      ttl: this.opts.ttl_base + (Math.random() * this.opts.ttl_flux),
      color: this.attrs.color_fast
    });
  }

}

Scenes.index.prototype.paint = function(fx, gx, sx){

  var slideframe = fx.ctx.getImageData(0, 0, this.opts.max_x, this.opts.max_y);
  fx.ctx.putImageData(slideframe, 0, this.opts.slide_px);

  var star;
  for(var i=0, ii=this.stars.length; i<ii; i++){
    star = this.stars[i];
    gx.ctx.beginPath();
    gx.ctx.fillStyle = 'hsla(' + star.color +', 100%, 50%, 1)'; //'#fff';
    gx.ctx.arc(star.x, star.y, this.opts.star_radius, 0, 2 * Math.PI, true);
    gx.ctx.fill();

    fx.ctx.beginPath();
    fx.ctx.fillStyle = 'hsla(' + star.color +', 100%, 85%, 0.9)'; //'#fff';
    fx.ctx.arc(star.x, star.y, this.opts.star_radius, 0, 2 * Math.PI, true);
    fx.ctx.fill();
  }
}

Scenes.index.prototype.flash = function(fx, gx){
  this.flashHorizap(fx, gx);
}

Scenes.index.prototype.flashHorizap = function(fx, gx){
  fx.ctx.strokeStyle = 'hsla(' + this.attrs.color_slow +', 100%, 85%, 0.9)'; //'#fff';
  //fx.ctx.strokeStyle = '#fff';
  fx.ctx.lineWidth = 0.5;
  var yy = Math.random() * fx.h;
  if (Math.random() < 0.1) {
    fx.ctx.beginPath();
    fx.ctx.moveTo(0, yy);
    fx.ctx.lineTo(fx.w, yy);
    fx.ctx.stroke();
  }

}

Scenes.index.prototype.tick = function(){
  this.update();
  this.paint();
};

Scenes.index.prototype.init = function(){

  this.stars = [];
  
  this.scenes = [{
    title: 'Cold War',
    slug: 'coldwar'
  }, {
    title: 'Deep Space',
    slug: 'deepspace'
  }, {
    title: 'Interception',
    slug: 'interception'
  }, {
    title: 'Attract',
    slug: 'attract'
  }, {
    title: 'System',
    slug: 'system'
  }, {
    title: 'CRT',
    slug: 'crt'
  }, {
    title: 'Rabbits',
    slug: 'rabbits'
  }, {
    title: 'Planet',
    slug: 'planet'
  }, {
    title: 'Predators',
    slug: 'predators'
  }, {
    title: 'Life',
    slug: 'life'
  // }, {
  //   title: 'Frequency',
  //   slug: 'frequency'
  }, {
    title: 'Raster',
    slug: 'raster'
  }, {
    title: 'Booms',
    slug: 'booms'
  // }, {
  //   title: 'World',
  //   slug: 'world'
  // }, {
  //   title: 'Rats',
  //   slug: 'rats'
  // }, {
  //   title: 'Meltdown',
  //   slug: 'meltdown'
  // }, {
  //   title: 'Convection',
  //   slug: 'convection'
  // }, {
  //   title: 'Actors',
  //   slug: 'actors'
  }];

}

Scenes.index.prototype.render = function(){
  var html;
  html = '';
  html += '<div class="index">';
  html += '<h1><a href="/" class="color-cycle-fast">coldwar</a></h1>';
  html += '<ul>';
  this.scenes.forEach(function(scene){
    html += '<li><a href="/' + scene.slug + '" class="color-cycle-crawl">' + scene.title + '</a></li>';
  });
  html += '</ul>';
  html += '<p><a href="https://twitter.com/simon_swain" target="new" class="color-cycle-slow">@simon_swain</a></p>';
  html += '</div>';
  html += '</div>';
  this.env.views.content.el.innerHTML = html;

  this.indexItems = document.getElementsByClassName('color-cycle-crawl');

  this.over = false;
  var onOver = function(e){
    e.target.classList.add('color-cycle-over');
  }.bind(this);

  var onOut = function(e){
    e.target.style.color=null;
    e.target.style.backgroundColor=null;
    e.target.classList.remove('color-cycle-over');
  };

  for(var i = 0, ii=this.indexItems.length; i<ii; i++){
    this.indexItems[i].addEventListener('mouseover', onOver.bind(this));
    this.indexItems[i].addEventListener('mouseout', onOut.bind(this));
  }
  
}

Scenes.index.prototype.start = function(){
  this.init();
  this.render();
  this.at = Date.now();
  this.raf = window.requestAnimationFrame(this.tick.bind(this));
}

Scenes.index.prototype.stop = function(){
  if(this.raf){
    window.cancelAnimationFrame(this.raf);
  }
}

Scenes.index.prototype.restart = function(){
  this.stop();
  setTimeout(this.start.bind(this), 100);
};


Scenes.index.prototype.help = [
  'Coldwar is a simulation platform. You can explore it\'s built in scenes, or use it as a starting point for writing your own.',
  'The platform builds on concepts presented at JSConf.US 2015, Web Directions Code (<a href="https://vimeo.com/132786140" target="_new">video</a>), TX.js (<a href="https://www.youtube.com/watch?v=hXW7kkyhtqo" target="_new">video</a>) and JSConf.Asia 2014 (<a href="https://www.youtube.com/watch?v=0HJPilemNns" target="_new">video</a>).',
  'Source is at <a href="https://github.com/simonswain/coldwar">github.com/simonswain/coldwar</a>',
  'TAB toggles scene options<br />ENTER restarts scene<br />\\ toggles diagnostics<br />? toggles help<br />Mousewheel and Drag to zoom and pan<br />+/- to zoom<br />0 to reset zoom<br />ESC to get back to Index',

  'Follow <a href="https://twitter.com/simon_swain">@simon_swain</a> on Twitter for updates',
  'Use #coldwar to tag',
]
