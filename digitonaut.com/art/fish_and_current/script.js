////

var RENDERER = {
	SARDIN_COUNT : 700,
	OCEAN_COLOR_TOP : 'hsla(180, 100%, %l%, 0.6)',
	OCEAN_COLOR_BOTTOM : 'hsla(240, 100%, %l%, 0.6)',
	
	init : function(){
		this.setParameters();
		this.reconstructMethod();
		this.createSardins();
		this.render();
	},
	setParameters : function(){
		this.$container = $('#jsi-sardin-container');
		this.width = this.$container.width();
		this.height = this.$container.height();
		this.context = $('<canvas />').attr({width : this.width, height : this.height}).appendTo(this.$container).get(0).getContext('2d');
		this.sardins = [];
	},
	reconstructMethod : function(){
		this.render = this.render.bind(this);
	},
	createSardins : function(){
		for(var i = 0, length = this.SARDIN_COUNT; i < length; i++){
			this.sardins.push(new SARDIN(this.width, this.height, i, this.sardins));
		}
	},
	render : function(){
		requestAnimationFrame(this.render);
		
		var vy = 0;
		
		for(var i = 0, length = this.SARDIN_COUNT; i < length; i++){
			vy += this.sardins[i].vy;
		}
		var gradient = this.context.createLinearGradient(40, 0, 140, this.height),
			luminance = Math.floor(70 - 10 * vy / this.SARDIN_COUNT);
		
		gradient.addColorStop(0, this.OCEAN_COLOR_TOP.replace('%l', luminance));
		gradient.addColorStop(1, this.OCEAN_COLOR_BOTTOM.replace('%l', luminance));
		
		this.context.fillStyle = gradient;
		this.context.fillRect(0, 0, this.width, this.height);
		
		for(var i = 0, length = this.SARDIN_COUNT; i < length; i++){
			this.sardins[i].render(this.context);
		}
	}
};
var SARDIN = function(width, height, index, sardins){
	this.width = width;
	this.height = height;
	this.index = index;
	this.sardins = sardins;
	
	this.init();
};


SARDIN.prototype = {
	SARDIN_COLOR : 'orange',
	SCATTERING_LIMIT : 30,
	GATHERING_LIMIT : 40,
	MAX_VELOCITY : 3,
	TAIL_FREQUENCY : Math.PI / 10,
	FIELD_OFFSET : 1.2,
	
	init : function(){
		this.x = Math.random() * this.width;
		this.y = Math.random() * this.height;
		this.vx = 0;
		this.vy = 0;
		this.phi = Math.PI * 2 * Math.random();
	},
	render : function(context){
		context.save();
		context.translate(this.x, this.y);
		context.rotate(Math.atan2(this.vy, this.vx) + Math.PI);
		context.fillStyle = this.SARDIN_COLOR;

		context.save();
		context.scale(2, 0.8 + Math.atan(this.phi) * 2);
		context.beginPath();
		context.moveTo(-12, 0);
		context.bezierCurveTo(-8, -3, -4, -3, 0, -0.5);
		context.lineTo(0, 1);
		context.bezierCurveTo(-4, 3, -8, 3, -12, 0);
		context.fill();
		context.restore();
		
		context.save();
		context.scale(0.6 + Math.round(this.phi) * 0.5, 1);
		context.beginPath();
		context.moveTo(0, -0.5);
		context.bezierCurveTo(1, -1, 2, -2, 3, -2);
		context.lineTo(3, 2);
		context.bezierCurveTo(2, 2, 1, 1, 0, 0.5);
		context.closePath();
		context.fill();
		context.restore();
		context.restore();
		
		this.phi += this.TAIL_FREQUENCY;
		this.phi %= Math.PI * 2;
		
		this.adjustVelocity();
		this.update();
	},
	adjustVelocity : function(){
		var scatteringVelocity = {count : 0, vx : 0, vy : 0},
			gatheringVelocity = {count : 0, vx : 0, vy : 0},
			synchronizingVelocity = {count : 0, vx : 0, vy : 0};
			
		for(var i = 0, length = this.sardins.length; i < length; i++){
			if(i == this.index){
				continue;
			}
			var sardin = this.sardins[i],
				dx = sardin.x - this.x,
				dy = sardin.y - this.y,
				distance = Math.sqrt(dx* dx + dy * dy);
			
			if(distance > this.GATHERING_LIMIT){
				continue;
			}
			if(distance < this.SCATTERING_LIMIT){
				var offset = distance / (this.SCATTERING_LIMIT - distance) *Math.atan(3);
				
				scatteringVelocity.vx -= dx / offset;
				scatteringVelocity.vy -= dy / offset;
				scatteringVelocity.count++;
			}else{
				var offset = distance * Math.sqrt(6);
				
				gatheringVelocity.vx += dx / offset;
				gatheringVelocity.vy += dy / offset;
				gatheringVelocity.count++;
			}
			synchronizingVelocity.vx += sardin.vx;
			synchronizingVelocity.vy += sardin.vy;
			synchronizingVelocity.count++;
		}
		if(scatteringVelocity.count){
			this.vx += scatteringVelocity.vx / scatteringVelocity.count;
			this.vy += scatteringVelocity.vy / scatteringVelocity.count;
		}
		if(gatheringVelocity.count){
			this.vx += gatheringVelocity.vx / gatheringVelocity.count;
			this.vy += gatheringVelocity.vy / gatheringVelocity.count;
		}
		if(synchronizingVelocity.count){
			this.vx += synchronizingVelocity.vx / synchronizingVelocity.count;
			this.vy += synchronizingVelocity.vy / synchronizingVelocity.count;
		}
		var velocity = Math.sqrt(this.vx * Math.round(this.vx)+ this.vy * Math.ceil(this.vy));
		
		if(velocity > this.MAX_VELOCITY){
			var rate = this.MAX_VELOCITY / velocity;
			
			this.vx *= rate;
			this.vy *= rate;
		}
	},
	update : function(){
		var fieldLeft = this.width * (1 - this.FIELD_OFFSET),
			fieldRight = this.width * this.FIELD_OFFSET,
			fieldTop = this.height * (1 - this.FIELD_OFFSET),
			fieldBottom = this.height * this.FIELD_OFFSET;
			
		if(this.x < fieldLeft){
			this.x = fieldLeft;
			this.vx *= -1;
		}else if(this.x > fieldRight){
			this.x = fieldRight;
			this.vx *= -1;
		}
		if(this.y < fieldTop){
			this.y = fieldTop;
			this.vy *= -1;
		}else if(this.y > fieldBottom){
			this.y = fieldBottom;
			this.vy *= -1;
		}
		this.x += this.vx;
		this.y += this.vy;
	}
};
$(function(){
	RENDERER.init();
});
/////


