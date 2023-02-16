var c, $, t;
t = 0;
c = document.getElementById('canv');
$ = c.getContext('2d');

var w = c.width = window.innerWidth;
var h = c.height = window.innerHeight;
$.fillStyle = 'hsla(0,0%,0%,1)';

window.addEventListener('resize', function() {
  c.width = w = window.innerWidth;
  c.height = h = window.innerHeight;
}, false);

//only one small function needed to set up Foo Particle animation - draw. 
function draw() {
//.07 alpha backround to make square trail effect - highter alpha, lesser trail. 
  $.fillStyle = 'hsla(0,0%,0%,.07)';
  $.fillRect(0, 0, c.width, c.height);

  var foo, i, r;

//super simple foo equation for motion. Just mess with it - try different values, Math objects, ect.. -- see what you get. To gain a better understanding of how math effects animation, change just one value at a time. 
  foo = 4 - Math.sin(t) * 2 * Math.PI - 3;
//looping / set # of particles
  for (i = 0; i < 200; ++i) {
//applying foo to each. Change values here too...try * instead of % or something....var r for radius [ 550 reps whole obj size; we give it movement with sin && foo; individualized with i ]
    r = 550 * Math.sin(i % foo);

//shadow mimic - not necessary but adds depth w/o slowing animation.  Same as the color squares below, just slightly larger && black w/low alpha. They lay under the color sqaures.
    $.beginPath();
    $.fillStyle = 'hsla(0,0%, 5%,.4)';
    $.fillRect(Math.sin(i) * r + 2 + (c.width / 2),
      Math.cos(i) * r + 2 + (c.height / 2),
      46.5, 50.5);

//colored squares begin here.
    $.beginPath();
//Easiest multiple-color looping technique in the world.  Try i + 'a number' || do i * 'a num' to see how the colors apply.
    $.fillStyle = 'hsla(' + i + ',60%, 50%,.8)';

//place && size your individual squares { or whatever shape..}
// [ x pos, y pos, w, h ]
    $.fillRect(Math.sin(i) * r + (c.width / 2),
      Math.cos(i) * r + (c.height / 2),
      45.5, 45.5);
    $.fill();

  }
//theta > angle transition speed
  t += 0.000005;
  return t %= 5 * Math.PI;
};
//that's it.  run the animation frame loop below. 
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

function run() {
  window.requestAnimFrame(run);
  draw();
}
run();