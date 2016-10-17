/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.title = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
  this.env.fx_alpha = 0.3;
};

Scenes.title.prototype = Object.create(Scene.prototype);

Scenes.title.prototype.title = 'Title';

Scenes.title.prototype.layout = '';

Scenes.title.prototype.init = function(){

}

Scenes.title.prototype.getCast = function(){
  return {
  }
};

Scenes.title.prototype.defaults = [{
  key: 'max_x',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 640,
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
  key: 'frame_hold',
  value: 850,
  min: 1,
  max: 6000
}, {
  key: 'font_size',
  value: 18,
  min: 8,
  max: 64
}, {
  key: 'wiggle_size',
  value: 5,
  min: 0,
  max: 64
}];

Scenes.title.prototype.genAttrs = function(){
  return {
    frame_index: -1,
    step_index: 0,
    time: 0,
    hold: 0,
    offset: 0,
    row_h: 64,
    x_off: 0.27,
    alpha: 0
  };
};

Scenes.title.prototype.update = function(delta){

  //this.attrs.alpha += delta * 0.05;
  this.attrs.alpha = (0.5-(Math.sin(Math.PI * (Date.now()%4000)/2000)/2));

  if(this.attrs.alpha < 0.01 && this.attrs.flag){
    this.attrs.flag = false;
    this.env.play('heartbeat');
  }
  if(this.attrs.alpha > 0.99 && !this.attrs.flag){
    this.attrs.flag = true;
    //this.env.play('heartbeat');
  }

  // scanlines
  this.attrs.offset = this.attrs.offset + 0.25 * delta;
  if(this.attrs.offset >= this.attrs.row_h){
    this.attrs.offset = 0;
  }

  var diff = this.env.diff;
  
  if(this.attrs.hold > 0){
    this.attrs.hold -= diff;
  }

  if(this.attrs.hold <= 0){
    this.attrs.hold = this.opts.frame_hold;
    this.attrs.frame_index ++;
    if(this.attrs.frame_index === Scenes.title.prototype.frames.length){
      this.attrs.frame_index = 0;
    }
  }

  if(Math.random() < 0.02){
    this.env.flash = true
  }

}

Scenes.title.prototype.flash = function(fx, gx){

  var i, ii;
  ii = gx.h;

  var view = gx

    var h = (Date.now()%360 * 0.22) - 10;
  var c;
  c = 'hsl(' + h + ', 100%, 50%)';
  
  if(Math.random() < 0.025){
    c = 'rgba(255,255,0,0.5)';
  }

  if(Math.random() < 0.15){
    c = 'rgba(255,255,255,1)';
  }
  
  view.ctxshadowColor = c;
  view.ctxshadowBlur = 40;
  view.ctxshadowOffsetX = 0;
  view.ctxshadowOffsetY = 0;
  view.ctxshadowBlur = 16;
  
  for(i=0; i<ii; i+= this.attrs.row_h){
    view.ctx.beginPath();
    view.ctx.strokeStyle= 'rgba(0, 255, 255, 0.25)';
    if(Math.random() < 0.02){
      view.ctx.strokeStyle= 'rgba(255, 0, 255, 0.15)';
    }
    if(Math.random() < 0.01){
      view.ctx.strokeStyle= 'rgba(255, 255, 255, 0.75)';
    }
    view.ctx.lineWidth = 3;
    view.ctx.moveTo(0, i - this.attrs.offset);
    view.ctx.lineTo(gx.w, i-2 - this.attrs.offset);
    view.ctx.stroke();
    view.ctx.fill();
  }

}

Scenes.title.prototype.paint = function(fx, gx, sx){
  this.paintTitle(gx);
  fx.ctx.save();
  fx.ctx.translate(this.opts.wiggle_size*(Math.random() - 0.5), this.opts.wiggle_size*(Math.random() - 0.5));
  this.paintTitle(fx);
  fx.ctx.restore();
}

