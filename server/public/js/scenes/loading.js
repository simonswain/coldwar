/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.loading = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.loading.prototype = Object.create(Scene.prototype);

Scenes.loading.prototype.title = 'Loading';

Scenes.loading.prototype.genAttrs = function(){
  return {
    at: Date.now(),
    time: 0,
    frame_index: 0,
    step_index: 0,
    time: 0,
    hold: 0,
    offset: 0,
    row_h: 16,
    x_off: 0.27
  };
};

Scenes.loading.prototype.init = function(){

  this.frames = [{
    duration: 10,
    paint: this.ready1
  }, {
    duration: 48,
    paint: this.ready2
  }, {
    duration: 70,
    paint: this.banner
  }, {
    duration: 10,
    paint: this.download
  }, {
    duration: 10,
    paint: this.grid
  }];
  
}

Scenes.loading.prototype.getCast = function(){
  return {
  }
};

Scenes.loading.prototype.defaults = [{
  key: 'max_x',
  value: 1600,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 700,
  min: 32,
  max: 1024
}, {
  key: 'max_z',
  value: 1,
  min: 1,
  max: 1
}, {
  key: 'step_delay',
  value: 1,
  min: 1,
  max: 120
}, {
  key: 'step_hold',
  value: 85,
  min: 1,
  max: 1000
}, {
  key: 'step_skip',
  value: 1,
  min: 1,
  max: 20
}, {
  key: 'frame_hold',
  value: 140,
  min: 1,
  max: 2400
}, {
  key: 'font-size',
  value: 24,
  min: 8,
  max: 64
}];

Scenes.loading.prototype.update = function(delta){
  // scanlines
  this.attrs.offset = this.attrs.offset + 0.25 * delta;
  if(this.attrs.offset >= this.attrs.row_h){
    this.attrs.offset = 0;
  }

  var frame = this.frames[this.attrs.frame_index];
  this.attrs.time += delta * 0.1;
  if (this.attrs.time > frame.duration && this.attrs.frame_index < this.frames.length - 1) {
    this.attrs.frame_index++;
    this.attrs.time = 0;
  }
}

Scenes.loading.prototype.flash = function(fx, gx){

  var i, ii;
  ii = gx.h;

  var view = gx
  
  for(i=0; i<ii; i+= this.attrs.row_h){
    view.ctx.beginPath();
    view.ctx.strokeStyle= 'rgba(255, 255, 255, 0.15)';
    view.ctx.lineWidth = 2;
    view.ctx.moveTo(0, i - this.attrs.offset);
    view.ctx.lineTo(gx.w, i-2 - this.attrs.offset);
    view.ctx.stroke();
  }

}


Scenes.loading.prototype.paint = function(fx, gx){
  var frame = this.frames[this.attrs.frame_index];
  var paint = frame.paint.bind(this)
  paint(fx);
  paint(gx);
}

Scenes.loading.prototype.ready1 = function(fx, gx) {
  fx.ctx.fillStyle = '#0f0';
  if (Math.random() < 0.05) {
    fx.ctx.fillStyle = '#0c0';
  }
  if (Math.random() < 0.01) {
    fx.ctx.fillStyle = '#090';
  }

  fx.ctx.font = '28pt ubuntu mono';
  fx.ctx.fillText('READY?', this.opts.max_x * this.attrs.x_off, this.opts.max_y * 0.1);
}

Scenes.loading.prototype.ready2original = function(fx) {

  var lines = [
    'READY.',
    '> SYSTEM',
    '*? PKTM',
    '*? /',
    '*** PSURKITERM 8.24 ***',
    'ATDT 00116421859394',
    'DIALING...',
    'CONNECT',
    'USER PSI',
    'PASS **************',
    'GREETINGS, SIMON',
  ];

  var ix = Math.floor(time / 2);

  if (ix >= lines.length) {
    ix = lines.length;
  }

  fx.ctx.fillStyle = '#0f0';
  fx.ctx.font = '28pt ubuntu mono';

  var yy = (this.opts.max_y * 0.9) - (40 * ix);
  for (var i = 0; i < ix; i++) {
    fx.ctx.fillText(lines[i], this.opts.max_x * this.attrs.x_off, yy + (40 * i));
  }
}


Scenes.loading.prototype.ready2 = function(fx) {

  // 'OK>_',
  // 'OK>GET COLDWAR',
  // 'DOWNLOADING ##############',
  // 'OK> BYE',
  // '+++',
  // 'READY> COLDWAR',

  var CR = String.fromCharCode(171);

  var lines = [
    'READY.             ',
    '> SYSTEM' + CR,
    '*? PKTM' + CR,
    '*? /' + CR,
    '*** PSURKITERM 3.15',
    'ATDT 00116421859394' + CR,
    'DIAL ..............',
    'CNCT               ',
    'BYPASSING...' + CR,
    '            ' + CR,
    '            ' + CR,
    '            ' + CR,
  ];

  var ix = Math.floor(this.attrs.time / 4);
  if (ix >= lines.length) {
    ix = lines.length;
  }

  var cx = Math.ceil(40 * (this.attrs.time / 4 - Math.floor(this.attrs.time / 4)));
  var ch;
  fx.ctx.font = '28pt ubuntu mono';

  var yy = (this.opts.max_y * 0.9) - (40 * ix);
  for (var i = 0; i < ix; i++) {
    ch = lines[i].substr(cx, 1);
    fx.ctx.fillStyle = '#0f0';
    if (Math.random() < 0.05) {
      fx.ctx.fillStyle = '#0c0';
    }
    if (Math.random() < 0.1) {
      fx.ctx.fillStyle = '#090';
    }
    if (i === ix - 1) {
      if (ch === CR) {
        fx.ctx.fillStyle = '#fff';
      }
      fx.ctx.fillText(lines[i].substr(0, cx), this.opts.max_x * this.attrs.x_off, yy + (40 * i));
      // cursor
      if (cx < lines[ix - 1].length) {
        fx.ctx.fillStyle = '#0f0';
        fx.ctx.fillRect(this.opts.max_x * this.attrs.x_off + (cx * 20) - 32, this.opts.max_y * 0.9 - 32, 32, 8);
      }

    } else {
      fx.ctx.fillText(lines[i], this.opts.max_x * this.attrs.x_off, yy + (40 * i));
    }
  }
}

