/* global Actors, Actor, Vec3, hex2rgb */

Actors.Oneup = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Oneup.prototype = Object.create(Actor.prototype)

Actors.Oneup.prototype.title = 'Oneup'

Actors.Oneup.prototype.genAttrs = function (attrs) {
  return {
    text: attrs.text || 'machine',
    style: attrs.style || 'static',
    ttl: attrs.ttl || this.opts.ttl,
    initial_ttl: attrs.ttl || this.opts.ttl,
    dead: false,
  }
}

Actors.Oneup.prototype.init = function (attrs) {
  this.pos = new Vec3(
    attrs.x,
    attrs.y
  )
}

Actors.Oneup.prototype.defaults = [{
  key: 'ttl',
  value: 60,
  min: 1,
  max: 300
}]

Actors.Oneup.prototype.update = function (delta) {
  this.attrs.ttl -= delta

  this.attrs.clock = 1 - (this.attrs.ttl / this.attrs.initial_ttl)

  if (this.attrs.ttl <= 0) {
    this.attrs.dead = true
  }  
}

Actors.Oneup.prototype.paint = function (view) {

  var gx = view;
  var h = (Date.now()%360 * 0.22) - 10;
  
  if(this.attrs.style === 'static'){
    gx.ctx.fillStyle = 'hsl(' + h + ', 100%, 50%)';
    
    if(Math.random() < 0.025){
      gx.ctx.fillStyle = 'rgba(255,255,0,0.5)';
    }

    if(Math.random() < 0.025){
      gx.ctx.fillStyle = 'rgba(255,255,255,1)';
    }

    if(Date.now() % 1000 < 200){
      // don't draw black
      return;
      gx.ctx.fillStyle = 'rgba(0,0,0,1)';
    }

    if(Date.now() % 1000 > 950){
      gx.ctx.fillStyle = 'rgba(255,255,255,1)';
    }     

    gx.ctx.save();
    gx.ctx.font = '36pt robotron';
    gx.ctx.textAlign='center'
    gx.ctx.textBaseline='middle'

    gx.ctx.fillText(this.attrs.text, 0, 0);
    gx.ctx.restore();
  }

  if(this.attrs.style === 'oneup'){
    gx.ctx.fillStyle = 'hsl(' + h + ', 100%, 50%)';
    
    if(Math.random() < 0.025){
      gx.ctx.fillStyle = 'rgba(255,255,0,0.5)';
    }

    if(Math.random() < 0.025){
      gx.ctx.fillStyle = 'rgba(255,255,255,1)';
    }

    if(Date.now() % 1000 < 200){
      // don't draw black
      return;
      gx.ctx.fillStyle = 'rgba(0,0,0,1)';
    }

    if(Date.now() % 1000 > 950){
      gx.ctx.fillStyle = 'rgba(255,255,255,1)';
    }     

    gx.ctx.save();
    gx.ctx.font = '36pt robotron';
    gx.ctx.textAlign='center'
    gx.ctx.textBaseline='middle'

    gx.ctx.translate(0, -this.attrs.clock * this.refs.cell.opts.max_y * 0.4)
    
    
    gx.ctx.fillText(this.attrs.text, 0, 0);
    gx.ctx.restore();
  }

  if(this.attrs.style === 'pow'){

    var a = 1 - this.attrs.clock;
    
    gx.ctx.fillStyle = 'hsla(' + h + ', 100%, 50%, ' + a + ')';
    
    if(Math.random() < 0.025){
      gx.ctx.fillStyle = 'rgba(255,255,0,, ' + (a/2) + ')';
    }

    if(Math.random() < 0.025){
      gx.ctx.fillStyle = 'rgba(255,255,255,' + a + ')';
    }

    if(Date.now() % 1000 < 200){
      // don't draw black
      return;
      gx.ctx.fillStyle = 'rgba(0,0,0,1)';
    }

    if(Date.now() % 1000 > 950){
      gx.ctx.fillStyle = 'rgba(255,255,255,1)';
    }     

    gx.ctx.save();
    gx.ctx.font = '48pt robotron';
    gx.ctx.textAlign='center'
    gx.ctx.textBaseline='middle'

    gx.ctx.scale(1 + (this.attrs.clock * 2), 1 + (this.attrs.clock * 2))
    
    gx.ctx.fillText(this.attrs.text, 0, 0);
    gx.ctx.restore();
  }
    
}

