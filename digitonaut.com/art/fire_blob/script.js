var w = c.width = window.innerWidth,
		h = c.height = window.innerHeight,
		ctx = c.getContext( '2d' ),
		
		opts = {
			particles: 200,
			baseSize: 30,
			addedSize: 20,
			baseSpeed: 3,
			addedSpeed: 2,
			colors: [ 'hsla(30,80%,50%,.5)', 'hsla(210,80%,50%,.5)' ]
		},
		
		particles = [],
		tick = 0;

function Particle(){
	
	this.x = w / 2;
	this.y = h / 2;
	
	this.size = opts.baseSize + opts.addedSize * Math.random();
	
	var speed = opts.baseSpeed + opts.addedSpeed * Math.random(),
			rad = Math.random() * Math.PI * 2;
	
	this.vx = speed * Math.cos( rad );
	this.vy = speed * Math.sin( rad );
	
	this.color = opts.colors[ ( opts.colors.length * Math.random() ) |0 ];
}
Particle.prototype.step = function(){
	
	this.x += this.vx;
	this.y += this.vy;
	
	var flipX = true,
			flipY = true;
	
	if( this.x < 0 )
		this.x = 0;
	else if( this.x > w )
		this.x = w;
	else
		flipX = false;
	
	if( this.y < 0 )
		this.y = 0;
	else if( this.y > h )
		this.y = h;
	else
		flipY = false;
	
	if( flipX )
		this.vx *= -1;
	if( flipY )
		this.vy *= -1;
	
	ctx.fillStyle = this.color;
	ctx.beginPath();
	ctx.arc( this.x, this.y, this.size, 0, Math.PI * 2 );
	ctx.fill();
}
function anim(){
	
	window.requestAnimationFrame( anim );
	
	++tick;
	
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = 'rgba(0,0,0,1)';
	ctx.fillRect( 0, 0, w, h );
	ctx.globalCompositeOperation = 'lighter';
	
	if( particles.length < opts.particles && Math.random() < .5 )
		particles.push( new Particle );
	
	particles.map( function( particle ){ particle.step(); } );
}
anim();

window.addEventListener( 'resize', function(){
	
	w = c.width = window.innerWidth;
	h = c.height = window.innerHeight;
})