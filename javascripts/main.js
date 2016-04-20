window.onload = function() {window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var futureTickTime = audioContext.currentTime;
var current16thNote = 1;
var tempo = 120.0; //initial tempo
var timerID = 0;
var mixGain = audioContext.createGain();
var filterGain = audioContext.createGain();
mixGain.connect(audioContext.destination);
mixGain.gain.value = 0;
var slider = document.getElementById("myRange");
var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");
var tempoVal = document.getElementById("tempoVal");
var kickDivs = document.querySelectorAll(".kicks");
var snareDivs = document.querySelectorAll(".snare");
var hihatDivs = document.querySelectorAll(".hihat");

var kicks = Array.prototype.slice.call(kickDivs);
var snares = Array.prototype.slice.call(snareDivs);
var hihats = Array.prototype.slice.call(hihatDivs);
var combinedDivs = kicks.concat(snares);

var initDivs = (function(){
  
  return {
    set: function( divType, colour ){
      
      for (var i = 0; i < divType.length; i++) {

      divType[i].style.backgroundColor = "black";

      divType[i].addEventListener('click', function () {

      var nowColour = this.style.backgroundColor;
      var black = this.style.backgroundColor = "black";
      var otherColours = this.style.backgroundColor = colour;

        switch(nowColour) {
          case black:
            this.style.backgroundColor = colour;
            break;
          case otherColours:
            this.style.backgroundColor = "black";
            break;
        };
      
    }, false);
  
  };
      
    }
    
  };
  
}());

initDivs.set(kickDivs, "pink");
initDivs.set(snareDivs, "lightskyblue");
initDivs.set(hihatDivs, "lightgreen");

slider.oninput = function() {
  
  this.step = "1";
  this.type = "range";
  this.max = "150";
  this.min = "5";
  tempo = this.value;
  tempoVal.innerHTML = tempo;
  return tempo;
};

function futureTick() {
  var secondsPerBeat = 60.0 / tempo;
  futureTickTime += 0.25 * secondsPerBeat; // "future note"
  current16thNote++;
  if (current16thNote > 16) {
    current16thNote = 1;
  }
};

function scheduleNote(beatDivisionNumber, time) {
  
  if(current16thNote){    
    var currentKickDiv = kickDivs[current16thNote - 1];
    var currentSnareDiv = snareDivs[current16thNote - 1];
    var currentHihatDiv = hihatDivs[current16thNote - 1];

    if(currentSnareDiv.style.backgroundColor == "lightskyblue"){
      snare(time);
    };
    
    if(currentKickDiv.style.backgroundColor == "pink"){
      kick(time);
    };

    if(currentHihatDiv.style.backgroundColor == "lightgreen"){
      hihat(time);
    };
    
    nextDiv.kickCount(kicks); 
    nextDiv.snareCount(snares); 
    nextDiv.hihatCount(hihats); 
  };
    
};

function scheduler() {
  
  while (futureTickTime < audioContext.currentTime + 0.1) {
    
    scheduleNote(current16thNote, futureTickTime);
    futureTick();
 
  }
  timerID = window.setTimeout(scheduler, 50.0);
};

//SYNTHESISED SOUNDS

function kick(time) {

        var osc = audioContext.createOscillator();
        var osc2 = audioContext.createOscillator();
        var gainOsc = audioContext.createGain();
        var gainOsc2 = audioContext.createGain();

        osc.type = 'triangle';
        osc2.type = 'sine';

        gainOsc.gain.setValueAtTime(1, time);
        gainOsc.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
        gainOsc.connect(audioContext.destination);
        gainOsc2.gain.setValueAtTime(1, time);
        gainOsc2.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
        gainOsc2.connect(audioContext.destination);
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(0.001, time + 0.5);
        osc2.frequency.setValueAtTime(50, time);

        //Connections
        osc.connect(gainOsc);
        osc2.connect(gainOsc2);
        gainOsc2.connect(mixGain);
        gainOsc.connect(mixGain);

        mixGain.gain.exponentialRampToValueAtTime(0.8, time + 0.2);

        osc.start(time);
        osc2.start(time);
        osc.stop(time + 0.9);
        osc2.stop(time + 0.9);
 
};

function snare(time) {

        var osc3 = audioContext.createOscillator();
        var gainOsc3 = audioContext.createGain();

        filterGain.gain.setValueAtTime(1, time);
        filterGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        osc3.type = 'triangle';
        osc3.frequency.value = 100;

        gainOsc3.gain.value = 0;
        gainOsc3.gain.setValueAtTime(0, time);
        //gainOsc3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        //Connections
        osc3.connect(gainOsc3);
        gainOsc3.connect(mixGain);

        //mixGain.gain.value = 1;

        osc3.start(time);
        osc3.stop(time + 0.2);

        var node = audioContext.createBufferSource(),
            buffer = audioContext.createBuffer(1, 4096, audioContext.sampleRate),
            data = buffer.getChannelData(0);

        var filter = audioContext.createBiquadFilter();

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(100, time);
        filter.frequency.linearRampToValueAtTime(1000, time + 0.1);

        for (var i = 0; i < 4096; i++) {
            data[i] = Math.random();
        }

        node.buffer = buffer;
        node.loop = true;

        //Connections
        node.connect(filter);
        filter.connect(filterGain);
        filterGain.connect(mixGain);

        node.start(time);
        node.stop(time + 0.1);
  
        mixGain.gain.exponentialRampToValueAtTime(0.8, time + 0.2);

};

 function hihat(time) {

        var gainOsc4 = audioContext.createGain();
        var fundamental = 40;
        var ratios = [
            2,
            3,
            4.16,
            5.43,
            6.79,
            8.21
        ];
        var bandpass = audioContext.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 10000;
        var highpass = audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 7000;
        ratios.forEach(function(ratio) {
            var osc4 = audioContext.createOscillator();
            osc4.type = 'square';
            osc4.frequency.value = fundamental * ratio;
            osc4.connect(bandpass);
            osc4.start(time);
            osc4.stop(time + 0.05);
        });

        gainOsc4.gain.setValueAtTime(1, time);
        gainOsc4.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        bandpass.connect(highpass);
        highpass.connect(gainOsc4);
        gainOsc4.connect(mixGain);

        mixGain.gain.value = 1;
};

var nextDiv = (function() {
  
  var countOtherKick = -1; //for black tiles
  var countCurrentKick = 0; //for coloured tiles
  var countCurrentSnare = 0;
  var countOtherSnare = -1;
  var countCurrentHihat = 0;
  var countOtherHihat = -1;
  var currentDiv;
  var notCurrentDiv;
  
  return {
    kickCount: function(divType){  
      
          notCurrentDiv = divType[++countOtherKick % divType.length];
          currentDiv = divType[++countCurrentKick % divType.length];
      
          currentDiv.style.borderRadius = "1000px";
          notCurrentDiv.style.borderRadius = "25px";
      
           if(countCurrentKick > 15){
               countOtherKick = -1; //for black tiles
               countCurrentKick = 0; 
           };
      
          //console.log(currentDiv);
    
          //return [notCurrentDiv, currentDiv]; 
      },
    snareCount: function(divType){  
      
          notCurrentDiv = divType[++countOtherSnare % divType.length];
          currentDiv = divType[++countCurrentSnare % divType.length];
      
          currentDiv.style.borderRadius = "1000px";
          notCurrentDiv.style.borderRadius = "25px";
      
           if(countCurrentSnare > 15){
               countOtherSnare = -1; //for black tiles
               countCurrentSnare = 0; 
           };
         },
      hihatCount: function(divType){  
      
          notCurrentDiv = divType[++countOtherHihat % divType.length];
          currentDiv = divType[++countCurrentHihat % divType.length];
      
          currentDiv.style.borderRadius = "1000px";
          notCurrentDiv.style.borderRadius = "25px";
      
           if(countCurrentHihat > 15){
               countOtherHihat = -1; //for black tiles
               countCurrentHihat = 0; 
           };
      
          //console.log(currentDiv);
    
          //return [notCurrentDiv, currentDiv]; 
      }
    };
}());


startBtn.addEventListener('click', function(time) { 
  
  scheduler();
  
}, false);

stopBtn.addEventListener('click', function() { 

    clearTimeout(timerID); 
    
}, false);

};