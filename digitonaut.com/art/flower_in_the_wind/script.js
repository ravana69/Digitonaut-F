"use strict";

window.addEventListener("load",function() {

    let canv, ctx;    // canvas and context
    let maxx, maxy;   // canvas dimensions
    let lRef;
    let nbPetals;
    
    let fAngles, fDir0, fL0, la, fLc, fEndAngles, fEndDir;
    let hueOffs, fHue1, fHue2, fHue3;  
    let fXc, fYc;
    let leave;
    
    // for animation
    let events;
    
    // shortcuts for Math.
    const mrandom = Math.random;
    const mfloor = Math.floor;
    const mround = Math.round;
    const mceil = Math.ceil;
    const mabs = Math.abs;
    const mmin = Math.min;
    const mmax = Math.max;
    
    const mPI = Math.PI;
    const mPIS2 = Math.PI / 2;
    const mPIS4 = Math.PI / 4;
    const m2PI = Math.PI * 2;

    const msin = Math.sin;
    const mcos = Math.cos;
    const matan2 = Math.atan2;
    
    const mhypot = Math.hypot;
    const msqrt = Math.sqrt;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function alea (min, max) {
// random number [min..max[ . If no max is provided, [0..min[

    if (typeof max == 'undefined') return min * mrandom();
    return min + (max - min) * mrandom();
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function intAlea (min, max) {
// random integer number [min..max[ . If no max is provided, [0..min[

    if (typeof max == 'undefined') {
      max = min; min = 0;
    }
    return mfloor(min + (max - min) * mrandom());
  } // intAlea



/*	============================================================================
	This is based upon Johannes Baagoe's carefully designed and efficient hash
	function for use with JavaScript.  It has a proven "avalanche" effect such
	that every bit of the input affects every bit of the output 50% of the time,
	which is good.	See: http://baagoe.com/en/RandomMusings/hash/avalanche.xhtml
	============================================================================
*/
/* This function returns a hash function depending on a seed.

if no seed is provided (or a falsy value), Math.random() is used.
The returned function always returns the same number in the range [0..1[ for the
same value of the argument. This argument may be a String or a Number or anything else
which can be 'toStringed'
Two returned functions obtained with two equal seeds are equivalent.
*/

function hashFunction(seed) {
    let n0 = 0xefc8249d;
    let n = n0;
    mash((seed || Math.random())); // pre-compute n for seed
    n0 = n; //
    
    function mash(data) {
        data = data.toString() + 'U';
        n = n0;
        for (let i = 0; i < data.length; i++) {
            n += data.charCodeAt(i);
            var h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        } // for
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    } // mash
    return mash;
} // hashFunction(seed)

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function Noise1D (period, min = 0, max = 1, hash) {
/* returns a 1D noise function.
   the (mandatory) hash function must return a value between 0 and 1. The hash function
   will be called with an integer number for a parameter.
  the returned function takes one parameter, and will always return the same value if called with the same parameter
  period should be > 1. The bigger period is, the smoother the output noise is

suggestion : the hash parameter could be a function returned from a call to hashFunction above

*/

    let currx, y0, y1;  // cached valued, to reduce number of calls to 'hash'
    let phase = hash(0); // to shift the phase of different generators between each other;
    
    return function(x) {
        let xx = x / period + phase;
        let intx = mfloor(xx);
        
        if (intx - 1 === currx) { // next integer interval
            ++currx;
            y0 = y1;
            y1 = min + (max - min) * hash(currx + 1);
        } else if (intx !== currx) { // unrelated interval
            currx = intx;
            y0 = min + (max - min) * hash(currx);
            y1 = min + (max - min) * hash(currx + 1);
        }
        let frac = xx - currx;
        let z = (3 - 2 * frac) * frac * frac;
        return z * y1 + (1 - z) * y0;
    }
} // Noise1D
/* example : noise = Noise1D (100, 0, maxy, hashFunction(seed));
*/
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function hslString(h, s = 100, l = 50) {
    return `hsl(${h},${s}%,${l}%)`;
} // hslString

//------------------------------------------------------------------------

function flowerAt (t) {

    let xEnd, yEnd, ac, ad;
    
/* computes actual elements at given time 
   most parameters are based on noise functions, just call these functions */

    let angles = fAngles.map (f => f(t)); 
    angles[nbPetals] = angles[0] + m2PI; // to make some calculations easier

    const s = angles.map(angle => Math.sin(angle)); 
    const c = angles.map(angle => Math.cos(angle)); 

    const dir0 = fDir0.map ((f, k) => (angles[k + 1] + angles[k]) / 2 + f(t));

    let l0 = fL0.map (f => f(t)); 
    let lc = fLc.map (f => f(t)); 
    let endAngles = fEndAngles.map (f => f(t)); 
    let endDir = fEndDir.map ((f, k) => f(t) + dir0[k] + mPI); // towards center
     
// draw it    

    const xc = fXc(t); 
    const yc = fYc(t);

// leave
     
    xEnd = leave.fXe(t);     
    yEnd = leave.fYe(t);

    ctx.beginPath();
    ctx.moveTo (leave.x0, leave.y0);
    
    ctx.bezierCurveTo(
        leave.xa, leave.ya,
        xEnd + leave.dxc, yEnd + leave.dyc,
        xEnd, yEnd);
    ctx.bezierCurveTo (
        xEnd + leave.dxd, yEnd + leave.dyd,
        leave.xb, leave.yb,
        leave.x0, leave.y0);
    ctx.fillStyle = '#40FF80';
    ctx.fill();

         
// stem
    const stemX0 = maxx / 2;
    const stemY0 = maxy;
    
    const stemY1 = (yc + stemY0) / 2;
    const stemX2 = (xc + stemX0) / 2;
    const stemWidth = 0.02 * lRef;    
    const stemColor = '#40FF80';

    ctx.beginPath();
    ctx.moveTo (stemX0, stemY0);
    ctx.bezierCurveTo (stemX0, stemY1,
                       stemX2, stemY1,
                       xc, yc);
    ctx.lineWidth = stemWidth;
    ctx.strokeStyle = stemColor;
    ctx.stroke();

    ctx.lineWidth = 1;
    let hue = fHue1(t)+fHue2(t)+fHue3(t);
    
    for (let k = 0; k < nbPetals; ++k) {
        ctx.beginPath();
        ctx.moveTo (xc, yc);
        ac = endDir[k] + endAngles[k] / 2;
        ad = endDir[k] - endAngles[k] / 2;
        xEnd = xc + l0[k] * Math.cos(dir0[k]); 
        yEnd = yc + l0[k] * Math.sin(dir0[k]); 

        ctx.bezierCurveTo (xc + la * c[k],
                           yc + la * s[k],
                           xEnd + lc[k] * Math.cos(ac),
                           yEnd + lc[k] * Math.sin(ac),
                           xEnd, yEnd);
        ctx.bezierCurveTo (xEnd + lc[k] * Math.cos(ad),
                           yEnd + lc[k] * Math.sin(ad),
                           xc + la * c[k + 1],
                           yc + la * s[k + 1],
                           xc, yc);
        ctx.fillStyle = `hsl(${hue}, 100%, 40%)`;
        ctx.fill();
// innermost part of petal        
        ctx.beginPath();
        ctx.moveTo (xc, yc);
        ac = endDir[k] + endAngles[k] / 2.5;
        ad = endDir[k] - endAngles[k] / 2.5;
        xEnd += l0[k] * 0.2 * Math.cos(endDir[k]); 
        yEnd += l0[k] * 0.2 * Math.sin(endDir[k]);

        ctx.bezierCurveTo (xc + la * c[k] * 0.8,
                           yc + la * s[k] * 0.8,
                           xEnd + lc[k] * Math.cos(ac) * 0.8,
                           yEnd + lc[k] * Math.sin(ac) * 0.8,
                           xEnd, yEnd);
        ctx.bezierCurveTo (xEnd + lc[k] * Math.cos(ad) * 0.8,
                           yEnd + lc[k] * Math.sin(ad) * 0.8,
                           xc + la * c[k + 1] * 0.8,
                           yc + la * s[k + 1] * 0.8,
                           xc, yc);
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fill();

// innermost part of petal        
        ctx.beginPath();
        ctx.moveTo (xc, yc);
        ac = endDir[k] + endAngles[k] / 2.5;
        ad = endDir[k] - endAngles[k] / 2.5;
        xEnd += l0[k] * 0.2 * Math.cos(endDir[k]); 
        yEnd += l0[k] * 0.2 * Math.sin(endDir[k]);

        ctx.bezierCurveTo (xc + la * c[k] * 0.5,
                           yc + la * s[k] * 0.5,
                           xEnd + lc[k] * Math.cos(ac) * 0.5,
                           yEnd + lc[k] * Math.sin(ac) * 0.5,
                           xEnd, yEnd);
        ctx.bezierCurveTo (xEnd + lc[k] * Math.cos(ad) * 0.5,
                           yEnd + lc[k] * Math.sin(ad) * 0.5,
                           xc + la * c[k + 1] * 0.5,
                           yc + la * s[k + 1] * 0.5,
                           xc, yc);
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.fill();
        
    } // for k
    
    ctx.beginPath();
    ctx.fillStyle = '#ff6';
    ctx.arc(xc, yc, lRef * 0.1, 0, m2PI);
    ctx.fill();    
    
} // flowerAt

//------------------------------------------------------------------------

let animate;

{ // scope for animate

    let animState = 0;
    
    animate = function(tStamp) {
    
        let event;
        
        event = events.pop();
        if (event && event.event == 'reset') animState = 0;
        if (event && event.event == 'click') animState = 0;
        window.requestAnimationFrame(animate)
    
        switch (animState) {
        
            case 0 :
                if (startOver()) {
                    ++animState;
                }
                break;
            
            case 1 :
                ctx.clearRect(0, 0, maxx, maxy);                
                flowerAt(performance.now());
                break;
            
            case 2:
                break;
        
        } // switch
    
    } // animate
} // scope for animate

//------------------------------------------------------------------------
//------------------------------------------------------------------------

function startOver() {

// canvas dimensions

    maxx = window.innerWidth;
    maxy = window.innerHeight;
    
    canv.width = maxx;
    canv.height = maxy;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    lRef = mmin(maxx, maxy) / 2.2;

    nbPetals = intAlea(5, 10);
    let baseAngle = m2PI / nbPetals;
    let offsetAngle = alea(m2PI);
    let baseEndAngle = 2 * mPI / 3;    
    
    
    
// (all periods for noise functions in milliseconds)
    hueOffs = intAlea(360);
    fHue1 =  Noise1D(intAlea(25000, 50000),-360 + hueOffs, 360 + hueOffs, hashFunction())                      
    fHue2 =  Noise1D(intAlea(25000, 50000),-360,360, hashFunction())                      
    fHue3 =  Noise1D(intAlea(25000, 50000),-360,360, hashFunction())                      
 
// center
    fXc =  Noise1D(intAlea(1000, 2000), maxx / 2 - 0.1 * lRef, 
                                          maxx / 2 + 0.1 * lRef, 
                      hashFunction());

    fYc =  Noise1D(intAlea(1000, 2000), maxy / 2.5 - 0.05 * lRef, 
                                          maxy / 2.5 + 0.05 * lRef, 
                      hashFunction());
                      
// angles
    fAngles = new Array(nbPetals).fill(0).map((v,k)=>
        Noise1D(intAlea(2000,5000), 
                offsetAngle + (k - 0.2) * baseAngle,
                offsetAngle + (k + 0.2) * baseAngle, 
                hashFunction())                      

    );
    
// direction of end of petal with respect to bissector of base
    fDir0 = new Array(nbPetals).fill(0).map((v,k)=>
        Noise1D(intAlea(1000,2000), 
                -0.06 * baseAngle, 0.06 * baseAngle, hashFunction())                      
    );
    
// global length of petals
    fL0 = new Array(nbPetals).fill(0).map((v,k)=>
        Noise1D(intAlea(1000,3000), 
                0.6 * lRef, 1 * lRef, hashFunction())                      
    );

// 'bezier'lengths
    la = alea(0.2, 0.3) * lRef;
                                      
    fLc = new Array(nbPetals).fill(0).map((v,k)=>
        Noise1D(intAlea(2000,5000), 
                0.17 * lRef, 0.2 * lRef, hashFunction())                      
    );
// angle of the end of the petals    
    fEndAngles = new Array(nbPetals).fill(0).map((v,k)=>
        Noise1D(intAlea(2000,5000), 
                0.9 * baseEndAngle, 1.1 * baseEndAngle, hashFunction())                      
    );
// direction between bissector of end Angle and center    
    fEndDir = new Array(nbPetals).fill(0).map((v,k)=>
        Noise1D(intAlea(8000,15000), 
                -0.1, 0.1 , hashFunction())                      
    );

    { /* background gradient */
        let t = performance.now();
        let hue = fHue1(t)+fHue2(t)+fHue3(t)+180; // for initial contrast between background and flower
        hue = ((hue % 360) + 360) % 360;
        if (mabs(hue - 120) < 60) hue = ((hue > 120) ? (120 + 60) : (120 - 60)); 
; 
        const color1 = hslString(hue, 100, 80);
        const color2 = hslString(hue, 100, 50);
        const color3 = hslString(hue, 100, 20);
        canv.style.background = `linear-gradient(${color1} 0%,${color2} 75%,${color3} 100%)`;
    }

    { // leave
        leave = {};
        leave.x0 = maxx / 2;
        leave.y0 = 0.975 * maxy;
        let sign = (alea(1) > 0.5) ? 1 : -1; // for leave on right / left side
        leave.fXe = Noise1D(alea(2000,5000), 
                            leave.x0 + sign * 0.40 * lRef, 
                            leave.x0 + sign * 0.60 * lRef, 
                            hashFunction());
        leave.fYe = Noise1D(alea(1000,2000), 
                            leave.y0 - 0.50 * lRef, 
                            leave.y0 - 0.70 * lRef, 
                            hashFunction());
        const la = 0.2 * lRef;
        leave.xa = leave.x0 + la * mcos(-mPIS2 + sign * (0.3 + 0.2));         
        leave.ya = leave.y0 + la * msin(-mPIS2 + sign * (0.3 + 0.2));         
        leave.xb = leave.x0 + la * mcos(-mPIS2 + sign * (0.3 - 0.2));         
        leave.yb = leave.y0 + la * msin(-mPIS2 + sign * (0.3 - 0.2));
        
        const lc = 0.2 * lRef;
        leave.dxc = lc * mcos(-mPIS2 - sign * (mPIS4 + 0.2));         
        leave.dyc = lc * msin(-mPIS2 - sign * (mPIS4 + 0.2));        
        leave.dxd = lc * mcos(-mPIS2 - sign * (mPIS4 - 0.2));         
        leave.dyd = lc * msin(-mPIS2 - sign * (mPIS4 - 0.2));
        
    }
 
    return true;

} // startOver

//------------------------------------------------------------------------

function mouseClick (event) {

    events.push({event:'click'});;

} // mouseClick

//------------------------------------------------------------------------
//------------------------------------------------------------------------
// beginning of execution

    {
        canv = document.createElement('canvas');
        canv.style.position="absolute";
        document.body.appendChild(canv);
        ctx = canv.getContext('2d');
        canv.setAttribute ('title','click me');
    } // canvas creation
    canv.addEventListener('click',mouseClick);
    events = [{event:'reset'}];
    requestAnimationFrame (animate);

}); // window load listener