var container,
  renderer,
  scene,
  camera,
	controls,
  mesh,
  start = Date.now(),
  fov = 30;

window.addEventListener( 'load', function() {

  // grab the container from the DOM
  container = document.getElementById( "container" );

  // create a scene
  scene = new THREE.Scene();

  // create a camera the size of the browser window
  // and place it 100 units away, looking towards the center of the scene
  camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    0.01,
    100
  );
  camera.position.z = 5;
	
	uniforms = {
    u_time: { type: "f", value: 1.0 },
  };
	
	material = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
	} );
	// material.transparent = true ;
	// material.side = THREE.DoubleSide ;
	// material.alphaTest = 0.5 ;
	// material.opacity = 0.5;
	// material.depthWrite = false ;
	
  // create a sphere and assign the material
	var radius = 1 ;
  mesh = new THREE.Mesh(
    //new THREE.IcosahedronGeometry( 20, 4 ),
		new THREE.SphereGeometry(radius, 200, 100),
    material
  );
  scene.add( mesh );
	
	var geometry = new THREE.Geometry();
	
  // create the renderer and attach it to the DOM
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio( window.devicePixelRatio );

  container.appendChild( renderer.domElement );
	
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true ;
	controls.dampingFactor = 0.1 ;
	controls.maxDistance = 10 ;
	controls.minDistance = 1.1 ;
	controls.autoRotate = true ;
	controls.autoRotateSpeed = 0.1 ;
	controls.rotateSpeed = .05 ;
	
	window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, false);
  

  render();

} );

let frame = 0 ;
function render() {

  requestAnimationFrame( render );
	renderer.render( scene, camera );
	controls.update() ;
	const {x,y,z} = camera.position ;
	const distance = Math.sqrt(x*x+y*y+z*z)-1 ;
	// if (frame%60 == 0){
	// 		console.log(`${JSON.stringify(camera.position)}`)		
	// 	  console.log(`x=${x}`) ;
	// 	  console.log(`distance=${distance}`) ;
	// }
	// frame++ ;
	camera.rotateSpeed = 0.05*distance/4 ;
	camera.autoRotateSpeed = 0.1*distance/4 ;
	uniforms.u_time.value = Date.now()-start ;  
}