Scenes.title.prototype.paintTitle = function(view){

  var frame = Scenes.title.prototype.frames[this.attrs.frame_index];
  
  view.ctx.fillStyle = '#fb0';
  //view.ctx.font = this.opts.font_size + 'pt ubuntu mono';
  view.ctx.font = '24pt robotron';
  var text = frame.text
var chars;
  // chars = ['R','A','T','S',' ',' ',' ', 'O','F',' ',' ',' ', 'T','H','E',' ',' ',' ', 'M','A','Z','E',' ',' ',' ', 'O','F',' ',' ',' ', 'T','H','E',' ',' ',' '];
  chars = ['R', '#', 'A','#','T','#','S',' ',' ', 'O','#','F',' ',' ', 'T','#','H','#','E',' ',' ',' ', 'M','#','A','#','Z','#','E',' ',' '];
  if(!this.ch || this.ch >= chars.length){
    this.ch = 0;
  }
  var char = chars[Math.floor(this.ch)];
  this.ch+= 0.07
  var fills = ['X','O','+','*'];
  var fill = chars[Math.floor(Math.random()*chars.length)];
  char = char.replace(/#/g, fill);
  var text = text.replace(/x/g, char);

  var yy = (this.opts.max_y * 0.1);
  var dy = (this.opts.max_y * 0.05);
  var xx = (this.opts.max_x * 0.1);
  var dx = (this.opts.max_x * 0.03);
  var y = 0;
  var x = 0;
  var ii = Scenes.title.prototype.frames[this.attrs.frame_index].text.length
  //var ii = this.attrs.step_index;
  var rowShift = false;

  view.ctx.save();
  view.ctx.translate(this.opts.max_x * 0.1, this.opts.max_y * 0.3);
  for (var i = 0; i < ii; i++) {

    if(frame.text[i] === "\n"){
      y ++;
      x = 0;
      if(rowShift){ 
        view.ctx.restore();
      }
      rowShift = false;

      if(x === 0 && Math.random() < 0.05){
        view.ctx.save();
        view.ctx.translate((Math.random() * 300)-150, 0);
        rowShift = true;
      }

      continue;
    }
    
    view.ctx.save();
    view.ctx.translate(Math.random() * 5, Math.random() * 5);

    if(text[i] === ' '){
      view.ctx.strokeStyle = '#00f' 
      view.ctx.lineWidth = 1;
      view.ctx.strokeRect(xx + (x * dx), yy + (y * dy) - 26, 20, 24);
    }
 
    if(text[i] === ' '){
      view.ctx.strokeStyle = '#00f' 
      view.ctx.lineWidth = 1;
      view.ctx.strokeRect(xx + (x * dx), yy + (y * dy) - 26, 20, 24);
    }

    var ch = text[i] === ' ' ? ' ' : '-';
    var trans = false;
    if(text[i] !== ' '){
      view.ctx.fillStyle = 'rgba(255, 192, 0, ' + (0.25 + (Math.random()*0.25)) + ')';
      view.ctx.fillStyle = 'rgba(0, 204, 0, 0.25)';

      var h = (Date.now()%360 * 0.25) - 10;
      view.ctx.fillStyle = 'hsl(' + (h + 160) + ', 100%, 50%)';
      
      if(Math.random() < 0.025){
        view.ctx.fillStyle = 'rgba(255,255,0,0.5)';
        view.ctx.translate(0, ((Math.random()-0.5))*this.opts.max_y * 0.5)
        trans = true;
        ch = '_';
      }

      if(Math.random() < 0.025){
        view.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        view.ctx.translate(0, ((Math.random()-0.5))*this.opts.max_y * 0.5)
        trans = true;
      }

      view.ctx.fillStyle = 'hsl(' + (h + 160) + ', 100%, 50%)';
      view.ctx.fillRect(xx + (x * dx), yy + (y * dy) - 26, 22, 28);

      if(!trans){
        var h = (Date.now()%360 * 0.22) - 10;
        view.ctx.fillStyle = 'hsl(' + h + ', 100%, 50%)';
        
        if(Math.random() < 0.025){
          view.ctx.fillStyle = 'rgba(255,255,0,0.5)';
        }

        if(Math.random() < 0.025){
          view.ctx.fillStyle = 'rgba(255,255,255,1)';
        }

        if(Date.now() % 1000 < 200){
          view.ctx.fillStyle = 'rgba(0,0,0,1)';
        }

        if(Date.now() % 1000 > 950){
          view.ctx.fillStyle = 'rgba(255,255,255,1)';
        }     

        view.ctx.fillRect(xx + (x * dx), yy + (y * dy) - 26, 22, 28);
      }
    }

    view.ctx.fillStyle = '#000';
    if(rowShift){
      view.ctx.fillStyle = 'rgba(0,255,0,' + (0.25+Math.random()*0.25) + ')';
    }
    if(Math.random() < 0.05){
      view.ctx.fillStyle = '#f00';
    }
    if(Math.random() < 0.05){
      view.ctx.fillStyle = '#222';
    }
    view.ctx.textAlign='center';
    view.ctx.fillText(ch, xx + (x * dx), yy + (y * dy));
    //view.ctx.fillText(text[i], xx + (x * dx), yy + (y * dy));

    view.ctx.restore();
    x ++;
  }
  if(rowShift){ 
    view.ctx.restore();
  }
  view.ctx.restore();

  
}

Scenes.title.prototype.frames = [];

Scenes.title.prototype.frames[0] = {
  text:[
    ' xxxxxx x   x  xxxx  ',
    '   xx   x   x  xx    ',
    '   xx   x   x  xx    ',
    '   xx   xxxxx  xxx   ',
    '   xx   xxxxx  xx    ',
    '   xx   x   x  xxxx  ',
  ].join("\n")
};

Scenes.title.prototype.frames[1] = {
  text:[
    ' x x    xx   xxxx  xxxx',
    'xxxxx  xxxx    xx  x   ',
    'x x x  x  x   xx   xx  ',
    'x   x  xxxx  xx    xx  ',
    'x   x  x  x  xx    x   ',
    'x   x  x  x  xxxx  xxxx'
  ].join("\n")
};

Scenes.title.prototype.frames[2] = {
  text:[
    '     xxx   xxxx    ',
    '    x  xx  x       ',
    '    x  xx  x       ',
    '    x  xx  xx      ',
    '    x  xx  xx      ',
    '     xxx   x       ',
  ].join("\n")
};

Scenes.title.prototype.frames[3] = {
  text:[
    ' xxxxxx x   x  xxxx  ',
    '   xx   x   x  xx    ',
    '   xx   x   x  xx    ',
    '   xx   xxxxx  xxx   ',
    '   xx   xxxxx  xx    ',
    '   xx   x   x  xxxx  ',
  ].join("\n")
};

Scenes.title.prototype.frames[4] = {
  text:[
    'xxx    xx  xxxxxx xxxx',
    'x xx  xxxx   xx   xx   ',
    'x xx  x  x   xx   xx  ',
    'xxx   xxxx   xx   xxxx',
    'x  x  x  x   xx     xx',
    'x  x  x  x   xx   xxxx',
  ].join("\n")
};

Scenes.title.prototype.frames[5] = {
  text:[
    '     xxx   xxxx    ',
    '    x  xx  x       ',
    '    x  xx  x       ',
    '    x  xx  xx      ',
    '    x  xx  xx      ',
    '     xxx   x       ',
  ].join("\n")
};

