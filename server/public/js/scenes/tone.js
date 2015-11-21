/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.tone = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.tone.prototype = Object.create(Scene.prototype);

Scenes.tone.prototype.title = 'Tone';

Scenes.tone.prototype.layout = '';

Scenes.tone.prototype.stop = function(){

  this.analyser.disconnect(0);
  this.analyser = null;

  this.filter.disconnect(0);
  this.filter = null;

  this.mix.disconnect(0);
  this.mix = null;

  this.amp1.disconnect(0);
  this.amp1 = null;

  this.amp2.disconnect(0);
  this.amp2 = null;

  this.osc1.stop(0);
  this.osc1.disconnect(0);
  this.osc1 = null;

  this.osc2.stop(0);
  this.osc2.disconnect(0);
  this.osc2 = null;

}

Scenes.tone.prototype.init = function(){

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if(!window.audiocontext){
    window.audiocontext = new AudioContext();
  }
  this.ctx = window.audiocontext;

  var filters = ['lowpass','highpass'];

  this.filter = this.ctx.createBiquadFilter();
  this.filter.type = filters[this.opts.filter_type];
  this.filter.frequency.value = this.opts.filter_f;
  this.filter.connect(this.ctx.destination);

  this.mix = this.ctx.createChannelMerger(2);
  this.mix.connect(this.filter);

  this.amp1 = this.ctx.createGain();
  this.amp1.gain.value = this.opts.osc1_amp;
  this.amp1.connect(this.mix);

  this.amp2 = this.ctx.createGain();
  this.amp2.gain.value = this.opts.osc2_amp;
  this.amp2.connect(this.mix);

  var waves = ['sine','square','sawtooth','triangle'];

  this.osc1 = this.ctx.createOscillator();
  this.osc1.type = waves[this.opts.osc1_wave];
  this.osc1.frequency.value = this.opts.osc1_f;
  this.osc1.detune = this.opts.osc1_detune;
  this.osc1.connect(this.amp1);

  this.osc2 = this.ctx.createOscillator();
  this.osc2.type = waves[this.opts.osc2_wave];
  this.osc2.frequency.value = this.opts.osc2_f;
  this.osc2.detune = this.opts.osc2_detune;
  this.osc2.connect(this.amp2);

  this.analyser = this.ctx.createAnalyser();
  this.analyser.fftSize = this.opts.fft_size;
  this.bufferLength = this.analyser.frequencyBinCount
  this.filter.connect(this.analyser);

  this.freqs = new Uint8Array(this.bufferLength);
  this.times = new Uint8Array(this.bufferLength);

  this.osc1.start(0);
  this.osc2.start(0);

}

Scenes.tone.prototype.getCast = function(){
  return {
  }
};

Scenes.tone.prototype.defaults = [{
  key: 'max_x',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 480,
  min: 32,
  max: 1024
}, {
  key: 'max_z',
  value: 1,
  min: 1,
  max: 1
}, {
  key: 'fft_smoothing',
  value: 0.6,
  min: 0.1,
  max: 1,
  step: 0.1
}, {
  key: 'fat',
  value: 3,
  min: 0,
  max: 8
}, {
  key: 'fft_size',
  value: 1024,
  min: 1024,
  max: 1024
}, {
  key: 'filter_type',
  value: 0,
  min: 0,
  max: 1
}, {
  key: 'filter_f',
  value: 2500,
  min: 0,
  max: 5000
}, {
  key: 'osc1_wave',
  value: 2,
  min: 0,
  max: 3
}, {
  key: 'osc1_f',
  value: 349.2,
  min: 1,
  max: 1000
}, {
  key: 'osc1_detune',
  value: 0,
  min: -50,
  max: 50
}, {
  key: 'osc1_amp',
  value: 0.5,
  min: 0,
  max: 1,
  step: 0.1
}, {
  key: 'osc2_wave',
  value: 1,
  min: 0,
  max: 3
}, {
  key: 'osc2_f',
  value: 220,
  min: 1,
  max: 1000
}, {
  key: 'osc2_detune',
  value: 0,
  min: -50,
  max: 50
}, {
  key: 'osc2_amp',
  value: 0.5,
  min: 0,
  max: 1,
  step: 0.1
}];

Scenes.tone.prototype.genAttrs = function(){
  return {
  };
};

Scenes.tone.prototype.update = function(delta){
}

Scenes.tone.prototype.paint = function(fx, gx, sx){

  this.analyser.getByteTimeDomainData(this.times);
  this.analyser.getByteFrequencyData(this.freqs);
  var alpha;
  alpha = 0.5 + Math.random()*0.5
  gx.ctx.strokeStyle='rgba(0,255,255,' + alpha + ')';
  gx.ctx.lineWidth=this.opts.fat;

  gx.ctx.beginPath();
  var w = this.opts.max_x * 1.0/this.bufferLength;
  var x = 0;
  var y, v, i;
  for(i=0; i<this.bufferLength; i++){
    v = this.times[i] / 128.0;
    y = v * this.opts.max_y/2;
    if(x === 0){
      gx.ctx.moveTo(x, y);
    }
    gx.ctx.lineTo(x, y);
    x += w;
  }
  gx.ctx.stroke();

  alpha = 0.25 + Math.random()*0.25
  fx.ctx.fillStyle='rgba(255,0,255,' + alpha + ')';
  x = 0;
  for(i=0; i<this.bufferLength; i++){
    if(x > this.opts.max_x){
      break;
    }
    y = this.freqs[i];
    fx.ctx.fillRect(x, (this.opts.max_y/2)-(y/2), w, y);
    x += w * 5;
  }


}
