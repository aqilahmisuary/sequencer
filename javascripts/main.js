window.onload = function() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  let audioContext = new AudioContext();
  let futureTickTime = audioContext.currentTime;
  let current16thNote = 1;
  let tempo = 120.0; //initial tempo
  let delayVal = 0; //initial delay value
  let timerID = 0;
  let mixGain = audioContext.createGain();
  let filterGain = audioContext.createGain();
  mixGain.connect(audioContext.destination);
  mixGain.gain.value = 0;
  let slider = document.getElementById("myRange");
  let delaySlider = document.getElementById("delaySlider");
  let startBtn = document.getElementById("startBtn");
  let stopBtn = document.getElementById("stopBtn");
  let tempoVal = document.getElementById("tempoVal");
  let delayRange = document.getElementById("delayRange");
  let kickDivs = document.querySelectorAll(".kicks");
  let snareDivs = document.querySelectorAll(".snare");
  let hihatDivs = document.querySelectorAll(".hihat");
  let grainDivs = document.querySelectorAll(".grains");

  let kicks = Array.prototype.slice.call(kickDivs);
  let snares = Array.prototype.slice.call(snareDivs);
  let hihats = Array.prototype.slice.call(hihatDivs);
  let grains = Array.prototype.slice.call(grainDivs);
  let combinedDivs = kicks.concat(snares);

  let initDivs = (function() {

    return {
      set: function(divType, colour) {

        for (var i = 0; i < divType.length; i++) {

          divType[i].style.backgroundColor = "black";

          divType[i].addEventListener('click', function() {

            var nowColour = this.style.backgroundColor;
            var black = this.style.backgroundColor = "black";
            var otherColours = this.style.backgroundColor = colour;

            switch (nowColour) {
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
  initDivs.set(grainDivs, "lightslategray");

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

    if (current16thNote) {
      var currentKickDiv = kickDivs[current16thNote - 1];
      var currentSnareDiv = snareDivs[current16thNote - 1];
      var currentHihatDiv = hihatDivs[current16thNote - 1];
      var currentGrainDiv = grainDivs[current16thNote - 1];

      if (currentSnareDiv.style.backgroundColor == "lightskyblue") {
        snare(time);
      };

      if (currentKickDiv.style.backgroundColor == "pink") {
        kick(time);
      };

      if (currentHihatDiv.style.backgroundColor == "lightgreen") {
        hihat(time);
      };

      if (currentGrainDiv.style.backgroundColor == "lightslategray") {
        grain(time);
      };

      nextDiv.kickCount(kicks);
      nextDiv.snareCount(snares);
      nextDiv.hihatCount(hihats);
      nextDiv.grainCount(grains);
    };

  };

  function scheduler() {

    while (futureTickTime < audioContext.currentTime + 0.1) {

      scheduleNote(current16thNote, futureTickTime);
      futureTick();

    }
    timerID = window.setTimeout(scheduler, 50.0);
  };

  //EFFECTS - Delay

  (function(){

    var feedback = audioContext.createGain();
    var delay = audioContext.createDelay();
    var leftDelay = audioContext.createDelay();
    var rightDelay = audioContext.createDelay();
    var outputmix = audioContext.createGain();

    leftDelay.delayTime.value = 0.375;
    rightDelay.delayTime.value = 0.375;

    leftDelay.connect(rightDelay);

    var merger = audioContext.createChannelMerger(2);
    leftDelay.connect(merger, 0, 0);
    rightDelay.connect(merger, 0, 1);
    merger.connect(outputmix);

    mixGain.connect(feedback);
    feedback.connect(leftDelay);
    rightDelay.connect(feedback);
    feedback.gain.value = 0.4;
    leftDelay.connect(rightDelay);

    outputmix.connect(mixGain);

    delaySlider.oninput = function() {

    this.step = "0.1";
    this.max = "0.9";
    this.min = "0";
    delayVal = this.value;
    delayRange.innerHTML = delayVal;
    outputmix.gain.value = delayVal;


    return delayVal;

  };


  }());


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

  function onError() { console.log("Bad browser! No Web Audio API for you"); }

  (function() {

     var request = new XMLHttpRequest();
     request.open('GET', "./audio/synthlead.wav", true);
     request.responseType = 'arraybuffer';
     request.onload = function() {
         audioContext.decodeAudioData(request.response, function(arrayBuffer) {
             buffer = arrayBuffer;
         }, onError);
     };
     request.send();

 }());

//GRANULATOR

  function grain(time) {

      var source = audioContext.createBufferSource();
      var grainGain = audioContext.createGain();
      var panNode = audioContext.createStereoPanner();
      var now = audioContext.currentTime;

      source.buffer = buffer;
      var soundDuration = source.buffer.duration;

      var randomParts = Math.random() * (soundDuration - 0.1) + 0.1;
      //var randomPitch = Math.random() * (2 - -0.5) + -0.5;
      var randomPan = Math.random() * (1 - -1) + -1;

      panNode.pan.value = randomPan;

      //source.playbackRate.value = randomPitch;

      grainGain.gain.setValueAtTime(0, now);
      grainGain.gain.linearRampToValueAtTime(1, now + 0.1);
      grainGain.gain.linearRampToValueAtTime(0, now + 0.1 + 0.3);

      source.connect(panNode);
      panNode.connect(grainGain);
      grainGain.connect(mixGain);

      source.start(now, randomParts, 3);
  };

  var nextDiv = (function() {

    var countOtherKick = -1; //for black tiles
    var countCurrentKick = 0; //for coloured tiles
    var countCurrentSnare = 0;
    var countOtherSnare = -1;
    var countCurrentHihat = 0;
    var countOtherHihat = -1;
    var countCurrentGrain = 0;
    var countOtherGrain = -1;
    var currentDiv;
    var notCurrentDiv;

    return {
      kickCount: function(divType) {

        notCurrentDiv = divType[++countOtherKick % divType.length];
        currentDiv = divType[++countCurrentKick % divType.length];

        currentDiv.style.borderRadius = "1000px";
        notCurrentDiv.style.borderRadius = "25px";

        if (countCurrentKick > 15) {
          countOtherKick = -1; //for black tiles
          countCurrentKick = 0;
        };

        //console.log(currentDiv);

        //return [notCurrentDiv, currentDiv];
      },
      grainCount: function(divType) {

        notCurrentDiv = divType[++countOtherGrain % divType.length];
        currentDiv = divType[++countCurrentGrain % divType.length];

        currentDiv.style.borderRadius = "1000px";
        notCurrentDiv.style.borderRadius = "25px";

        if (countCurrentGrain > 15) {
          countOtherGrain = -1; //for black tiles
          countCurrentGrain = 0;
        };

        //console.log(currentDiv);

        //return [notCurrentDiv, currentDiv];
      },
      snareCount: function(divType) {

        notCurrentDiv = divType[++countOtherSnare % divType.length];
        currentDiv = divType[++countCurrentSnare % divType.length];

        currentDiv.style.borderRadius = "1000px";
        notCurrentDiv.style.borderRadius = "25px";

        if (countCurrentSnare > 15) {
          countOtherSnare = -1; //for black tiles
          countCurrentSnare = 0;
        };
      },
      hihatCount: function(divType) {

        notCurrentDiv = divType[++countOtherHihat % divType.length];
        currentDiv = divType[++countCurrentHihat % divType.length];

        currentDiv.style.borderRadius = "1000px";
        notCurrentDiv.style.borderRadius = "25px";

        if (countCurrentHihat > 15) {
          countOtherHihat = -1; //for black tiles
          countCurrentHihat = 0;
        };
      }
    };
  }());


  startBtn.addEventListener('click', function(time) {
    audioContext.resume();
    scheduler();

  }, false);

  stopBtn.addEventListener('click', function() {

    clearTimeout(timerID);

  }, false);

};

//First commit from different macbook