Scenes.loading.prototype.banner = function(fx) {

  var lines = [
    '+--------------------------------------+',
    '|                 RATNET               |',
    '+--------------------------------------+',
    '|                                      |',
    '|                                      |',
    '|                                      |',
    '|                                      |',
    '|                                      |',
    '|                                      |',
    '|                                      |',
    '|                                      |',
    '|                                      |',
    '+--------------------------------------+',
    '                                        '
  ];

  var ix = Math.floor(this.attrs.time / 4);
  if (ix >= lines.length) {
    ix = lines.length;
  }

  var cx = Math.ceil(40 * (this.attrs.time / 4 - Math.floor(this.attrs.time / 4)));

  fx.ctx.font = '28pt ubuntu mono';

  var yy = (this.opts.max_y * 0.9) - (40 * ix);
  for (var i = 0; i < ix; i++) {
    if (i === ix - 1) {
      fx.ctx.fillStyle = '#ffbf00';
      if (Math.random() < 0.1) {
        fx.ctx.fillStyle = '#ffdd33';
      }
      fx.ctx.fillText(lines[i].substr(0, cx), this.opts.max_x * this.attrs.x_off, yy + (40 * i));

      // cursor
      if (cx < lines[ix - 1].length) {
        fx.ctx.fillStyle = '#ffdd33';
        fx.ctx.fillRect(this.opts.max_x * this.attrs.x_off + (cx * 18), this.opts.max_y * 0.9 - 32, 32, 8);
      }

    } else {
      fx.ctx.fillStyle = '#ffbf00';
      if (Math.random() < 0.1) {
        fx.ctx.fillStyle = '#ffdd33';
      }
      fx.ctx.fillText(lines[i], this.opts.max_x * this.attrs.x_off, yy + (40 * i));
    }


  }
}


Scenes.loading.prototype.download = function(fx) {

  // 'OK>_',
  // 'OK>GET COLDWAR',
  // 'DOWNLOADING ##############',
  // 'OK> BYE',
  // '+++',
  // 'READY> COLDWAR'

  var lines = [
    'DOWNLOADING                             ',
    '########################################',
    'DONE                                    ',
    '>RUN                                    ',
    '                                        '
  ];

  var ix = Math.floor(this.attrs.time);
  if (ix >= lines.length) {
    ix = lines.length;
  }

  var cx = Math.ceil(40 * (this.attrs.time / 4 - Math.floor(this.attrs.time / 4)));

  fx.ctx.fillStyle = '#ffbf00';
  fx.ctx.font = '24pt ubuntu mono';

  var yy = (this.opts.max_y * 0.9) - (40 * ix);
  for (var i = 0; i < ix; i++) {
    if (i === ix - 1) {
      fx.ctx.fillStyle = '#ffbf00';
      fx.ctx.fillText(lines[i].substr(0, cx), this.opts.max_x * this.attrs.x_off, yy + (40 * i));

      // cursor
      if (cx < lines[ix - 1].length) {
        fx.ctx.fillStyle = '#ffdd33';
        fx.ctx.fillRect(this.opts.max_x * this.attrs.x_off + (cx * 22), this.opts.max_y * 0.9 - 32, 32, 8);
      }

    } else {
      fx.ctx.fillStyle = '#ffbf00';
      fx.ctx.fillText(lines[i], this.opts.max_x * this.attrs.x_off, yy + (40 * i));
    }

  }
}

Scenes.loading.prototype.grid = function(fx) {
  var i, j, ii, jj;

  var max = Math.min(this.opts.max_x, this.opts.max_y);

  fx.ctx.save();
  fx.ctx.translate((this.opts.max_x / 2) - (max / 2), (this.opts.max_y / 2) - (max / 2));

  var steps = 16;
  var step = max / steps;
  var limit = steps;
  if (this.attrs.time < 1) {
    limit = this.attrs.time * steps;
  }

  fx.ctx.strokeStyle = 'rgba(0, 255, 255, 1)';
  fx.ctx.lineWidth = 2;
  fx.ctx.beginPath();
  fx.ctx.rect(0, 0, max, max);
  fx.ctx.stroke();

  for (i = 0; i <= limit; i++) {
    for (j = 0; j <= limit; j++) {
      fx.ctx.beginPath();
      fx.ctx.moveTo(0, i * step);
      fx.ctx.lineTo(steps * step, i * step);
      fx.ctx.stroke();

      fx.ctx.beginPath();
      fx.ctx.moveTo(i * step, 0);
      fx.ctx.lineTo(i * step, steps * step);
      fx.ctx.stroke();
    }
  }

  fx.ctx.restore();
}