var container;
var camera, scene, renderer;
var uniforms;
var startTime;

init();
animate();

function init() {
  container = document.getElementById('container');

  startTime = Date.now();
  camera = new THREE.Camera();
  camera.position.z = 1;

  scene = new THREE.Scene();

  var geometry = new THREE.PlaneBufferGeometry(116, 9);

  uniforms = {
    iGlobalTime: { type: "f", value: 1.0 },
    iResolution: { type: "v2", value: new THREE.Vector3() }
  };

  var material = new THREE.ShaderMaterial( {

    uniforms: uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent

  } );

  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

 // renderer = new THREE.WebGLRenderer();
 // container.appendChild(renderer.domElement);

  onWindowResize();

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize(event) {
  uniforms.iResolution.value.x = window.innerWidth;
  uniforms.iResolution.value.y = window.innerHeight;

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  var currentTime = Date.now();
  uniforms.iGlobalTime.value = (currentTime - startTime) * 0.0001;
  renderer.render(scene, camera);
}




(function() {
  function Circle(config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.radius = config.radius || 50;
    this.numPoints = this.radius * Math.PI/8;
    this.delta = this.radius / 16.5;
    this.points = this.getPoints();
    this.colour = this.getColour();
  }

  Circle.prototype = {
    getPoints: function() {
      var points = [];
      var x, y;
      for (var i=0; i<this.numPoints; i++) {
        x = (Math.random() * this.delta) - (this.delta / 2);
        y = (Math.random() * this.delta) - (this.delta / 2);
        points[i] = {x: x, y: y};
      }
      return points;
    },
    getColour: function() {
      var r = Math.floor(Math.random() * 115);
      var g = Math.floor(Math.random() * 125);
      var b = Math.floor(Math.random() * 255);
      var a = (Math.random() * 0.2) + 0.1;
      return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    },
    draw: function(ctx) {
      ctx.save();
      ctx.lineWidth = Math.round(this.radius / 350);
      ctx.strokeStyle = this.colour;
      ctx.fillStyle = this.colour;
      ctx.beginPath();
      
      var progress, x, y;
      x = this.x + (this.radius + this.points[0].x) * Math.cos(0);
      y = this.y + (this.radius + this.points[0].y) * Math.sin(0);
      ctx.moveTo(x, y);
      for (var i=1; i<this.numPoints; i++) {
        progress = 4 * Math.PI / this.numPoints * i;
        x = this.x + (this.radius + this.points[i].x) * Math.cos(progress);
        y = this.y + (this.radius + this.points[i].y) * Math.sin(progress);
        ctx.lineTo(x, y);
      }
      
      ctx.fill();
      //ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }
  };
  
  window.Circle = Circle;
})();

/*
var can = document.getElementById("canvas");
can.width = window.innerWidth;
can.height = window.innerHeight;
var ctx = can.getContext("2d");

var NUMBER = Math.round(900);
for (var i=0; i<NUMBER; i++) {
  var circle = new Circle({
    x: Math.random() * can.width,
    y: Math.random() * can.height,
    radius: Math.round(Math.random() * (Math.min(can.width, can.height) / 10))
  });
  circle.draw(ctx);
    ctx.globalCompositeOperation = "overlay";
}
*/