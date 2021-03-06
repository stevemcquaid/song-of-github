/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {// Expose base64 conversion functions globally using the `expose-loader` so they
	// can be accessed by the MIDI library.
	__webpack_require__(1);
	__webpack_require__(3);

	// Load MIDI as a script using `script-loader` because it must be executed in
	// the global context due to its `XMLHttpRequest` polyfill technique. The
	// `script!` may be removed once MIDI.js issue #110[1] is addressed.
	//
	// [1] https://github.com/mudcube/MIDI.js/issues/110
	var MIDI = __webpack_require__(5);

	var allWeeks = [];
	var names = global.names;

	// Returns contributions data parsed from a jQuery element containing `.day`
	// descendants with `data-date` and `data-count` attributes corresponding to a
	// user's contributions.
	//
	// Example return value:
	//
	//     [
	//       ["2014-09-01", 15],
	//       ["2014-09-02", 3],
	//       ...
	//     ]
	function parseSvgData($svgWrapper) {
	  return $.map($svgWrapper.find(".day"), function (dayEl) {
	    var $dayEl = $(dayEl);
	    return [[$dayEl.data("date"), $dayEl.data("count")]];
	  });
	}

	function organizeData(calendarData) {
	  var weeks = [],
	      column = [],
	      d = new Date(calendarData[0][0]),
	      dayOffset = d.getDay(),
	      contrib, i, j;

	  for(i = 0; i < calendarData.length; i++){
	    // offset by day of week; dates sent over don't necessarily start at monday
	    if(i == 0){
	      for(j = 0; j < dayOffset; j++){
	        column.push(0);
	        i++;
	      }
	    }

	    contrib = calendarData[i - dayOffset][1];
	    column.push(contrib);

	    // break on a new week
	    if(i > 0 && ((i+1) % 7 === 0)){
	      weeks.push(column);
	      column = [];
	    }
	  }

	  return weeks;
	}

	function updateTD(week, day, name){
	  $('#' + name + ' #visualize').find('tr:eq(' + day + ') > td:eq(' + week + ')').css({ opacity: 0.25 });
	}

	function loadVisualization(weeks, name){
	  var days = [
	    $('#' + name + ' #day0'),
	    $('#' + name + ' #day1'),
	    $('#' + name + ' #day2'),
	    $('#' + name + ' #day3'),
	    $('#' + name + ' #day4'),
	    $('#' + name + ' #day5'),
	    $('#' + name + ' #day6')
	  ],
	  n = 0,
	  m = 0,
	  contrib = 0;

	  for(n; n < weeks.length; n++){
	    for(m = 0; m < weeks[n].length; m++){

	      contrib = weeks[n][m];

	      if(contrib > 0){
	        if(contrib < 5){
	          contrib = 1;
	        }else if(contrib < 10){
	          contrib = 2;
	        }else if(contrib < 15){
	          contrib = 3;
	        }else {
	          contrib = 4;
	        }
	      }

	      days[m].append($('<td class="status' + contrib + '"></td>'));
	    }
	  }
	}

	var n = 0, i = 0, delay;

	function loadSong(weeks){
	  MIDI.loadPlugin({
	    soundfontUrl: "/js/soundfont/",
	    instrument: "acoustic_grand_piano",
	    callback: function() {
	      MIDI.programChange(0, 0);
	      MIDI.programChange(1, 118);

	      for(n; n < weeks[0].length; n++){
	        delay = n;
	        for (i in weeks) {
	          playWeek(weeks[i][n], n, names[i]);
	        }
	      }
	    }
	  });
	}

	var chords = {
	  I:   [48, 52, 55, 60, 64, 67, 72],
	  ii:  [50, 53, 57, 62, 65, 69, 74],
	  iii: [52, 55, 59, 64, 67, 71, 76],
	  IV:  [41, 45, 48, 53, 57, 60, 65],
	  V:   [43, 47, 50, 55, 59, 62, 67],
	  vi:  [45, 48, 52, 57, 60, 64, 69],
	  vii: [47, 50, 53, 59, 62, 65, 71]
	};

	var chordMap = ['I', 'ii', 'iii', 'IV', 'vi', 'vii'];

	function playWeek(week, n, name) {
	  var sum = week.reduce(function(t, n) { return t + n; }, 0);
	  var chord = getChord();
	  var arpeggio = week[0] > 0;
	  var noteDelay;

	  for(var m = 0; m < week.length; m++){
	    if(week[m] > 0){
	      MIDI.noteOn(0, getNote(), getVelocity(), getDelay());
	      if (m > 5) {
	        MIDI.noteOn(0, getNote(), getVelocity(), getDelay() * 0.5);
	      }
	    }

	    (function(n, m, name){
	      window.setTimeout(function(){
	        updateTD(n,m,name)
	      }, noteDelay * 1000)
	    }(n, m,name));
	  }

	  function getChord() {
	    var l = chordMap.length;
	    return chords[chordMap[(sum ^ l) % (l - 1)]];
	  }

	  function getNote() {
	    var note = chord[m];
	    return (sum % 14 == 0) && (m % 3 == 0) ? note + 1 : note;
	  }

	  function getVelocity() {
	    return 20 + (m * 4);
	  }

	  function getDelay() {
	    if (arpeggio) {
	      noteDelay = delay + (m / chordMap.length - 1);
	    } else {
	     noteDelay = delay;
	    }
	    return noteDelay;
	  }
	};

	function playSong() {
	  if (allWeeks.length > 0) {
	    loadSong(allWeeks);
	  }
	  return false;
	};

	function showVisualization() {
	  if (allWeeks.length === 0) {
	    names.forEach(function(name) {
	      var weeks = organizeData(parseSvgData($("#" + name + "-data")));
	      loadVisualization(weeks, name);
	      allWeeks.push(weeks)
	    });
	  }
	};

	function buildPlayButton() {
	 var playButton = jQuery('<button>&rtrif; Click to play</button>');

	  playButton.click(function(){
	    songOfGitHub.playSong();
	  });

	  playButton.insertAfter('#visualize');
	}

	function init(autoPlay) {
	  showVisualization();
	  if(autoPlay) {
	    playSong();
	  } else {
	    buildPlayButton();
	  }
	};

	global.songOfGitHub = {
	  init: init,
	  playSong: playSong
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["Base64Binary"] = __webpack_require__(2);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*
	Copyright (c) 2011, Daniel Guerrero
	All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:
	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.
	    * Neither the name of the Daniel Guerrero nor the
	      names of its contributors may be used to endorse or promote products
	      derived from this software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
	DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/
	 
	var Base64Binary = {
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		/* will return a  Uint8Array type */
		decodeArrayBuffer: function(input) {
			var bytes = Math.ceil( (3*input.length) / 4.0);
			var ab = new ArrayBuffer(bytes);
			this.decode(input, ab);

			return ab;
		},

		decode: function(input, arrayBuffer) {
			//get last chars to see if are valid
			var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));		 
			var lkey2 = this._keyStr.indexOf(input.charAt(input.length-1));		 

			var bytes = Math.ceil( (3*input.length) / 4.0);
			if (lkey1 == 64) bytes--; //padding chars, so skip
			if (lkey2 == 64) bytes--; //padding chars, so skip

			var uarray;
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
			var j = 0;

			if (arrayBuffer)
				uarray = new Uint8Array(arrayBuffer);
			else
				uarray = new Uint8Array(bytes);

			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			for (i=0; i<bytes; i+=3) {	
				//get the 3 octects in 4 ascii chars
				enc1 = this._keyStr.indexOf(input.charAt(j++));
				enc2 = this._keyStr.indexOf(input.charAt(j++));
				enc3 = this._keyStr.indexOf(input.charAt(j++));
				enc4 = this._keyStr.indexOf(input.charAt(j++));

				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;

				uarray[i] = chr1;			
				if (enc3 != 64) uarray[i+1] = chr2;
				if (enc4 != 64) uarray[i+2] = chr3;
			}

			return uarray;	
		}
	};

	/*** EXPORTS FROM exports-loader ***/
	module.exports = Base64Binary

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["atob&btoa"] = __webpack_require__(4);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// http://ntt.cc/2008/01/19/base64-encoder-decoder-with-javascript.html

	// window.atob and window.btoa

	(function (window) {

		var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		
		window.btoa || (window.btoa = function encode64(input) {
			input = escape(input);
			var output = "";
			var chr1, chr2, chr3 = "";
			var enc1, enc2, enc3, enc4 = "";
			var i = 0;
			do {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
				output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
				chr1 = chr2 = chr3 = "";
				enc1 = enc2 = enc3 = enc4 = "";
			} while (i < input.length);
			return output;
		});
		
		window.atob || (window.atob = function(input) {
			var output = "";
			var chr1, chr2, chr3 = "";
			var enc1, enc2, enc3, enc4 = "";
			var i = 0;
			// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
			var base64test = /[^A-Za-z0-9\+\/\=]/g;
			if (base64test.exec(input)) {
				alert("There were invalid base64 characters in the input text.\n" + "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" + "Expect errors in decoding.");
			}
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			do {
				enc1 = keyStr.indexOf(input.charAt(i++));
				enc2 = keyStr.indexOf(input.charAt(i++));
				enc3 = keyStr.indexOf(input.charAt(i++));
				enc4 = keyStr.indexOf(input.charAt(i++));
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
				output = output + String.fromCharCode(chr1);
				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
				chr1 = chr2 = chr3 = "";
				enc1 = enc2 = enc3 = enc4 = "";
			} while (i < input.length);
			return unescape(output);
		});

	}(this));

	/*** EXPORTS FROM exports-loader ***/
	exports["atob"] = (atob);
	exports["btoa"] = (btoa);

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6)(__webpack_require__(7))

	/*** EXPORTS FROM exports-loader ***/
	module.exports = MIDI

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	module.exports = function(src) {
		if (typeof execScript === "function")
			execScript(src);
		else
			eval.call(null, src);
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "if(MIDI===void 0)var MIDI={};if(function(){\"use strict\";var e={},t=0,n=function(n){t++;var r=new Audio,o=n.split(\";\")[0];r.id=\"audio\",r.setAttribute(\"preload\",\"auto\"),r.setAttribute(\"audiobuffer\",!0),r.addEventListener(\"error\",function(){e[o]=!1,t--},!1),r.addEventListener(\"canplaythrough\",function(){e[o]=!0,t--},!1),r.src=\"data:\"+n,document.body.appendChild(r)};MIDI.audioDetect=function(r){if(\"undefined\"==typeof Audio)return r({});var o=new Audio;if(o.canPlayType===void 0)return r(e);var i=o.canPlayType('audio/ogg; codecs=\"vorbis\"');i=\"probably\"===i||\"maybe\"===i;var a=o.canPlayType(\"audio/mpeg\");if(a=\"probably\"===a||\"maybe\"===a,!i&&!a)return r(e),void 0;i&&n(\"audio/ogg;base64,T2dnUwACAAAAAAAAAADqnjMlAAAAAOyyzPIBHgF2b3JiaXMAAAAAAUAfAABAHwAAQB8AAEAfAACZAU9nZ1MAAAAAAAAAAAAA6p4zJQEAAAANJGeqCj3//////////5ADdm9yYmlzLQAAAFhpcGguT3JnIGxpYlZvcmJpcyBJIDIwMTAxMTAxIChTY2hhdWZlbnVnZ2V0KQAAAAABBXZvcmJpcw9CQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBACAAAAYRqF1TCqDEEPKQ4QUY9AzoxBDDEzGHGNONKQMMogzxZAyiFssLqgQBKEhKwKAKAAAwBjEGGIMOeekZFIi55iUTkoDnaPUUcoolRRLjBmlEluJMYLOUeooZZRCjKXFjFKJscRUAABAgAMAQICFUGjIigAgCgCAMAYphZRCjCnmFHOIMeUcgwwxxiBkzinoGJNOSuWck85JiRhjzjEHlXNOSuekctBJyaQTAAAQ4AAAEGAhFBqyIgCIEwAwSJKmWZomipamiaJniqrqiaKqWp5nmp5pqqpnmqpqqqrrmqrqypbnmaZnmqrqmaaqiqbquqaquq6nqrZsuqoum65q267s+rZru77uqapsm6or66bqyrrqyrbuurbtS56nqqKquq5nqq6ruq5uq65r25pqyq6purJtuq4tu7Js664s67pmqq5suqotm64s667s2rYqy7ovuq5uq7Ks+6os+75s67ru2rrwi65r66os674qy74x27bwy7ouHJMnqqqnqq7rmarrqq5r26rr2rqmmq5suq4tm6or26os67Yry7aumaosm64r26bryrIqy77vyrJui67r66Ys67oqy8Lu6roxzLat+6Lr6roqy7qvyrKuu7ru+7JuC7umqrpuyrKvm7Ks+7auC8us27oxuq7vq7It/KosC7+u+8Iy6z5jdF1fV21ZGFbZ9n3d95Vj1nVhWW1b+V1bZ7y+bgy7bvzKrQvLstq2scy6rSyvrxvDLux8W/iVmqratum6um7Ksq/Lui60dd1XRtf1fdW2fV+VZd+3hV9pG8OwjK6r+6os68Jry8ov67qw7MIvLKttK7+r68ow27qw3L6wLL/uC8uq277v6rrStXVluX2fsSu38QsAABhwAAAIMKEMFBqyIgCIEwBAEHIOKQahYgpCCKGkEEIqFWNSMuakZM5JKaWUFEpJrWJMSuaclMwxKaGUlkopqYRSWiqlxBRKaS2l1mJKqcVQSmulpNZKSa2llGJMrcUYMSYlc05K5pyUklJrJZXWMucoZQ5K6iCklEoqraTUYuacpA46Kx2E1EoqMZWUYgupxFZKaq2kFGMrMdXUWo4hpRhLSrGVlFptMdXWWqs1YkxK5pyUzDkqJaXWSiqtZc5J6iC01DkoqaTUYiopxco5SR2ElDLIqJSUWiupxBJSia20FGMpqcXUYq4pxRZDSS2WlFosqcTWYoy1tVRTJ6XFklKMJZUYW6y5ttZqDKXEVkqLsaSUW2sx1xZjjqGkFksrsZWUWmy15dhayzW1VGNKrdYWY40x5ZRrrT2n1mJNMdXaWqy51ZZbzLXnTkprpZQWS0oxttZijTHmHEppraQUWykpxtZara3FXEMpsZXSWiypxNhirLXFVmNqrcYWW62ltVprrb3GVlsurdXcYqw9tZRrrLXmWFNtBQAADDgAAASYUAYKDVkJAEQBAADGMMYYhEYpx5yT0ijlnHNSKucghJBS5hyEEFLKnINQSkuZcxBKSSmUklJqrYVSUmqttQIAAAocAAACbNCUWByg0JCVAEAqAIDBcTRNFFXVdX1fsSxRVFXXlW3jVyxNFFVVdm1b+DVRVFXXtW3bFn5NFFVVdmXZtoWiqrqybduybgvDqKqua9uybeuorqvbuq3bui9UXVmWbVu3dR3XtnXd9nVd+Bmzbeu2buu+8CMMR9/4IeTj+3RCCAAAT3AAACqwYXWEk6KxwEJDVgIAGQAAgDFKGYUYM0gxphhjTDHGmAAAgAEHAIAAE8pAoSErAoAoAADAOeecc84555xzzjnnnHPOOeecc44xxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY0wAwE6EA8BOhIVQaMhKACAcAABACCEpKaWUUkoRU85BSSmllFKqFIOMSkoppZRSpBR1lFJKKaWUIqWgpJJSSimllElJKaWUUkoppYw6SimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaVUSimllFJKKaWUUkoppRQAYPLgAACVYOMMK0lnhaPBhYasBAByAwAAhRiDEEJpraRUUkolVc5BKCWUlEpKKZWUUqqYgxBKKqmlklJKKbXSQSihlFBKKSWUUkooJYQQSgmhlFRCK6mEUkoHoYQSQimhhFRKKSWUzkEoIYUOQkmllNRCSB10VFIpIZVSSiklpZQ6CKGUklJLLZVSWkqpdBJSKamV1FJqqbWSUgmhpFZKSSWl0lpJJbUSSkklpZRSSymFVFJJJYSSUioltZZaSqm11lJIqZWUUkqppdRSSiWlkEpKqZSSUmollZRSaiGVlEpJKaTUSimlpFRCSamlUlpKLbWUSkmptFRSSaWUlEpJKaVSSksppRJKSqmllFpJKYWSUkoplZJSSyW1VEoKJaWUUkmptJRSSymVklIBAEAHDgAAAUZUWoidZlx5BI4oZJiAAgAAQABAgAkgMEBQMApBgDACAQAAAADAAAAfAABHARAR0ZzBAUKCwgJDg8MDAAAAAAAAAAAAAACAT2dnUwAEAAAAAAAAAADqnjMlAgAAADzQPmcBAQA=\"),a&&n(\"audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\");var s=(new Date).getTime(),u=window.setInterval(function(){var n=(new Date).getTime(),o=n-s>5e3;(!t||o)&&(window.clearInterval(u),r(e))},1)}}(),MIDI===void 0)var MIDI={};if(MIDI.Soundfont===void 0&&(MIDI.Soundfont={}),function(){\"use strict\";var e=!1;MIDI.loadPlugin=function(r){\"function\"==typeof r&&(r={callback:r});var o=r.instruments||r.instrument||\"acoustic_grand_piano\";\"object\"!=typeof o&&(o=[o]);for(var i=0;o.length>i;i++){var a=o[i];\"number\"==typeof a&&(o[i]=MIDI.GeneralMIDI.byId[a])}MIDI.soundfontUrl=r.soundfontUrl||MIDI.soundfontUrl||\"./soundfont/\",MIDI.audioDetect(function(i){var a=\"\";if(a=n[r.api]?r.api:n[window.location.hash.substr(1)]?window.location.hash.substr(1):e&&navigator.requestMIDIAccess?\"webmidi\":window.webkitAudioContext||window.AudioContext?\"webaudio\":window.Audio?\"audiotag\":\"flash\",t[a]){if(r.targetFormat)var s=r.targetFormat;else var s=i[\"audio/ogg\"]?\"ogg\":\"mp3\";MIDI.lang=a,MIDI.supports=i,t[a](s,o,r)}})};var t={};t.webmidi=function(e,t,n){MIDI.loader&&MIDI.loader.message(\"Web MIDI API...\"),MIDI.WebMIDI.connect(n)},t.flash=function(e,t,n){MIDI.loader&&MIDI.loader.message(\"Flash API...\"),DOMLoader.script.add({src:n.soundManagerUrl||\"./inc/SoundManager2/script/soundmanager2.js\",verify:\"SoundManager\",callback:function(){MIDI.Flash.connect(t,n)}})},t.audiotag=function(e,t,n){MIDI.loader&&MIDI.loader.message(\"HTML5 Audio API...\");var a=i({items:t,getNext:function(t){DOMLoader.sendRequest({url:MIDI.soundfontUrl+t+\"-\"+e+\".js\",onprogress:o,onload:function(e){r(e.responseText),MIDI.loader&&MIDI.loader.update(null,\"Downloading\",100),a.getNext()}})},onComplete:function(){MIDI.AudioTag.connect(n)}})},t.webaudio=function(e,t,n){MIDI.loader&&MIDI.loader.message(\"Web Audio API...\");var a=i({items:t,getNext:function(t){DOMLoader.sendRequest({url:MIDI.soundfontUrl+t+\"-\"+e+\".js\",onprogress:o,onload:function(e){r(e.responseText),MIDI.loader&&MIDI.loader.update(null,\"Downloading...\",100),a.getNext()}})},onComplete:function(){MIDI.WebAudio.connect(n)}})};var n={webmidi:!0,webaudio:!0,audiotag:!0,flash:!0},r=function(e){var t=document.createElement(\"script\");t.language=\"javascript\",t.type=\"text/javascript\",t.text=e,document.body.appendChild(t)},o=function(e){this.totalSize||(this.totalSize=this.getResponseHeader(\"Content-Length-Raw\")?parseInt(this.getResponseHeader(\"Content-Length-Raw\")):e.total);var t=this.totalSize?Math.round(100*(e.loaded/this.totalSize)):\"\";MIDI.loader&&MIDI.loader.update(null,\"Downloading...\",t)},i=function(e){var t={};t.queue=[];for(var n in e.items)t.queue.push(e.items[n]);return t.getNext=function(){return t.queue.length?(e.getNext(t.queue.shift()),void 0):e.onComplete()},setTimeout(t.getNext,1),t}}(),MIDI===void 0)var MIDI={};if(function(){\"use strict\";var e=function(e){MIDI.api=e.api,MIDI.setVolume=e.setVolume,MIDI.programChange=e.programChange,MIDI.noteOn=e.noteOn,MIDI.noteOff=e.noteOff,MIDI.chordOn=e.chordOn,MIDI.chordOff=e.chordOff,MIDI.stopAllNotes=e.stopAllNotes,MIDI.getInput=e.getInput,MIDI.getOutputs=e.getOutputs};(function(){var t=null,n=null,r=MIDI.WebMIDI={api:\"webmidi\"};r.setVolume=function(e,t){n.send([176+e,7,t])},r.programChange=function(e,t){n.send([192+e,t])},r.noteOn=function(e,t,r,o){n.send([144+e,t,r],1e3*o)},r.noteOff=function(e,t,r){n.send([128+e,t,0],1e3*r)},r.chordOn=function(e,t,r,o){for(var i=0;t.length>i;i++){var a=t[i];n.send([144+e,a,r],1e3*o)}},r.chordOff=function(e,t,r){for(var o=0;t.length>o;o++){var i=t[o];n.send([128+e,i,0],1e3*r)}},r.stopAllNotes=function(){for(var e=0;16>e;e++)n.send([176+e,123,0])},r.getInput=function(){return t.getInputs()},r.getOutputs=function(){return t.getOutputs()},r.connect=function(o){e(r),navigator.requestMIDIAccess().then(function(e){t=e,n=t.outputs()[0],o.callback&&o.callback()},function(){o.api=window.AudioContext||window.webkitAudioContext?\"webaudio\":window.Audio?\"audiotag\":\"flash\",MIDI.loadPlugin(o)})}})(),(window.AudioContext||window.webkitAudioContext)&&function(){var t,n=window.AudioContext||window.webkitAudioContext,r=MIDI.WebAudio={api:\"webaudio\"},o={},i=127,a={},s=function(e,n,r,o,i){var s=MIDI.GeneralMIDI.byName[e],u=s.number,l=n[r];if(!MIDI.Soundfont[e][l])return i(e);var d=MIDI.Soundfont[e][l].split(\",\")[1],c=Base64Binary.decodeArrayBuffer(d);t.decodeAudioData(c,function(t){for(var d=l;3>d.length;)d+=\"&nbsp;\";if(MIDI.loader!==void 0&&MIDI.loader.update(null,s.instrument+\"<br>Processing: \"+(100*(r/87)>>0)+\"%<br>\"+d),t.id=l,o[r]=t,o.length===n.length){for(;o.length;)if(t=o.pop()){var c=MIDI.keyToNote[t.id];a[u+\"\"+c]=t}i(e)}})};r.setVolume=function(e,t){i=t},r.programChange=function(e,t){MIDI.channels[e].instrument=t},r.noteOn=function(e,n,r,s){if(MIDI.channels[e]){var u=MIDI.channels[e].instrument;if(a[u+\"\"+n]){t.currentTime>s&&(s+=t.currentTime);var l=t.createBufferSource();o[e+\"\"+n]=l,l.buffer=a[u+\"\"+n],l.connect(t.destination),l.gainNode=t.createGain?t.createGain():t.createGainNode();var d=2*r/127*(i/127)-1;return l.gainNode.connect(t.destination),l.gainNode.gain.value=Math.max(-1,d),l.connect(l.gainNode),l.noteOn?l.noteOn(s||0):l.start(s||0),l}}},r.noteOff=function(e,n,r){r=r||0,t.currentTime>r&&(r+=t.currentTime);var i=o[e+\"\"+n];if(i){if(i.gainNode){var a=i.gainNode.gain;a.linearRampToValueAtTime(a.value,r),a.linearRampToValueAtTime(-1,r+.2)}i.noteOff?i.noteOff(r+.3):i.stop(r+.3),delete o[e+\"\"+n]}},r.chordOn=function(e,t,n,o){for(var i,a={},s=0,u=t.length;u>s;s++)a[i=t[s]]=r.noteOn(e,i,n,o);return a},r.chordOff=function(e,t,n){for(var o,i={},a=0,s=t.length;s>a;a++)i[o=t[a]]=r.noteOff(e,o,n);return i},r.stopAllNotes=function(){for(var e in o){var n=0;t.currentTime>n&&(n+=t.currentTime),o[e].gain.linearRampToValueAtTime(1,n),o[e].gain.linearRampToValueAtTime(0,n+.2),o[e].noteOff(n+.3),delete o[e]}},r.connect=function(o){e(r),MIDI.Player.ctx=t=new n;var i=[],a=MIDI.keyToNote;for(var u in a)i.push(u);var l=[],d={},c=function(e){delete d[e];for(var t in d)break;t||o.callback()};for(var v in MIDI.Soundfont){d[v]=!0;for(var f=0;i.length>f;f++)s(v,i,f,l,c)}}}(),window.Audio&&function(){for(var t=MIDI.AudioTag={api:\"audiotag\"},n={},r=127,o=-1,i=[],a=[],s={},u=0;12>u;u++)i[u]=new Audio;var l=function(e,t){if(MIDI.channels[e]){var n=MIDI.channels[e].instrument,u=MIDI.GeneralMIDI.byId[n].id,t=s[t];if(t){var l=u+\"\"+t.id,d=(o+1)%i.length,c=i[d];a[d]=l,c.src=MIDI.Soundfont[u][t.id],c.volume=r/127,c.play(),o=d}}},d=function(e,t){if(MIDI.channels[e]){var n=MIDI.channels[e].instrument,r=MIDI.GeneralMIDI.byId[n].id,t=s[t];if(t)for(var u=r+\"\"+t.id,l=0;i.length>l;l++){var d=(l+o+1)%i.length,c=a[d];if(c&&c==u)return i[d].pause(),a[d]=null,void 0}}};t.programChange=function(e,t){MIDI.channels[e].instrument=t},t.setVolume=function(e,t){r=t},t.noteOn=function(e,t,r,o){var i=n[t];if(s[i])return o?window.setTimeout(function(){l(e,i)},1e3*o):(l(e,i),void 0)},t.noteOff=function(e,t,r){var o=n[t];if(s[o])return r?setTimeout(function(){d(e,o)},1e3*r):(d(e,o),void 0)},t.chordOn=function(e,t,r,o){for(var i=0;t.length>i;i++){var a=t[i],u=n[a];if(s[u]){if(o)return window.setTimeout(function(){l(e,u)},1e3*o);l(e,u)}}},t.chordOff=function(e,t,r){for(var o=0;t.length>o;o++){var i=t[o],a=n[i];if(s[a]){if(r)return window.setTimeout(function(){d(e,a)},1e3*r);d(e,a)}}},t.stopAllNotes=function(){for(var e=0,t=i.length;t>e;e++)i[e].pause()},t.connect=function(r){for(var o in MIDI.keyToNote)n[MIDI.keyToNote[o]]=o,s[o]={id:o};e(t),r.callback&&r.callback()}}(),function(){var t=MIDI.Flash={api:\"flash\"},n={},r={};t.programChange=function(e,t){MIDI.channels[e].instrument=t},t.setVolume=function(){},t.noteOn=function(e,t,o,i){if(MIDI.channels[e]){var a=MIDI.channels[e].instrument,s=MIDI.GeneralMIDI.byId[a].number;if(t=s+\"\"+n[t],r[t])return i?window.setTimeout(function(){r[t].play({volume:2*o})},1e3*i):(r[t].play({volume:2*o}),void 0)}},t.noteOff=function(){},t.chordOn=function(e,t,o){if(MIDI.channels[e]){var i=MIDI.channels[e].instrument,a=MIDI.GeneralMIDI.byId[i].number;for(var s in t){var u=t[s],l=a+\"\"+n[u];r[l]&&r[l].play({volume:2*o})}}},t.chordOff=function(){},t.stopAllNotes=function(){},t.connect=function(o,i){soundManager.flashVersion=9,soundManager.useHTML5Audio=!0,soundManager.url=i.soundManagerSwfUrl||\"../inc/SoundManager2/swf/\",soundManager.useHighPerformance=!0,soundManager.wmode=\"transparent\",soundManager.flashPollingInterval=1,soundManager.debugMode=!1,soundManager.onload=function(){for(var a=function(e,t,n){var o=MIDI.GeneralMIDI.byName[e],i=o.number;r[i+\"\"+t]=soundManager.createSound({id:t,url:MIDI.soundfontUrl+e+\"-mp3/\"+t+\".mp3\",multiShot:!0,autoLoad:!0,onload:n})},s=[],u=88,l=o.length*u,d=0;o.length>d;d++)for(var c=o[d],v=function(){s.push(this.sID),void 0!==MIDI.loader&&MIDI.loader.update(null,\"Processing: \"+this.sID)},f=0;u>f;f++){var p=n[f+21];a(c,p,v)}e(t);var g=window.setInterval(function(){l>s.length||(window.clearInterval(g),i.callback&&i.callback())},25)},soundManager.onerror=function(){};for(var a in MIDI.keyToNote)n[MIDI.keyToNote[a]]=a}}(),MIDI.GeneralMIDI=function(e){var t=function(e){return e.replace(/[^a-z0-9 ]/gi,\"\").replace(/[ ]/g,\"_\").toLowerCase()},n={byName:{},byId:{},byCategory:{}};for(var r in e)for(var o=e[r],i=0,a=o.length;a>i;i++){var s=o[i];if(s){var u=parseInt(s.substr(0,s.indexOf(\" \")),10);s=s.replace(u+\" \",\"\"),n.byId[--u]=n.byName[t(s)]=n.byCategory[t(r)]={id:t(s),instrument:s,number:u,category:r}}}return n}({Piano:[\"1 Acoustic Grand Piano\",\"2 Bright Acoustic Piano\",\"3 Electric Grand Piano\",\"4 Honky-tonk Piano\",\"5 Electric Piano 1\",\"6 Electric Piano 2\",\"7 Harpsichord\",\"8 Clavinet\"],\"Chromatic Percussion\":[\"9 Celesta\",\"10 Glockenspiel\",\"11 Music Box\",\"12 Vibraphone\",\"13 Marimba\",\"14 Xylophone\",\"15 Tubular Bells\",\"16 Dulcimer\"],Organ:[\"17 Drawbar Organ\",\"18 Percussive Organ\",\"19 Rock Organ\",\"20 Church Organ\",\"21 Reed Organ\",\"22 Accordion\",\"23 Harmonica\",\"24 Tango Accordion\"],Guitar:[\"25 Acoustic Guitar (nylon)\",\"26 Acoustic Guitar (steel)\",\"27 Electric Guitar (jazz)\",\"28 Electric Guitar (clean)\",\"29 Electric Guitar (muted)\",\"30 Overdriven Guitar\",\"31 Distortion Guitar\",\"32 Guitar Harmonics\"],Bass:[\"33 Acoustic Bass\",\"34 Electric Bass (finger)\",\"35 Electric Bass (pick)\",\"36 Fretless Bass\",\"37 Slap Bass 1\",\"38 Slap Bass 2\",\"39 Synth Bass 1\",\"40 Synth Bass 2\"],Strings:[\"41 Violin\",\"42 Viola\",\"43 Cello\",\"44 Contrabass\",\"45 Tremolo Strings\",\"46 Pizzicato Strings\",\"47 Orchestral Harp\",\"48 Timpani\"],Ensemble:[\"49 String Ensemble 1\",\"50 String Ensemble 2\",\"51 Synth Strings 1\",\"52 Synth Strings 2\",\"53 Choir Aahs\",\"54 Voice Oohs\",\"55 Synth Choir\",\"56 Orchestra Hit\"],Brass:[\"57 Trumpet\",\"58 Trombone\",\"59 Tuba\",\"60 Muted Trumpet\",\"61 French Horn\",\"62 Brass Section\",\"63 Synth Brass 1\",\"64 Synth Brass 2\"],Reed:[\"65 Soprano Sax\",\"66 Alto Sax\",\"67 Tenor Sax\",\"68 Baritone Sax\",\"69 Oboe\",\"70 English Horn\",\"71 Bassoon\",\"72 Clarinet\"],Pipe:[\"73 Piccolo\",\"74 Flute\",\"75 Recorder\",\"76 Pan Flute\",\"77 Blown Bottle\",\"78 Shakuhachi\",\"79 Whistle\",\"80 Ocarina\"],\"Synth Lead\":[\"81 Lead 1 (square)\",\"82 Lead 2 (sawtooth)\",\"83 Lead 3 (calliope)\",\"84 Lead 4 (chiff)\",\"85 Lead 5 (charang)\",\"86 Lead 6 (voice)\",\"87 Lead 7 (fifths)\",\"88 Lead 8 (bass + lead)\"],\"Synth Pad\":[\"89 Pad 1 (new age)\",\"90 Pad 2 (warm)\",\"91 Pad 3 (polysynth)\",\"92 Pad 4 (choir)\",\"93 Pad 5 (bowed)\",\"94 Pad 6 (metallic)\",\"95 Pad 7 (halo)\",\"96 Pad 8 (sweep)\"],\"Synth Effects\":[\"97 FX 1 (rain)\",\"98 FX 2 (soundtrack)\",\"99 FX 3 (crystal)\",\"100 FX 4 (atmosphere)\",\"101 FX 5 (brightness)\",\"102 FX 6 (goblins)\",\"103 FX 7 (echoes)\",\"104 FX 8 (sci-fi)\"],Ethnic:[\"105 Sitar\",\"106 Banjo\",\"107 Shamisen\",\"108 Koto\",\"109 Kalimba\",\"110 Bagpipe\",\"111 Fiddle\",\"112 Shanai\"],Percussive:[\"113 Tinkle Bell\",\"114 Agogo\",\"115 Steel Drums\",\"116 Woodblock\",\"117 Taiko Drum\",\"118 Melodic Tom\",\"119 Synth Drum\"],\"Sound effects\":[\"120 Reverse Cymbal\",\"121 Guitar Fret Noise\",\"122 Breath Noise\",\"123 Seashore\",\"124 Bird Tweet\",\"125 Telephone Ring\",\"126 Helicopter\",\"127 Applause\",\"128 Gunshot\"]}),MIDI.channels=function(){for(var e={},t=0;16>t;t++)e[t]={instrument:0,mute:!1,mono:!1,omni:!1,solo:!1};return e}(),MIDI.pianoKeyOffset=21,MIDI.keyToNote={},MIDI.noteToKey={},function(){for(var e=21,t=108,n=[\"C\",\"Db\",\"D\",\"Eb\",\"E\",\"F\",\"Gb\",\"G\",\"Ab\",\"A\",\"Bb\",\"B\"],r=e;t>=r;r++){var o=(r-12)/12>>0,i=n[r%12]+o;MIDI.keyToNote[i]=r,MIDI.noteToKey[r]=i}}()}(),MIDI===void 0)var MIDI={};if(MIDI.Player===void 0&&(MIDI.Player={}),function(){\"use strict\";var e=MIDI.Player;e.callback=void 0,e.currentTime=0,e.endTime=0,e.restart=0,e.playing=!1,e.timeWarp=1,e.start=e.resume=function(){-1>e.currentTime&&(e.currentTime=-1),l(e.currentTime)},e.pause=function(){var t=e.restart;d(),e.restart=t},e.stop=function(){d(),e.restart=0,e.currentTime=0},e.addListener=function(e){i=e},e.removeListener=function(){i=void 0},e.clearAnimation=function(){e.interval&&window.clearInterval(e.interval)},e.setAnimation=function(t){var n=\"function\"==typeof t?t:t.callback,r=t.interval||30,i=0,a=0,s=0;e.clearAnimation(),e.interval=window.setInterval(function(){if(0!==e.endTime){e.playing?(i=s===e.currentTime?a-(new Date).getTime():0,i=0===e.currentTime?0:e.currentTime-i,s!==e.currentTime&&(a=(new Date).getTime(),s=e.currentTime)):i=e.currentTime;var t=e.endTime,r=i/1e3,u=r/60,l=r-60*u,d=60*u+l,c=t/1e3;-1>c-d||n({now:d,end:c,events:o})}},r)},e.loadMidiFile=function(){e.replayer=new Replayer(MidiFile(e.currentData),e.timeWarp),e.data=e.replayer.getData(),e.endTime=u()},e.loadFile=function(t,n){if(e.stop(),-1!==t.indexOf(\"base64,\")){var r=window.atob(t.split(\",\")[1]);return e.currentData=r,e.loadMidiFile(),n&&n(r),void 0}var o=new XMLHttpRequest;o.open(\"GET\",t),o.overrideMimeType(\"text/plain; charset=x-user-defined\"),o.onreadystatechange=function(){if(4===this.readyState&&200===this.status){for(var t=this.responseText||\"\",r=[],o=t.length,i=String.fromCharCode,a=0;o>a;a++)r[a]=i(255&t.charCodeAt(a));var s=r.join(\"\");e.currentData=s,e.loadMidiFile(),n&&n(s)}},o.send()};var t,n=[],r=0,o={},i=void 0,a=function(n,r,a,s,u,d){var c=window.setTimeout(function(){var s={channel:n,note:r,now:a,end:e.endTime,message:u,velocity:d};128===u?delete o[r]:o[r]=s,i&&i(s),e.currentTime=a,e.currentTime===t&&e.endTime>t&&l(t,!0)},a-s);return c},s=function(){return\"WebAudioAPI\"===MIDI.lang?MIDI.Player.ctx:(e.ctx||(e.ctx={currentTime:0}),e.ctx)},u=function(){for(var t=e.data,n=t.length,r=.5,o=0;n>o;o++)r+=t[o][1];return r},l=function(o,i){if(e.replayer){i||(o===void 0&&(o=e.restart),e.playing&&d(),e.playing=!0,e.data=e.replayer.getData(),e.endTime=u());var l,c=0,v=0,f=e.data,p=s(),g=f.length;t=.5,r=p.currentTime;for(var m=0;g>m&&100>v;m++)if(t+=f[m][1],o>t)c=t;else{o=t-c;var h=f[m][0].event;if(\"channel\"===h.type){var y=h.channel;switch(h.subtype){case\"noteOn\":if(MIDI.channels[y].mute)break;l=h.noteNumber-(e.MIDIOffset||0),n.push({event:h,source:MIDI.noteOn(y,h.noteNumber,h.velocity,o/1e3+p.currentTime),interval:a(y,l,t,c,144,h.velocity)}),v++;break;case\"noteOff\":if(MIDI.channels[y].mute)break;l=h.noteNumber-(e.MIDIOffset||0),n.push({event:h,source:MIDI.noteOff(y,h.noteNumber,o/1e3+p.currentTime),interval:a(y,l,t,c,128)});break;default:}}}}},d=function(){var t=s();for(e.playing=!1,e.restart+=1e3*(t.currentTime-r);n.length;){var a=n.pop();window.clearInterval(a.interval),a.source&&(\"number\"==typeof a.source?window.clearTimeout(a.source):a.source.disconnect(0))}for(var u in o){var a=o[u];144===o[u].message&&i&&i({channel:a.channel,note:a.note,now:a.now,end:a.end,message:128,velocity:a.velocity})}o={}}}(),DOMLoader===void 0)var DOMLoader={};if(XMLHttpRequest===void 0){var XMLHttpRequest;(function(){for(var e=[function(){return new ActiveXObject(\"Msxml2.XMLHTTP\")},function(){return new ActiveXObject(\"Msxml3.XMLHTTP\")},function(){return new ActiveXObject(\"Microsoft.XMLHTTP\")}],t=0;e.length>t;t++){try{e[t]()}catch(n){continue}break}XMLHttpRequest=e[t]})()}if((new XMLHttpRequest).responseText===void 0){var IEBinaryToArray_ByteStr_Script=\"<!-- IEBinaryToArray_ByteStr -->\\r\\n<script type='text/vbscript'>\\r\\nFunction IEBinaryToArray_ByteStr(Binary)\\r\\n   IEBinaryToArray_ByteStr = CStr(Binary)\\r\\nEnd Function\\r\\nFunction IEBinaryToArray_ByteStr_Last(Binary)\\r\\n   Dim lastIndex\\r\\n   lastIndex = LenB(Binary)\\r\\n   if lastIndex mod 2 Then\\r\\n       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\\r\\n   Else\\r\\n       IEBinaryToArray_ByteStr_Last = \\\"\\\"\\r\\n   End If\\r\\nEnd Function\\r\\n</script>\\r\\n\";document.write(IEBinaryToArray_ByteStr_Script),DOMLoader.sendRequest=function(e){function t(e){for(var t={},n=0;256>n;n++)for(var r=0;256>r;r++)t[String.fromCharCode(n+256*r)]=String.fromCharCode(n)+String.fromCharCode(r);var o=IEBinaryToArray_ByteStr(e),i=IEBinaryToArray_ByteStr_Last(e);return o.replace(/[\\s\\S]/g,function(e){return t[e]})+i}var n=XMLHttpRequest();return n.open(\"GET\",e.url,!0),e.responseType&&(n.responseType=e.responseType),e.onerror&&(n.onerror=e.onerror),e.onprogress&&(n.onprogress=e.onprogress),n.onreadystatechange=function(){4===n.readyState&&(200===n.status?n.responseText=t(n.responseBody):n=!1,e.onload&&e.onload(n))},n.setRequestHeader(\"Accept-Charset\",\"x-user-defined\"),n.send(null),n}}else DOMLoader.sendRequest=function(e){var t=new XMLHttpRequest;return t.open(e.data?\"POST\":\"GET\",e.url,!0),t.overrideMimeType&&t.overrideMimeType(\"text/plain; charset=x-user-defined\"),e.data&&t.setRequestHeader(\"Content-type\",\"application/x-www-form-urlencoded\"),e.responseType&&(t.responseType=e.responseType),e.onerror&&(t.onerror=e.onerror),e.onprogress&&(t.onprogress=e.onprogress),t.onreadystatechange=function(n){if(4===t.readyState){if(200!==t.status&&304!=t.status)return e.onerror&&e.onerror(n,!1),void 0;e.onload&&e.onload(t)}},t.send(e.data),t};if(Color===void 0)var Color={};if(Color.Space===void 0&&(Color.Space={}),function(){\"use strict\";var useEval=!1,functions={},shortcuts={\"HEX24>HSL\":\"HEX24>RGB>HSL\",\"HEX32>HSLA\":\"HEX32>RGBA>HSLA\",\"HEX24>CMYK\":\"HEX24>RGB>CMY>CMYK\",\"RGB>CMYK\":\"RGB>CMY>CMYK\"},root=Color.Space=function(color,route){shortcuts[route]&&(route=shortcuts[route]);var r=route.split(\">\");if(\"object\"==typeof color&&color[0]>=0){for(var type=r[0],tmp={},i=0;type.length>i;i++){var str=type.substr(i,1);tmp[str]=color[i]}color=tmp}if(functions[route])return functions[route](color);for(var f=\"color\",pos=1,key=r[0];r.length>pos;pos++)pos>1&&(key=key.substr(key.indexOf(\"_\")+1)),key+=(0===pos?\"\":\"_\")+r[pos],color=root[key](color),useEval&&(f=\"Color.Space.\"+key+\"(\"+f+\")\");return useEval&&(functions[route]=eval(\"(function(color) { return \"+f+\" })\")),color};root.RGB_W3=function(e){return\"rgb(\"+(e.R>>0)+\",\"+(e.G>>0)+\",\"+(e.B>>0)+\")\"},root.RGBA_W3=function(e){var t=\"number\"==typeof e.A?e.A/255:1;return\"rgba(\"+(e.R>>0)+\",\"+(e.G>>0)+\",\"+(e.B>>0)+\",\"+t+\")\"},root.W3_RGB=function(e){var e=e.substr(4,e.length-5).split(\",\");return{R:parseInt(e[0]),G:parseInt(e[1]),B:parseInt(e[2])}},root.W3_RGBA=function(e){var e=e.substr(5,e.length-6).split(\",\");return{R:parseInt(e[0]),G:parseInt(e[1]),B:parseInt(e[2]),A:255*parseFloat(e[3])}},root.HSL_W3=function(e){return\"hsl(\"+(e.H+.5>>0)+\",\"+(e.S+.5>>0)+\"%,\"+(e.L+.5>>0)+\"%)\"},root.HSLA_W3=function(e){var t=\"number\"==typeof e.A?e.A/255:1;return\"hsla(\"+(e.H+.5>>0)+\",\"+(e.S+.5>>0)+\"%,\"+(e.L+.5>>0)+\"%,\"+t+\")\"},root.W3_HSL=function(e){var e=e.substr(4,e.length-5).split(\",\");return{H:parseInt(e[0]),S:parseInt(e[1]),L:parseInt(e[2])}},root.W3_HSLA=function(e){var e=e.substr(5,e.length-6).split(\",\");return{H:parseInt(e[0]),S:parseInt(e[1]),L:parseInt(e[2]),A:255*parseFloat(e[3])}},root.W3_HEX=root.W3_HEX24=function(e){return\"#\"===e.substr(0,1)&&(e=e.substr(1)),3===e.length&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]),parseInt(\"0x\"+e)},root.W3_HEX32=function(e){return\"#\"===e.substr(0,1)&&(e=e.substr(1)),6===e.length?parseInt(\"0xFF\"+e):parseInt(\"0x\"+e)},root.HEX_W3=root.HEX24_W3=function(e,t){t||(t=6),e||(e=0);for(var n=e.toString(16),r=n.length;t>r;)n=\"0\"+n,r++;for(var r=n.length;r>t;)n=n.substr(1),r--;return\"#\"+n},root.HEX32_W3=function(e){return root.HEX_W3(e,8)},root.HEX_RGB=root.HEX24_RGB=function(e){return{R:e>>16,G:255&e>>8,B:255&e}},root.HEX32_RGBA=function(e){return{R:255&e>>>16,G:255&e>>>8,B:255&e,A:e>>>24}},root.RGBA_HEX32=function(e){return(e.A<<24|e.R<<16|e.G<<8|e.B)>>>0},root.RGB_HEX24=root.RGB_HEX=function(e){return 0>e.R&&(e.R=0),0>e.G&&(e.G=0),0>e.B&&(e.B=0),e.R>255&&(e.R=255),e.G>255&&(e.G=255),e.B>255&&(e.B=255),e.R<<16|e.G<<8|e.B},root.RGB_CMY=function(e){return{C:1-e.R/255,M:1-e.G/255,Y:1-e.B/255}},root.RGBA_HSLA=root.RGB_HSL=function(e){var t,n,r=e.R/255,o=e.G/255,i=e.B/255,a=Math.min(r,o,i),s=Math.max(r,o,i),u=s-a,l=(s+a)/2;if(0===u)t=0,n=0;else{n=.5>l?u/(s+a):u/(2-s-a);var d=((s-r)/6+u/2)/u,c=((s-o)/6+u/2)/u,v=((s-i)/6+u/2)/u;r===s?t=v-c:o===s?t=1/3+d-v:i===s&&(t=2/3+c-d),0>t&&(t+=1),t>1&&(t-=1)}return{H:360*t,S:100*n,L:100*l,A:e.A}},root.RGBA_HSVA=root.RGB_HSV=function(e){var t,n,r=e.R/255,o=e.G/255,i=e.B/255,a=Math.min(r,o,i),s=Math.max(r,o,i),u=s-a,l=s;if(0===u)t=0,n=0;else{n=u/s;var d=((s-r)/6+u/2)/u,c=((s-o)/6+u/2)/u,v=((s-i)/6+u/2)/u;r===s?t=v-c:o===s?t=1/3+d-v:i===s&&(t=2/3+c-d),0>t&&(t+=1),t>1&&(t-=1)}return{H:360*t,S:100*n,V:100*l,A:e.A}},root.CMY_RGB=function(e){return{R:Math.max(0,255*(1-e.C)),G:Math.max(0,255*(1-e.M)),B:Math.max(0,255*(1-e.Y))}},root.CMY_CMYK=function(e){var t=e.C,n=e.M,r=e.Y,o=Math.min(r,Math.min(n,Math.min(t,1)));return t=Math.round(100*((t-o)/(1-o))),n=Math.round(100*((n-o)/(1-o))),r=Math.round(100*((r-o)/(1-o))),o=Math.round(100*o),{C:t,M:n,Y:r,K:o}},root.CMYK_CMY=function(e){return{C:e.C*(1-e.K)+e.K,M:e.M*(1-e.K)+e.K,Y:e.Y*(1-e.K)+e.K}},root.HSLA_RGBA=root.HSL_RGB=function(e){var t,n,r,o,i,a,s=e.H/360,u=e.S/100,l=e.L/100;return 0===u?t=n=r=l:(i=.5>l?l*(1+u):l+u-u*l,o=2*l-i,a=s+1/3,0>a&&(a+=1),a>1&&(a-=1),t=1>6*a?o+6*(i-o)*a:1>2*a?i:2>3*a?o+6*(i-o)*(2/3-a):o,a=s,0>a&&(a+=1),a>1&&(a-=1),n=1>6*a?o+6*(i-o)*a:1>2*a?i:2>3*a?o+6*(i-o)*(2/3-a):o,a=s-1/3,0>a&&(a+=1),a>1&&(a-=1),r=1>6*a?o+6*(i-o)*a:1>2*a?i:2>3*a?o+6*(i-o)*(2/3-a):o),{R:255*t,G:255*n,B:255*r,A:e.A}},root.HSVA_RGBA=root.HSV_RGB=function(e){var t,n,r,o,i,a,s=e.H/360,u=e.S/100,l=e.V/100;if(0===u)t=n=r=Math.round(255*l);else switch(s>=1&&(s=0),s=6*s,o=s-Math.floor(s),i=Math.round(255*l*(1-u)),r=Math.round(255*l*(1-u*o)),a=Math.round(255*l*(1-u*(1-o))),l=Math.round(255*l),Math.floor(s)){case 0:t=l,n=a,r=i;break;case 1:t=r,n=l,r=i;break;case 2:t=i,n=l,r=a;break;case 3:t=i,n=r,r=l;break;case 4:t=a,n=i,r=l;break;case 5:t=l,n=i,r=r}return{R:t,G:n,B:r,A:e.A}}}(),MusicTheory===void 0)var MusicTheory={};if(MusicTheory.Synesthesia===void 0&&(MusicTheory.Synesthesia={}),function(e){e.data={\"Isaac Newton (1704)\":{format:\"HSL\",ref:\"Gerstner, p.167\",english:[\"red\",null,\"orange\",null,\"yellow\",\"green\",null,\"blue\",null,\"indigo\",null,\"violet\"],0:[0,96,51],1:[0,0,0],2:[29,94,52],3:[0,0,0],4:[60,90,60],5:[135,76,32],6:[0,0,0],7:[248,82,28],8:[0,0,0],9:[302,88,26],10:[0,0,0],11:[325,84,46]},\"Louis Bertrand Castel (1734)\":{format:\"HSL\",ref:\"Peacock, p.400\",english:[\"blue\",\"blue-green\",\"green\",\"olive green\",\"yellow\",\"yellow-orange\",\"orange\",\"red\",\"crimson\",\"violet\",\"agate\",\"indigo\"],0:[248,82,28],1:[172,68,34],2:[135,76,32],3:[79,59,36],4:[60,90,60],5:[49,90,60],6:[29,94,52],7:[360,96,51],8:[1,89,33],9:[325,84,46],10:[273,80,27],11:[302,88,26]},\"George Field (1816)\":{format:\"HSL\",ref:\"Klein, p.69\",english:[\"blue\",null,\"purple\",null,\"red\",\"orange\",null,\"yellow\",null,\"yellow green\",null,\"green\"],0:[248,82,28],1:[0,0,0],2:[302,88,26],3:[0,0,0],4:[360,96,51],5:[29,94,52],6:[0,0,0],7:[60,90,60],8:[0,0,0],9:[79,59,36],10:[0,0,0],11:[135,76,32]},\"D. D. Jameson (1844)\":{format:\"HSL\",ref:\"Jameson, p.12\",english:[\"red\",\"red-orange\",\"orange\",\"orange-yellow\",\"yellow\",\"green\",\"green-blue\",\"blue\",\"blue-purple\",\"purple\",\"purple-violet\",\"violet\"],0:[360,96,51],1:[14,91,51],2:[29,94,52],3:[49,90,60],4:[60,90,60],5:[135,76,32],6:[172,68,34],7:[248,82,28],8:[273,80,27],9:[302,88,26],10:[313,78,37],11:[325,84,46]},\"Theodor Seemann (1881)\":{format:\"HSL\",ref:\"Klein, p.86\",english:[\"carmine\",\"scarlet\",\"orange\",\"yellow-orange\",\"yellow\",\"green\",\"green blue\",\"blue\",\"indigo\",\"violet\",\"brown\",\"black\"],0:[0,58,26],1:[360,96,51],2:[29,94,52],3:[49,90,60],4:[60,90,60],5:[135,76,32],6:[172,68,34],7:[248,82,28],8:[302,88,26],9:[325,84,46],10:[0,58,26],11:[0,0,3]},\"A. Wallace Rimington (1893)\":{format:\"HSL\",ref:\"Peacock, p.402\",english:[\"deep red\",\"crimson\",\"orange-crimson\",\"orange\",\"yellow\",\"yellow-green\",\"green\",\"blueish green\",\"blue-green\",\"indigo\",\"deep blue\",\"violet\"],0:[360,96,51],1:[1,89,33],2:[14,91,51],3:[29,94,52],4:[60,90,60],5:[79,59,36],6:[135,76,32],7:[163,62,40],8:[172,68,34],9:[302,88,26],10:[248,82,28],11:[325,84,46]},\"Bainbridge Bishop (1893)\":{format:\"HSL\",ref:\"Bishop, p.11\",english:[\"red\",\"orange-red or scarlet\",\"orange\",\"gold or yellow-orange\",\"yellow or green-gold\",\"yellow-green\",\"green\",\"greenish-blue or aquamarine\",\"blue\",\"indigo or violet-blue\",\"violet\",\"violet-red\",\"red\"],0:[360,96,51],1:[1,89,33],2:[29,94,52],3:[50,93,52],4:[60,90,60],5:[73,73,55],6:[135,76,32],7:[163,62,40],8:[302,88,26],9:[325,84,46],10:[343,79,47],11:[360,96,51]},\"H. von Helmholtz (1910)\":{format:\"HSL\",ref:\"Helmholtz, p.22\",english:[\"yellow\",\"green\",\"greenish blue\",\"cayan-blue\",\"indigo blue\",\"violet\",\"end of red\",\"red\",\"red\",\"red\",\"red orange\",\"orange\"],0:[60,90,60],1:[135,76,32],2:[172,68,34],3:[211,70,37],4:[302,88,26],5:[325,84,46],6:[330,84,34],7:[360,96,51],8:[10,91,43],9:[10,91,43],10:[8,93,51],11:[28,89,50]},\"Alexander Scriabin (1911)\":{format:\"HSL\",ref:\"Jones, p.104\",english:[\"red\",\"violet\",\"yellow\",\"steely with the glint of metal\",\"pearly blue the shimmer of moonshine\",\"dark red\",\"bright blue\",\"rosy orange\",\"purple\",\"green\",\"steely with a glint of metal\",\"pearly blue the shimmer of moonshine\"],0:[360,96,51],1:[325,84,46],2:[60,90,60],3:[245,21,43],4:[211,70,37],5:[1,89,33],6:[248,82,28],7:[29,94,52],8:[302,88,26],9:[135,76,32],10:[245,21,43],11:[211,70,37]},\"Adrian Bernard Klein (1930)\":{format:\"HSL\",ref:\"Klein, p.209\",english:[\"dark red\",\"red\",\"red orange\",\"orange\",\"yellow\",\"yellow green\",\"green\",\"blue-green\",\"blue\",\"blue violet\",\"violet\",\"dark violet\"],0:[0,91,40],1:[360,96,51],2:[14,91,51],3:[29,94,52],4:[60,90,60],5:[73,73,55],6:[135,76,32],7:[172,68,34],8:[248,82,28],9:[292,70,31],10:[325,84,46],11:[330,84,34]},\"August Aeppli (1940)\":{format:\"HSL\",ref:\"Gerstner, p.169\",english:[\"red\",null,\"orange\",null,\"yellow\",null,\"green\",\"blue-green\",null,\"ultramarine blue\",\"violet\",\"purple\"],0:[0,96,51],1:[0,0,0],2:[29,94,52],3:[0,0,0],4:[60,90,60],5:[0,0,0],6:[135,76,32],7:[172,68,34],8:[0,0,0],9:[211,70,37],10:[273,80,27],11:[302,88,26]},\"I. J. Belmont (1944)\":{ref:\"Belmont, p.226\",english:[\"red\",\"red-orange\",\"orange\",\"yellow-orange\",\"yellow\",\"yellow-green\",\"green\",\"blue-green\",\"blue\",\"blue-violet\",\"violet\",\"red-violet\"],0:[360,96,51],1:[14,91,51],2:[29,94,52],3:[50,93,52],4:[60,90,60],5:[73,73,55],6:[135,76,32],7:[172,68,34],8:[248,82,28],9:[313,78,37],10:[325,84,46],11:[338,85,37]},\"Steve Zieverink (2004)\":{format:\"HSL\",ref:\"Cincinnati Contemporary Art Center\",english:[\"yellow-green\",\"green\",\"blue-green\",\"blue\",\"indigo\",\"violet\",\"ultra violet\",\"infra red\",\"red\",\"orange\",\"yellow-white\",\"yellow\"],0:[73,73,55],1:[135,76,32],2:[172,68,34],3:[248,82,28],4:[302,88,26],5:[325,84,46],6:[326,79,24],7:[1,89,33],8:[360,96,51],9:[29,94,52],10:[62,78,74],11:[60,90,60]},\"Circle of Fifths (Johnston 2003)\":{format:\"RGB\",ref:\"Joseph Johnston\",english:[\"yellow\",\"blue\",\"orange\",\"teal\",\"red\",\"green\",\"purple\",\"light orange\",\"light blue\",\"dark orange\",\"dark green\",\"violet\"],0:[255,255,0],1:[50,0,255],2:[255,150,0],3:[0,210,180],4:[255,0,0],5:[130,255,0],6:[150,0,200],7:[255,195,0],8:[30,130,255],9:[255,100,0],10:[0,200,0],11:[225,0,225]},\"Circle of Fifths (Wheatman 2002)\":{format:\"HEX\",ref:\"Stuart Wheatman\",english:[],data:[\"#122400\",\"#2E002E\",\"#002914\",\"#470000\",\"#002142\",\"#2E2E00\",\"#290052\",\"#003D00\",\"#520029\",\"#003D3D\",\"#522900\",\"#000080\",\"#244700\",\"#570057\",\"#004D26\",\"#7A0000\",\"#003B75\",\"#4C4D00\",\"#47008F\",\"#006100\",\"#850042\",\"#005C5C\",\"#804000\",\"#0000C7\",\"#366B00\",\"#80007F\",\"#00753B\",\"#B80000\",\"#0057AD\",\"#6B6B00\",\"#6600CC\",\"#008A00\",\"#B8005C\",\"#007F80\",\"#B35900\",\"#2424FF\",\"#478F00\",\"#AD00AD\",\"#00994D\",\"#F00000\",\"#0073E6\",\"#8F8F00\",\"#8A14FF\",\"#00AD00\",\"#EB0075\",\"#00A3A3\",\"#E07000\",\"#6B6BFF\",\"#5CB800\",\"#DB00DB\",\"#00C261\",\"#FF5757\",\"#3399FF\",\"#ADAD00\",\"#B56BFF\",\"#00D600\",\"#FF57AB\",\"#00C7C7\",\"#FF9124\",\"#9999FF\",\"#6EDB00\",\"#FF29FF\",\"#00E070\",\"#FF9999\",\"#7ABDFF\",\"#D1D100\",\"#D1A3FF\",\"#00FA00\",\"#FFA3D1\",\"#00E5E6\",\"#FFC285\",\"#C2C2FF\",\"#80FF00\",\"#FFA8FF\",\"#00E070\",\"#FFCCCC\",\"#C2E0FF\",\"#F0F000\",\"#EBD6FF\",\"#ADFFAD\",\"#FFD6EB\",\"#8AFFFF\",\"#FFEBD6\",\"#EBEBFF\",\"#E0FFC2\",\"#FFEBFF\",\"#E5FFF2\",\"#FFF5F5\"]}},e.map=function(t){for(var n={},r=function(e,t){return[.5*e[0]+.5*t[0]+.5>>0,.5*e[1]+.5*t[1]+.5>>0,.5*e[2]+.5*t[2]+.5>>0]\n},o=e.data,i=o[t]||o[\"D. D. Jameson (1844)\"],a=0;88>=a;a++)if(i.data)n[a]={hsl:i.data[a],hex:i.data[a]};else{var s=i[(a+9)%12],u=\"RGB\"===i.format;u&&(s=Color.Space(s,\"RGB>HSL\"));var l=Math.round(u?s.H:s[0]),d=Math.round(u?s.S:s[1]),c=Math.round(u?s.L:s[2]);l==d&&d==c&&(s=r(v,i[(a+10)%12])),n[a]={hsl:\"hsla(\"+l+\",\"+d+\"%,\"+c+\"%, 1)\",hex:Color.Space({H:l,S:d,L:c},\"HSL>RGB>HEX>W3\")};var v=s}return n}}(MusicTheory.Synesthesia),widgets===void 0)var widgets={};if(function(){\"use strict\";var e=Math.PI,t=!document.createElement(\"canvas\").getContext,n=400,r={id:\"loader\",bars:12,radius:0,lineWidth:20,lineHeight:70,timeout:0,display:!0};widgets.Loader=function(a){if(!t){var s=this;if(\"string\"==typeof a&&(a={message:a}),\"boolean\"==typeof a&&(a={display:!1}),a===void 0&&(a={}),a.container=a.container||document.body,a.container){for(var u in r)a[u]===void 0&&(a[u]=r[u]);var l=document.getElementById(a.id);if(l)this.span=l.parentNode.getElementsByTagName(\"span\")[0];else{var d=document.createElement(\"div\"),c=document.createElement(\"span\");c.className=\"message\",d.appendChild(c),d.className=r.id,d.style.cssText=o(\"opacity\",n),this.span=c,this.div=d;var l=document.createElement(\"canvas\");document.body.appendChild(l),l.id=a.id,l.style.cssText=\"opacity: 1; position: absolute; z-index: 10000;\",d.appendChild(l),a.container.appendChild(d)}a.delay;var v=a.bars,f=a.radius,p=a.lineHeight+20,g=2*p+2*a.radius,m=i(a.container);m.width-g,m.height-g;var h=window.devicePixelRatio||1;l.width=g*h,l.height=g*h;var y=0,A=l.getContext(\"2d\");A.globalCompositeOperation=\"lighter\",A.shadowOffsetX=1,A.shadowOffsetY=1,A.shadowBlur=1,A.shadowColor=\"rgba(0, 0, 0, 0.5)\",this.messages={},this.message=function(e,t){return this.interval?this.add({message:e,onstart:t}):this.start(t,e)},this.update=function(e,t,n){if(!e)for(var e in this.messages);if(!e)return this.message(t);var r=this.messages[e];r.message=t,\"number\"==typeof n&&(r.span.innerHTML=n+\"%\"),\"...\"===t.substr(-3)?(r._message=t.substr(0,t.length-3),r.messageAnimate=[\".&nbsp;&nbsp;\",\"..&nbsp;\",\"...\"].reverse()):(r._message=t,r.messageAnimate=!1),r.element.innerHTML=t},this.add=function(e){\"string\"==typeof e&&(e={message:e});var t=a.background?a.background:\"rgba(0,0,0,0.65)\";this.span.style.cssText=\"background: \"+t+\";\",this.div.style.cssText=o(\"opacity\",n),this.div.style.cssText+=this.stopPropagation?\"background: rgba(0,0,0,0.25);\":\"pointer-events: none;\",l.parentNode.style.opacity=1,l.parentNode.style.display=\"block\",a.background&&(this.div.style.background=a.backgrond);var r=(new Date).getTime(),i=Math.abs(r*Math.random()>>0),s=e.message,u=document.createElement(\"div\");u.style.cssText=o(\"opacity\",500);var d=document.createElement(\"span\");d.style.cssText=\"float: right; width: 50px;\";var c=document.createElement(\"span\");c.innerHTML=s,u.appendChild(c),u.appendChild(d);var v=this.messages[i]={seed:i,container:u,element:c,span:d,message:s,timeout:1e3*(e.timeout||a.timeout),timestamp:r,getProgress:e.getProgress};return this.span.appendChild(u),this.span.style.display=\"block\",this.update(v.seed,s),e.onstart&&window.setTimeout(e.onstart,50),this.center(),this.interval||(e.delay||I(),window.clearInterval(this.interval),this.interval=window.setInterval(I,30)),i},this.remove=function(e){y+=.07,(new Date).getTime(),\"object\"==typeof e&&(e=e.join(\":\")),e&&(e=\":\"+e+\":\");for(var t in this.messages){var n=this.messages[t];e&&-1===e.indexOf(\":\"+n.seed+\":\")||(delete this.messages[n.seed],n.container.style.color=\"#99ff88\",M(n),n.getProgress&&(n.span.innerHTML=\"100%\"))}},this.start=function(e,t){return t||a.message?this.add({message:t||a.message,onstart:e}):void 0},this.stop=function(){this.remove(),window.clearInterval(this.interval),delete this.interval,a.oncomplete&&a.oncomplete(),l&&l.style&&(d.style.cssText+=\"pointer-events: none;\",window.setTimeout(function(){s.div.style.opacity=0},1),window.setTimeout(function(){s.interval||(s.stopPropagation=!1,l.parentNode.style.display=\"none\",A.clearRect(0,0,g,g))},1e3*n))},this.center=function(){var e=i(a.container),t=e.width-g,n=e.height-g;l.style.left=t/2+\"px\",l.style.top=n/2+\"px\",l.style.width=g+\"px\",l.style.height=g+\"px\",s.span.style.top=n/2+g-10+\"px\"};var w=document.createElement(\"style\");w.innerHTML=\".loader { color: #fff; position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; opacity: 0; display: none; }.loader span.message { font-family: monospace; font-size: 14px; margin: auto; opacity: 1; display: none; border-radius: 10px; padding: 0px; width: 300px; text-align: center; position: absolute; z-index: 10000; left: 0; right: 0; }.loader span.message div { border-bottom: 1px solid #222; padding: 5px 10px; clear: both; text-align: left; opacity: 1; }.loader span.message div:last-child { border-bottom: none; }\",document.head.appendChild(w);var M=function(e){window.setTimeout(function(){e.container.style.opacity=0},1),window.setTimeout(function(){e.container.parentNode.removeChild(e.container)},250)},I=function(){var t=(new Date).getTime();for(var n in s.messages){var r=s.messages[n],o=y/.07>>0;if(0===o%5&&r.getProgress){if(r.timeout&&r.timestamp&&t-r.timestamp>r.timeout){s.remove(r.seed);continue}var i=r.getProgress();if(i>=100){s.remove(r.seed);continue}r.span.innerHTML=(i>>0)+\"%\"}if(0===o%10&&r.messageAnimate){var u=r.messageAnimate.length,l=o/10%u,d=r._message+r.messageAnimate[l];r.element.innerHTML=d}}n||s.stop(),A.save(),A.clearRect(0,0,g*h,g*h),A.scale(h,h),A.translate(g/2,g/2);for(var c=360-360/v,p=0;v>p;p++){var m=2*(p/v)*e+y;A.save(),A.translate(f*Math.sin(-m),f*Math.cos(-m)),A.rotate(m);var w=-a.lineWidth/2,M=0,I=a.lineWidth,b=a.lineHeight,D=I/2;A.beginPath(),A.moveTo(w+D,M),A.lineTo(w+I-D,M),A.quadraticCurveTo(w+I,M,w+I,M+D),A.lineTo(w+I,M+b-D),A.quadraticCurveTo(w+I,M+b,w+I-D,M+b),A.lineTo(w+D,M+b),A.quadraticCurveTo(w,M+b,w,M+b-D),A.lineTo(w,M+D),A.quadraticCurveTo(w,M,w+D,M);var x=p/(v-1)*c;A.fillStyle=\"hsla(\"+x+\", 100%, 50%, 0.85)\",A.fill(),A.restore()}A.restore(),y+=.07};return a.display===!1?this:(this.start(),this)}}};var o=function(e,t){return\"\t\t-webkit-transition-property: \"+e+\";\t\t-webkit-transition-duration: \"+t+\"ms;\t\t-moz-transition-property: \"+e+\";\t\t-moz-transition-duration: \"+t+\"ms;\t\t-o-transition-property: \"+e+\";\t\t-o-transition-duration: \"+t+\"ms;\t\t-ms-transition-property: \"+e+\";\t\t-ms-transition-duration: \"+t+\"ms;\"},i=function(e){if(window.innerWidth&&window.innerHeight)var t=window.innerWidth,n=window.innerHeight;else if(\"CSS1Compat\"===document.compatMode&&document.documentElement&&document.documentElement.offsetWidth)var t=document.documentElement.offsetWidth,n=document.documentElement.offsetHeight;else if(document.body&&document.body.offsetWidth)var t=document.body.offsetWidth,n=document.body.offsetHeight;if(e)var t=e.offsetWidth;return{width:t,height:n}}}(),eventjs===void 0)var eventjs={};if(function(e){\"use strict\";e.modifyEventListener=!1,e.modifySelectors=!1,e.add=function(e,t,r,o){return n(e,t,r,o,\"add\")},e.remove=function(e,t,r,o){return n(e,t,r,o,\"remove\")},e.returnFalse=function(){return!1},e.stop=function(e){e&&(e.stopPropagation&&e.stopPropagation(),e.cancelBubble=!0,e.cancelBubbleCount=0)},e.prevent=function(e){e&&(e.preventDefault?e.preventDefault():e.preventManipulation?e.preventManipulation():e.returnValue=!1)},e.cancel=function(t){e.stop(t),e.prevent(t)},e.blur=function(){var e=document.activeElement;if(e){var t=document.activeElement.nodeName;(\"INPUT\"===t||\"TEXTAREA\"===t||\"true\"===e.contentEditable)&&e.blur&&e.blur()}},e.getEventSupport=function(e,t){if(\"string\"==typeof e&&(t=e,e=window),t=\"on\"+t,t in e)return!0;if(e.setAttribute||(e=document.createElement(\"div\")),e.setAttribute&&e.removeAttribute){e.setAttribute(t,\"\");var n=\"function\"==typeof e[t];return e[t]!==void 0&&(e[t]=null),e.removeAttribute(t),n}};var t=function(e){if(!e||\"object\"!=typeof e)return e;var n=new e.constructor;for(var r in e)n[r]=e[r]&&\"object\"==typeof e[r]?t(e[r]):e[r];return n},n=function(i,a,l,f,p,g){if(f=f||{},\"[object Object]\"==i+\"\"){var m=i;if(i=m.target,delete m.target,!m.type||!m.listener){for(var h in m){var y=m[h];\"function\"!=typeof y&&(f[h]=y)}var A={};for(var w in m){var h=w.split(\",\"),M=m[w],I={};for(var b in f)I[b]=f[b];if(\"function\"==typeof M)var l=M;else{if(\"function\"!=typeof M.listener)continue;var l=M.listener;for(var b in M)\"function\"!=typeof M[b]&&(I[b]=M[b])}for(var D=0;h.length>D;D++)A[w]=eventjs.add(i,h[D],l,I,p)}return A}a=m.type,delete m.type,l=m.listener,delete m.listener;for(var w in m)f[w]=m[w]}if(i&&a&&l){if(\"string\"==typeof i&&\"ready\"===a){if(!window.eventjs_stallOnReady){var x=(new Date).getTime(),S=f.timeout,j=f.interval||1e3/60,T=window.setInterval(function(){(new Date).getTime()-x>S&&window.clearInterval(T),document.querySelector(i)&&(window.clearInterval(T),setTimeout(l,1))},j);return}a=\"load\",i=window}if(\"string\"==typeof i){if(i=document.querySelectorAll(i),0===i.length)return o(\"Missing target on listener!\",arguments);1===i.length&&(i=i[0])}var q,E={};if(i.length>0&&i!==window){for(var B=0,F=i.length;F>B;B++)q=n(i[B],a,l,t(f),p),q&&(E[B]=q);return r(E)}if(\"string\"==typeof a&&(a=a.toLowerCase(),-1!==a.indexOf(\" \")?a=a.split(\" \"):-1!==a.indexOf(\",\")&&(a=a.split(\",\"))),\"string\"!=typeof a){if(\"number\"==typeof a.length)for(var C=0,G=a.length;G>C;C++)q=n(i,a[C],l,t(f),p),q&&(E[a[C]]=q);else for(var w in a)q=\"function\"==typeof a[w]?n(i,w,a[w],t(f),p):n(i,w,a[w].listener,t(a[w]),p),q&&(E[w]=q);return r(E)}if(0===a.indexOf(\"on\")&&(a=a.substr(2)),\"object\"!=typeof i)return o(\"Target is not defined!\",arguments);if(\"function\"!=typeof l)return o(\"Listener is not a function!\",arguments);var k=f.useCapture||!1,P=d(i)+\".\"+d(l)+\".\"+(k?1:0);if(e.Gesture&&e.Gesture._gestureHandlers[a]){if(P=a+P,\"remove\"===p){if(!u[P])return;u[P].remove(),delete u[P]}else if(\"add\"===p){if(u[P])return u[P].add(),u[P];if(f.useCall&&!e.modifyEventListener){var L=l;l=function(e,t){for(var n in t)e[n]=t[n];return L.call(i,e)}}f.gesture=a,f.target=i,f.listener=l,f.fromOverwrite=g,u[P]=e.proxy[a](f)}return u[P]}for(var H,K=s(a),D=0;K.length>D;D++)if(a=K[D],H=a+\".\"+P,\"remove\"===p){if(!u[H])continue;i[v](a,l,k),delete u[H]}else if(\"add\"===p){if(u[H])return u[H];i[c](a,l,k),u[H]={id:H,type:a,target:i,listener:l,remove:function(){for(var t=0;K.length>t;t++)e.remove(i,K[t],l,f)}}}return u[H]}},r=function(e){return{remove:function(){for(var t in e)e[t].remove()},add:function(){for(var t in e)e[t].add()}}},o=function(e,t){\"undefined\"!=typeof console&&void 0!==console.error&&console.error(e,t)},i={msPointer:[\"MSPointerDown\",\"MSPointerMove\",\"MSPointerUp\"],touch:[\"touchstart\",\"touchmove\",\"touchend\"],mouse:[\"mousedown\",\"mousemove\",\"mouseup\"]},a={MSPointerDown:0,MSPointerMove:1,MSPointerUp:2,touchstart:0,touchmove:1,touchend:2,mousedown:0,mousemove:1,mouseup:2};(function(){e.supports={},window.navigator.msPointerEnabled&&(e.supports.msPointer=!0),e.getEventSupport(\"touchstart\")&&(e.supports.touch=!0),e.getEventSupport(\"mousedown\")&&(e.supports.mouse=!0)})();var s=function(){return function(t){var n=document.addEventListener?\"\":\"on\",r=a[t];if(isFinite(r)){var o=[];for(var s in e.supports)o.push(n+i[s][r]);return o}return[n+t]}}(),u={},l=0,d=function(e){return e===window?\"#window\":e===document?\"#document\":(e.uniqueID||(e.uniqueID=\"e\"+l++),e.uniqueID)},c=document.addEventListener?\"addEventListener\":\"attachEvent\",v=document.removeEventListener?\"removeEventListener\":\"detachEvent\";return e.createPointerEvent=function(t,n,r){var o=n.gesture,i=n.target,a=t.changedTouches||e.proxy.getCoords(t);if(a.length){var s=a[0];n.pointers=r?[]:a,n.pageX=s.pageX,n.pageY=s.pageY,n.x=n.pageX,n.y=n.pageY}var u=document.createEvent(\"Event\");u.initEvent(o,!0,!0),u.originalEvent=t;for(var l in n)\"target\"!==l&&(u[l]=n[l]);var d=u.type;e.Gesture&&e.Gesture._gestureHandlers[d]&&n.oldListener.call(i,u,n,!1)},e.modifyEventListener&&window.HTMLElement&&function(){var t=function(t){var r=function(r){var o=r+\"EventListener\",i=t[o];t[o]=function(t,o,a){if(e.Gesture&&e.Gesture._gestureHandlers[t]){var u=a;\"object\"==typeof a?u.useCall=!0:u={useCall:!0,useCapture:a},n(this,t,o,u,r,!0)}else for(var l=s(t),d=0;l.length>d;d++)i.call(this,l[d],o,a)}};r(\"add\"),r(\"remove\")};navigator.userAgent.match(/Firefox/)?(t(HTMLDivElement.prototype),t(HTMLCanvasElement.prototype)):t(HTMLElement.prototype),t(document),t(window)}(),e.modifySelectors&&function(){var e=NodeList.prototype;e.removeEventListener=function(e,t,n){for(var r=0,o=this.length;o>r;r++)this[r].removeEventListener(e,t,n)},e.addEventListener=function(e,t,n){for(var r=0,o=this.length;o>r;r++)this[r].addEventListener(e,t,n)}}(),e}(eventjs),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){\"use strict\";e.pointerSetup=function(e,t){e.target=e.target||window,e.doc=e.target.ownerDocument||e.target,e.minFingers=e.minFingers||e.fingers||1,e.maxFingers=e.maxFingers||e.fingers||1/0,e.position=e.position||\"relative\",delete e.fingers,t=t||{},t.enabled=!0,t.gesture=e.gesture,t.target=e.target,t.env=e.env,eventjs.modifyEventListener&&e.fromOverwrite&&(e.oldListener=e.listener,e.listener=eventjs.createPointerEvent);var n=0,r=0===t.gesture.indexOf(\"pointer\")&&eventjs.modifyEventListener?\"pointer\":\"mouse\";return e.oldListener&&(t.oldListener=e.oldListener),t.listener=e.listener,t.proxy=function(n){t.defaultListener=e.listener,e.listener=n,n(e.event,t)},t.add=function(){t.enabled!==!0&&(e.onPointerDown&&eventjs.add(e.target,r+\"down\",e.onPointerDown),e.onPointerMove&&eventjs.add(e.doc,r+\"move\",e.onPointerMove),e.onPointerUp&&eventjs.add(e.doc,r+\"up\",e.onPointerUp),t.enabled=!0)},t.remove=function(){t.enabled!==!1&&(e.onPointerDown&&eventjs.remove(e.target,r+\"down\",e.onPointerDown),e.onPointerMove&&eventjs.remove(e.doc,r+\"move\",e.onPointerMove),e.onPointerUp&&eventjs.remove(e.doc,r+\"up\",e.onPointerUp),t.reset(),t.enabled=!1)},t.pause=function(t){!e.onPointerMove||t&&!t.move||eventjs.remove(e.doc,r+\"move\",e.onPointerMove),!e.onPointerUp||t&&!t.up||eventjs.remove(e.doc,r+\"up\",e.onPointerUp),n=e.fingers,e.fingers=0},t.resume=function(t){!e.onPointerMove||t&&!t.move||eventjs.add(e.doc,r+\"move\",e.onPointerMove),!e.onPointerUp||t&&!t.up||eventjs.add(e.doc,r+\"up\",e.onPointerUp),e.fingers=n},t.reset=function(){e.tracker={},e.fingers=0},t};var t=eventjs.supports;eventjs.isMouse=!!t.mouse,eventjs.isMSPointer=!!t.touch,eventjs.isTouch=!!t.msPointer,e.pointerStart=function(t,n,r){var o=(t.type||\"mousedown\").toUpperCase();0===o.indexOf(\"MOUSE\")?(eventjs.isMouse=!0,eventjs.isTouch=!1,eventjs.isMSPointer=!1):0===o.indexOf(\"TOUCH\")?(eventjs.isMouse=!1,eventjs.isTouch=!0,eventjs.isMSPointer=!1):0===o.indexOf(\"MSPOINTER\")&&(eventjs.isMouse=!1,eventjs.isTouch=!1,eventjs.isMSPointer=!0);var i=function(e,t){var n=r.bbox,o=s[t]={};switch(r.position){case\"absolute\":o.offsetX=0,o.offsetY=0;break;case\"differenceFromLast\":o.offsetX=e.pageX,o.offsetY=e.pageY;break;case\"difference\":o.offsetX=e.pageX,o.offsetY=e.pageY;break;case\"move\":o.offsetX=e.pageX-n.x1,o.offsetY=e.pageY-n.y1;break;default:o.offsetX=n.x1-n.scrollLeft,o.offsetY=n.y1-n.scrollTop}var i=e.pageX-o.offsetX,a=e.pageY-o.offsetY;o.rotation=0,o.scale=1,o.startTime=o.moveTime=(new Date).getTime(),o.move={x:i,y:a},o.start={x:i,y:a},r.fingers++};r.event=t,n.defaultListener&&(r.listener=n.defaultListener,delete n.defaultListener);for(var a=!r.fingers,s=r.tracker,u=t.changedTouches||e.getCoords(t),l=u.length,d=0;l>d;d++){var c=u[d],v=c.identifier||1/0;if(r.fingers){if(r.fingers>=r.maxFingers){var f=[];for(var v in r.tracker)f.push(v);return n.identifier=f.join(\",\"),a}var p=0;for(var g in s){if(s[g].up){delete s[g],i(c,v),r.cancel=!0;break}p++}if(s[v])continue;i(c,v)}else s=r.tracker={},n.bbox=r.bbox=e.getBoundingBox(r.target),r.fingers=0,r.cancel=!1,i(c,v)}var f=[];for(var v in r.tracker)f.push(v);return n.identifier=f.join(\",\"),a},e.pointerEnd=function(e,t,n,r){for(var o=e.touches||[],i=o.length,a={},s=0;i>s;s++){var u=o[s],l=u.identifier;a[l||1/0]=!0}for(var l in n.tracker){var d=n.tracker[l];a[l]||d.up||(r&&r({pageX:d.pageX,pageY:d.pageY,changedTouches:[{pageX:d.pageX,pageY:d.pageY,identifier:\"Infinity\"===l?1/0:l}]},\"up\"),d.up=!0,n.fingers--)}if(0!==n.fingers)return!1;var c=[];n.gestureFingers=0;for(var l in n.tracker)n.gestureFingers++,c.push(l);return t.identifier=c.join(\",\"),!0},e.getCoords=function(t){return e.getCoords=t.pageX!==void 0?function(e){return Array({type:\"mouse\",x:e.pageX,y:e.pageY,pageX:e.pageX,pageY:e.pageY,identifier:e.pointerId||1/0})}:function(e){var t=document.documentElement;return e=e||window.event,Array({type:\"mouse\",x:e.clientX+t.scrollLeft,y:e.clientY+t.scrollTop,pageX:e.clientX+t.scrollLeft,pageY:e.clientY+t.scrollTop,identifier:1/0})},e.getCoords(t)},e.getCoord=function(t){if(\"ontouchstart\"in window){var n=0,r=0;e.getCoord=function(e){var t=e.changedTouches;return t&&t.length?{x:n=t[0].pageX,y:r=t[0].pageY}:{x:n,y:r}}}else e.getCoord=t.pageX!==void 0&&t.pageY!==void 0?function(e){return{x:e.pageX,y:e.pageY}}:function(e){var t=document.documentElement;return e=e||window.event,{x:e.clientX+t.scrollLeft,y:e.clientY+t.scrollTop}};return e.getCoord(t)};var n=function(e,t){var n=parseFloat(e.getPropertyValue(t),10);return isFinite(n)?n:0};return e.getBoundingBox=function(e){(e===window||e===document)&&(e=document.body);var t={},r=e.getBoundingClientRect();t.width=r.width,t.height=r.height,t.x1=r.left,t.y1=r.top,t.scaleX=r.width/e.offsetWidth||1,t.scaleY=r.height/e.offsetHeight||1,t.scrollLeft=0,t.scrollTop=0;var o=window.getComputedStyle(e),i=\"border-box\"===o.getPropertyValue(\"box-sizing\");if(i===!1){var a=n(o,\"border-left-width\"),s=n(o,\"border-right-width\"),u=n(o,\"border-bottom-width\"),l=n(o,\"border-top-width\");t.border=[a,s,l,u],t.x1+=a,t.y1+=l,t.width-=s+a,t.height-=u+l}t.x2=t.x1+t.width,t.y2=t.y1+t.height;for(var d=o.getPropertyValue(\"position\"),c=\"fixed\"===d?e:e.parentNode;null!==c&&c!==document.body&&void 0!==c.scrollTop;){var o=window.getComputedStyle(c),d=o.getPropertyValue(\"position\");if(\"absolute\"===d);else{if(\"fixed\"===d){t.scrollTop-=c.parentNode.scrollTop,t.scrollLeft-=c.parentNode.scrollLeft;break}t.scrollLeft+=c.scrollLeft,t.scrollTop+=c.scrollTop}c=c.parentNode}return t.scrollBodyLeft=void 0!==window.pageXOffset?window.pageXOffset:(document.documentElement||document.body.parentNode||document.body).scrollLeft,t.scrollBodyTop=void 0!==window.pageYOffset?window.pageYOffset:(document.documentElement||document.body.parentNode||document.body).scrollTop,t.scrollLeft-=t.scrollBodyLeft,t.scrollTop-=t.scrollBodyTop,t},function(){var t,n=navigator.userAgent.toLowerCase(),r=-1!==n.indexOf(\"macintosh\");t=r&&-1!==n.indexOf(\"khtml\")?{91:!0,93:!0}:r&&-1!==n.indexOf(\"firefox\")?{224:!0}:{17:!0},(e.metaTrackerReset=function(){eventjs.fnKey=e.fnKey=!1,eventjs.metaKey=e.metaKey=!1,eventjs.ctrlKey=e.ctrlKey=!1,eventjs.shiftKey=e.shiftKey=!1,eventjs.altKey=e.altKey=!1})(),e.metaTracker=function(n){var r=!!t[n.keyCode];return r&&(eventjs.metaKey=e.metaKey=\"keydown\"===n.type),eventjs.ctrlKey=e.ctrlKey=n.ctrlKey,eventjs.shiftKey=e.shiftKey=n.shiftKey,eventjs.altKey=e.altKey=n.altKey,r}}(),e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.MutationObserver=function(){var e=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver,t=!e&&function(){var e=document.createElement(\"p\"),t=!1,n=function(){t=!0};if(e.addEventListener)e.addEventListener(\"DOMAttrModified\",n,!1);else{if(!e.attachEvent)return!1;e.attachEvent(\"onDOMAttrModified\",n)}return e.setAttribute(\"id\",\"target\"),t}();return function(n,r){if(e){var o={subtree:!1,attributes:!0},i=new e(function(e){e.forEach(function(e){r.call(e.target,e.attributeName)})});i.observe(n,o)}else t?eventjs.add(n,\"DOMAttrModified\",function(e){r.call(n,e.attrName)}):\"onpropertychange\"in document.body&&eventjs.add(n,\"propertychange\",function(){r.call(n,window.event.propertyName)})}}(),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){\"use strict\";return e.click=function(t){t.gesture=t.gesture||\"click\",t.maxFingers=t.maxFingers||t.fingers||1,t.onPointerDown=function(r){e.pointerStart(r,n,t)&&eventjs.add(t.target,\"mouseup\",t.onPointerUp)},t.onPointerUp=function(r){if(e.pointerEnd(r,n,t)){eventjs.remove(t.target,\"mouseup\",t.onPointerUp);var o=r.changedTouches||e.getCoords(r),i=o[0],a=t.bbox,s=e.getBoundingBox(t.target),u=i.pageY-s.scrollBodyTop,l=i.pageX-s.scrollBodyLeft;if(l>a.x1&&u>a.y1&&a.x2>l&&a.y2>u&&a.scrollTop===s.scrollTop){for(var d in t.tracker)break;var c=t.tracker[d];n.x=c.start.x,n.y=c.start.y,t.listener(r,n)}}};var n=e.pointerSetup(t);return n.state=\"click\",eventjs.add(t.target,\"mousedown\",t.onPointerDown),n},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.click=e.click,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){\"use strict\";return e.dbltap=e.dblclick=function(t){t.gesture=t.gesture||\"dbltap\",t.maxFingers=t.maxFingers||t.fingers||1;var n,r,o,i,a,s=700;t.onPointerDown=function(l){var d=l.changedTouches||e.getCoords(l);n&&!r?(a=d[0],r=(new Date).getTime()-n):(i=d[0],n=(new Date).getTime(),r=0,clearTimeout(o),o=setTimeout(function(){n=0},s)),e.pointerStart(l,u,t)&&(eventjs.add(t.target,\"mousemove\",t.onPointerMove).listener(l),eventjs.add(t.target,\"mouseup\",t.onPointerUp))},t.onPointerMove=function(s){if(n&&!r){var u=s.changedTouches||e.getCoords(s);a=u[0]}var l=t.bbox,d=a.pageX-l.x1,c=a.pageY-l.y1;d>0&&l.width>d&&c>0&&l.height>c&&25>=Math.abs(a.pageX-i.pageX)&&25>=Math.abs(a.pageY-i.pageY)||(eventjs.remove(t.target,\"mousemove\",t.onPointerMove),clearTimeout(o),n=r=0)},t.onPointerUp=function(i){if(e.pointerEnd(i,u,t)&&(eventjs.remove(t.target,\"mousemove\",t.onPointerMove),eventjs.remove(t.target,\"mouseup\",t.onPointerUp)),n&&r){if(s>=r){u.state=t.gesture;for(var a in t.tracker)break;var l=t.tracker[a];u.x=l.start.x,u.y=l.start.y,t.listener(i,u)}clearTimeout(o),n=r=0}};var u=e.pointerSetup(t);return u.state=\"dblclick\",eventjs.add(t.target,\"mousedown\",t.onPointerDown),u},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.dbltap=e.dbltap,eventjs.Gesture._gestureHandlers.dblclick=e.dblclick,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){\"use strict\";return e.dragElement=function(t,n){e.drag({event:n,target:t,position:\"move\",listener:function(e,n){t.style.left=n.x+\"px\",t.style.top=n.y+\"px\",eventjs.prevent(e)}})},e.drag=function(t){t.gesture=\"drag\",t.onPointerDown=function(r){e.pointerStart(r,n,t)&&(t.monitor||(eventjs.add(t.doc,\"mousemove\",t.onPointerMove),eventjs.add(t.doc,\"mouseup\",t.onPointerUp))),t.onPointerMove(r,\"down\")},t.onPointerMove=function(r,o){if(!t.tracker)return t.onPointerDown(r);t.bbox;for(var i=r.changedTouches||e.getCoords(r),a=i.length,s=0;a>s;s++){var u=i[s],l=u.identifier||1/0,d=t.tracker[l];d&&(d.pageX=u.pageX,d.pageY=u.pageY,n.state=o||\"move\",n.identifier=l,n.start=d.start,n.fingers=t.fingers,\"differenceFromLast\"===t.position?(n.x=d.pageX-d.offsetX,n.y=d.pageY-d.offsetY,d.offsetX=d.pageX,d.offsetY=d.pageY):(n.x=d.pageX-d.offsetX,n.y=d.pageY-d.offsetY),t.listener(r,n))}},t.onPointerUp=function(r){e.pointerEnd(r,n,t,t.onPointerMove)&&(t.monitor||(eventjs.remove(t.doc,\"mousemove\",t.onPointerMove),eventjs.remove(t.doc,\"mouseup\",t.onPointerUp)))};var n=e.pointerSetup(t);return t.event?t.onPointerDown(t.event):(eventjs.add(t.target,\"mousedown\",t.onPointerDown),t.monitor&&(eventjs.add(t.doc,\"mousemove\",t.onPointerMove),eventjs.add(t.doc,\"mouseup\",t.onPointerUp))),n},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.drag=e.drag,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){\"use strict\";var t=Math.PI/180,n=function(e,t){var n=0,r=0,o=0;for(var i in t){var a=t[i];a.up||(n+=a.move.x,r+=a.move.y,o++)}return e.x=n/=o,e.y=r/=o,e};return e.gesture=function(r){r.gesture=r.gesture||\"gesture\",r.minFingers=r.minFingers||r.fingers||2,r.onPointerDown=function(t){var i=r.fingers;if(e.pointerStart(t,o,r)&&(eventjs.add(r.doc,\"mousemove\",r.onPointerMove),eventjs.add(r.doc,\"mouseup\",r.onPointerUp)),r.fingers===r.minFingers&&i!==r.fingers){o.fingers=r.minFingers,o.scale=1,o.rotation=0,o.state=\"start\";var a=\"\";for(var s in r.tracker)a+=s;o.identifier=parseInt(a),n(o,r.tracker),r.listener(t,o)}},r.onPointerMove=function(i){for(var a=r.bbox,s=r.tracker,u=i.changedTouches||e.getCoords(i),l=u.length,d=0;l>d;d++){var c=u[d],v=c.identifier||1/0,f=s[v];f&&(f.move.x=c.pageX-a.x1,f.move.y=c.pageY-a.y1)}if(!(r.fingers<r.minFingers)){var u=[],p=0,g=0;n(o,s);for(var v in s){var c=s[v];if(!c.up){var m=c.start;if(!m.distance){var h=m.x-o.x,y=m.y-o.y;m.distance=Math.sqrt(h*h+y*y),m.angle=Math.atan2(h,y)/t}var h=c.move.x-o.x,y=c.move.y-o.y,A=Math.sqrt(h*h+y*y);p+=A/m.distance;var w=Math.atan2(h,y)/t,M=(m.angle-w+360)%360-180;c.DEG2=c.DEG1,c.DEG1=M>0?M:-M,c.DEG2!==void 0&&(M>0?c.rotation+=c.DEG1-c.DEG2:c.rotation-=c.DEG1-c.DEG2,g+=c.rotation),u.push(c.move)}}o.touches=u,o.fingers=r.fingers,o.scale=p/r.fingers,o.rotation=g/r.fingers,o.state=\"change\",r.listener(i,o)}},r.onPointerUp=function(t){var n=r.fingers;e.pointerEnd(t,o,r)&&(eventjs.remove(r.doc,\"mousemove\",r.onPointerMove),eventjs.remove(r.doc,\"mouseup\",r.onPointerUp)),n===r.minFingers&&r.fingers<r.minFingers&&(o.fingers=r.fingers,o.state=\"end\",r.listener(t,o))};var o=e.pointerSetup(r);return eventjs.add(r.target,\"mousedown\",r.onPointerDown),o},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.gesture=e.gesture,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){\"use strict\";return e.pointerdown=e.pointermove=e.pointerup=function(t){if(t.gesture=t.gesture||\"pointer\",!t.target.isPointerEmitter){var n=!0;t.onPointerDown=function(e){n=!1,r.gesture=\"pointerdown\",t.listener(e,r)},t.onPointerMove=function(e){r.gesture=\"pointermove\",t.listener(e,r,n)},t.onPointerUp=function(e){n=!0,r.gesture=\"pointerup\",t.listener(e,r,!0)};var r=e.pointerSetup(t);return eventjs.add(t.target,\"mousedown\",t.onPointerDown),eventjs.add(t.target,\"mousemove\",t.onPointerMove),eventjs.add(t.doc,\"mouseup\",t.onPointerUp),t.target.isPointerEmitter=!0,r}},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.pointerdown=e.pointerdown,eventjs.Gesture._gestureHandlers.pointermove=e.pointermove,eventjs.Gesture._gestureHandlers.pointerup=e.pointerup,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){\"use strict\";return e.shake=function(e){var t={gesture:\"devicemotion\",acceleration:{},accelerationIncludingGravity:{},target:e.target,listener:e.listener,remove:function(){window.removeEventListener(\"devicemotion\",l,!1)}},n=4,r=1e3,o=200,i=3,a=(new Date).getTime(),s={x:0,y:0,z:0},u={x:{count:0,value:0},y:{count:0,value:0},z:{count:0,value:0}},l=function(l){var d=.8,c=l.accelerationIncludingGravity;if(s.x=d*s.x+(1-d)*c.x,s.y=d*s.y+(1-d)*c.y,s.z=d*s.z+(1-d)*c.z,t.accelerationIncludingGravity=s,t.acceleration.x=c.x-s.x,t.acceleration.y=c.y-s.y,t.acceleration.z=c.z-s.z,\"devicemotion\"===e.gesture)return e.listener(l,t),void 0;for(var v=\"xyz\",f=(new Date).getTime(),p=0,g=v.length;g>p;p++){var m=v[p],h=t.acceleration[m],y=u[m],A=Math.abs(h);if(!(r>f-a)&&A>n){var w=f*h/A,M=Math.abs(w+y.value);y.value&&o>M?(y.value=w,y.count++,y.count===i&&(e.listener(l,t),a=f,y.value=0,y.count=0)):(y.value=w,y.count=1)}}};return window.addEventListener?(window.addEventListener(\"devicemotion\",l,!1),t):void 0},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.shake=e.shake,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){\"use strict\";var t=Math.PI/180;return e.swipe=function(n){n.snap=n.snap||90,n.threshold=n.threshold||1,n.gesture=n.gesture||\"swipe\",n.onPointerDown=function(t){e.pointerStart(t,r,n)&&(eventjs.add(n.doc,\"mousemove\",n.onPointerMove).listener(t),eventjs.add(n.doc,\"mouseup\",n.onPointerUp))},n.onPointerMove=function(t){for(var r=t.changedTouches||e.getCoords(t),o=r.length,i=0;o>i;i++){var a=r[i],s=a.identifier||1/0,u=n.tracker[s];u&&(u.move.x=a.pageX,u.move.y=a.pageY,u.moveTime=(new Date).getTime())}},n.onPointerUp=function(o){if(e.pointerEnd(o,r,n)){eventjs.remove(n.doc,\"mousemove\",n.onPointerMove),eventjs.remove(n.doc,\"mouseup\",n.onPointerUp);var i,a,s,u,l={x:0,y:0},d=0,c=0,v=0;for(var f in n.tracker){var p=n.tracker[f],g=p.move.x-p.start.x,m=p.move.y-p.start.y;d+=p.move.x,c+=p.move.y,l.x+=p.start.x,l.y+=p.start.y,v++;var h=Math.sqrt(g*g+m*m),y=p.moveTime-p.startTime,u=Math.atan2(g,m)/t+180,a=y?h/y:0;if(s===void 0)s=u,i=a;else{if(!(20>=Math.abs(u-s)))return;s=(s+u)/2,i=(i+a)/2}}var A=n.gestureFingers;A>=n.minFingers&&n.maxFingers>=A&&i>n.threshold&&(l.x/=v,l.y/=v,r.start=l,r.x=d/v,r.y=c/v,r.angle=-(((s/n.snap+.5>>0)*n.snap||360)-360),r.velocity=i,r.fingers=A,r.state=\"swipe\",n.listener(o,r))}};var r=e.pointerSetup(n);return eventjs.add(n.target,\"mousedown\",n.onPointerDown),r},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.swipe=e.swipe,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){\"use strict\";return e.longpress=function(t){return t.gesture=\"longpress\",e.tap(t)},e.tap=function(t){t.delay=t.delay||500,t.timeout=t.timeout||250,t.driftDeviance=t.driftDeviance||10,t.gesture=t.gesture||\"tap\";var n,r;t.onPointerDown=function(i){if(e.pointerStart(i,o,t)){if(n=(new Date).getTime(),eventjs.add(t.doc,\"mousemove\",t.onPointerMove).listener(i),eventjs.add(t.doc,\"mouseup\",t.onPointerUp),\"longpress\"!==t.gesture)return;r=setTimeout(function(){if(!(i.cancelBubble&&++i.cancelBubbleCount>1)){var e=0;for(var n in t.tracker){var r=t.tracker[n];if(r.end===!0)return;if(t.cancel)return;e++}e>=t.minFingers&&t.maxFingers>=e&&(o.state=\"start\",o.fingers=e,o.x=r.start.x,o.y=r.start.y,t.listener(i,o))}},t.delay)}},t.onPointerMove=function(n){for(var r=t.bbox,o=n.changedTouches||e.getCoords(n),i=o.length,a=0;i>a;a++){var s=o[a],u=s.identifier||1/0,l=t.tracker[u];if(l){var d=s.pageX-r.x1,c=s.pageY-r.y1,v=d-l.start.x,f=c-l.start.y,p=Math.sqrt(v*v+f*f);if(!(d>0&&r.width>d&&c>0&&r.height>c&&t.driftDeviance>=p))return eventjs.remove(t.doc,\"mousemove\",t.onPointerMove),t.cancel=!0,void 0}}},t.onPointerUp=function(i){if(e.pointerEnd(i,o,t)){if(clearTimeout(r),eventjs.remove(t.doc,\"mousemove\",t.onPointerMove),eventjs.remove(t.doc,\"mouseup\",t.onPointerUp),i.cancelBubble&&++i.cancelBubbleCount>1)return;if(\"longpress\"===t.gesture)return\"start\"===o.state&&(o.state=\"end\",t.listener(i,o)),void 0;if(t.cancel)return;if((new Date).getTime()-n>t.timeout)return;var a=t.gestureFingers;a>=t.minFingers&&t.maxFingers>=a&&(o.state=\"tap\",o.fingers=t.gestureFingers,t.listener(i,o))}};var o=e.pointerSetup(t);return eventjs.add(t.target,\"mousedown\",t.onPointerDown),o},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.tap=e.tap,eventjs.Gesture._gestureHandlers.longpress=e.longpress,e}(eventjs.proxy),eventjs===void 0)var eventjs={};eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){\"use strict\";return e.wheelPreventElasticBounce=function(e){e&&(\"string\"==typeof e&&(e=document.querySelector(e)),eventjs.add(e,\"wheel\",function(e,t){t.preventElasticBounce(),eventjs.stop(e)}))},e.wheel=function(e){var t,n=e.timeout||150,r=0,o={gesture:\"wheel\",state:\"start\",wheelDelta:0,target:e.target,listener:e.listener,preventElasticBounce:function(e){var t=this.target,n=t.scrollTop,r=n+t.offsetHeight,o=t.scrollHeight;\nr===o&&0>=this.wheelDelta?eventjs.cancel(e):0===n&&this.wheelDelta>=0&&eventjs.cancel(e),eventjs.stop(e)},add:function(){e.target[a](u,i,!1)},remove:function(){e.target[s](u,i,!1)}},i=function(i){i=i||window.event,o.state=r++?\"change\":\"start\",o.wheelDelta=i.detail?-20*i.detail:i.wheelDelta,e.listener(i,o),clearTimeout(t),t=setTimeout(function(){r=0,o.state=\"end\",o.wheelDelta=0,e.listener(i,o)},n)},a=document.addEventListener?\"addEventListener\":\"attachEvent\",s=document.removeEventListener?\"removeEventListener\":\"detachEvent\",u=eventjs.getEventSupport(\"mousewheel\")?\"mousewheel\":\"DOMMouseScroll\";return e.target[a](u,i,!1),o},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.wheel=e.wheel,e}(eventjs.proxy);var addEvent=eventjs.add,removeEvent=eventjs.remove;(function(){for(var e in eventjs)Event[e]=eventjs[e];for(var e in eventjs.proxy)addEvent[e]=eventjs.proxy[e]})();"

/***/ }
/******/ ])