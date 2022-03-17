var canvas;
var gl;
var angle = 0.0;

var x = 0;
var y = 0.5;
var z = 2;

var lightX = 1;
var lightY = 0;
var lightZ = 0;

var dirX = -1;
var dirY = 0;
var dirZ = 0;

class Light{
    constructor(loc,dir,amb,sp,dif,alpha,cutoff,type){
    	this.location = loc;
    	this.direction = dir;
    	this.ambient = amb;
    	this.specular = sp;
    	this.diffuse = dif;
    	this.alpha = alpha;
    	this.cutoff = cutoff;
    	this.type = type;
    	this.status = 0;
    }
    turnOff(){
		this.status = 0;
		this.ambient = vec4(0.0, 0.0, 0.0, 0.0);
	}
       
    turnOn(){
		this.status = 1;
		this.ambient = vec4(1.0, 1.0, 1.0, 1.0);
	}

	updateLocation(location) {
		this.location = location;
	}

	updateDirection(direction) {
		this.direction = direction;
	}
}

class Camera{
    constructor(vrp,u,v,n){
    	this.vrp = vrp;
    	this.u = normalize(u);
    	this.v = normalize(v);
    	this.n = normalize(n);
    	
    	this.projectionMatrix = perspective(90.0,1.0,0.1,100);
    	
    	this.updateCameraMatrix();
    }
    
    updateCameraMatrix(){
    	let t = translate(-this.vrp[0],-this.vrp[1],-this.vrp[2]);
    	let r = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 1.0);
    	this.cameraMatrix = mult(r,t);
    }
    
    getModelMatrix(){
    	return this.modelMatrix;
    }
    
    setModelMatrix(mm){
    	this.modelMatrix = mm;
    }    

	updateEye(eye) {
		this.vrp = eye;
		this.n = eye;
		this.u = normalize(cross(vec3(0,1,0), this.n));
		this.v = normalize(cross(this.n, this.u));
		this.updateCameraMatrix();
	}

	moveEye(eye) {
		this.vrp = eye;
		this.updateCameraMatrix();
	}

	returnEye() {
		return this.vrp;
	}

	moveForward() {
		this.vrp[2] -= 0.2;
		this.updateCameraMatrix();
	}
	
	moveBackward() {
		this.vrp[2] += 0.2;
		this.updateCameraMatrix();
	}

	moveRight() {
		this.vrp[0] += 0.2;
		this.updateCameraMatrix();
	}

	moveLeft() {
		this.vrp[0] -= 0.2;
		this.updateCameraMatrix();
	}

	rotateRight() {
		let rotate = rotateZ(0.5);
		let r = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 0.0);
		let newMatrix = mult(rotate,r);
		this.u = vec3(newMatrix[0][0], newMatrix[0][1], newMatrix[0][2]);
		this.v = vec3(newMatrix[1][0], newMatrix[1][1], newMatrix[1][2]);
		this.n = vec3(newMatrix[2][0], newMatrix[2][1], newMatrix[2][2]);
		this.updateCameraMatrix();
	}

	rotateLeft() {
		let rotate = rotateZ(-0.5);
		let r = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 0.0);
		let newMatrix = mult(rotate,r);
		this.u = vec3(newMatrix[0][0], newMatrix[0][1], newMatrix[0][2]);
		this.v = vec3(newMatrix[1][0], newMatrix[1][1], newMatrix[1][2]);
		this.n = vec3(newMatrix[2][0], newMatrix[2][1], newMatrix[2][2]);
		this.updateCameraMatrix();
	}

	goDown() {
		let rotate = rotateX(0.5);
		let r = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 0.0);
		let newMatrix = mult(rotate,r);
		this.u = vec3(newMatrix[0][0], newMatrix[0][1], newMatrix[0][2]);
		this.v = vec3(newMatrix[1][0], newMatrix[1][1], newMatrix[1][2]);
		this.n = vec3(newMatrix[2][0], newMatrix[2][1], newMatrix[2][2]);
		this.updateCameraMatrix();
	}

	goUp() {
		let rotate = rotateX(-0.5);
		let r = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 0.0);
		let newMatrix = mult(rotate,r);
		this.u = vec3(newMatrix[0][0], newMatrix[0][1], newMatrix[0][2]);
		this.v = vec3(newMatrix[1][0], newMatrix[1][1], newMatrix[1][2]);
		this.n = vec3(newMatrix[2][0], newMatrix[2][1], newMatrix[2][2]);
		this.updateCameraMatrix();
	}

	goRight() {
		let rotate = rotateY(0.5);
		let r = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 0.0);
		let newMatrix = mult(rotate,r);
		this.u = vec3(newMatrix[0][0], newMatrix[0][1], newMatrix[0][2]);
		this.v = vec3(newMatrix[1][0], newMatrix[1][1], newMatrix[1][2]);
		this.n = vec3(newMatrix[2][0], newMatrix[2][1], newMatrix[2][2]);
		this.updateCameraMatrix();
	}

	goLeft() {
		let rotate = rotateY(-0.5);
		let r = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 0.0);
		let newMatrix = mult(rotate,r);
		this.u = vec3(newMatrix[0][0], newMatrix[0][1], newMatrix[0][2]);
		this.v = vec3(newMatrix[1][0], newMatrix[1][1], newMatrix[1][2]);
		this.n = vec3(newMatrix[2][0], newMatrix[2][1], newMatrix[2][2]);
		this.updateCameraMatrix();
	}
}

var camera1 = new Camera(vec3(0,0.5,2), vec3(1,0,0), vec3(0,1,0), vec3(0,0,1));
// var cameraA = new Camera(vec3(0,0.5,2), vec3(1,0,0), vec3(0,1,0), vec3(0,0,1));
// var cameraB = new Camera(vec3(0,4.5,4.5), vec3(1,0,0), vec3(0,Math.sqrt(2)/2,-Math.sqrt(2)/2), vec3(0,Math.sqrt(2)/2,Math.sqrt(2)/2));

var cameraMoveable = true;
var light1 = new Light(vec3(lightX,lightY,lightZ),vec3(dirX,dirY,dirZ),vec4(1,1,1,1), vec4(1,1,1,1), vec4(1,1,1,1),0,0,3);
var light2 = new Light(vec3(x,y,z), vec3(1,0,0),vec4(0.0,0.0,0.0,0.0),vec4(1,1,1,1), vec4(1,1,1,1),0,Math.PI,2);

class Drawable{
    constructor(tx,ty,tz,scale,rotX, rotY, rotZ, amb, dif, sp, sh){
    	this.tx = tx;
    	this.ty = ty;
    	this.tz = tz;
    	this.scale = scale;
    	this.modelRotationX = rotX;
    	this.modelRotationY = rotY;
    	this.modelRotationZ = rotZ;
    	this.updateModelMatrix();
    	
    	this.matAmbient = amb;
    	this.matDiffuse = dif;
    	this.matSpecular = sp;
    	this.matAlpha = sh;
    }
    	
    updateModelMatrix(){
        let t = translate(this.tx, this.ty, this.tz);		     
	   		     
    	let s = scale(this.scale,this.scale,this.scale);
    	
    	let rx = rotateX(this.modelRotationX);
    	let ry = rotateY(this.modelRotationY);
    	let rz = rotateZ(this.modelRotationZ);
	
		this.modelMatrix = mult(t,mult(s,mult(rz,mult(ry,rx))));
    }

	rotateObject(num) {
		this.modelRotationY += num;
		this.updateModelMatrix();
	}
}

var smf1;
var smf2;
var smf3;
var smf4;
var orb;
var ground1;
var room1;
var showReflection = false;

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

	gl.canvas.addEventListener('mousedown', (e) => {
		mouseX = e.clientX * 2 / canvas.width - 1;
		mouseY = 1 - 2 * e.clientY / canvas.height;
		var pFront = vec4(mouseX, mouseY, -1, 1);
		var pCam = mult(inverse(camera1.projectionMatrix), pFront);
		pCam[0] = pCam[0] / pCam[3];
		pCam[1] = pCam[1] / pCam[3];
		pCam[2] = pCam[2] / pCam[3];
		pCam[3] = pCam[3] / pCam[3];

		var pWorld = mult(inverse(camera1.cameraMatrix),pCam);
		pWorld[0] = pWorld[0] / pWorld[3];
		pWorld[1] = pWorld[1] / pWorld[3];
		pWorld[2] = pWorld[2] / pWorld[3];
		pWorld[3] = pWorld[3] / pWorld[3];

		var ray = pWorld - camera1.vrp;
		var q = camera1.vrp;

		showReflection = !showReflection;
	})

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    var posSphere = vec3(-0.5,1,0);
	var posCube = vec3(0.5,1,0);
	var posGround = vec3(0,0,0);
	var posOrb = vec3(0.0,0.9,0);
    var rot = vec3(0,0,0);
    var scaleSphere = 1.0;
	var scaleCube = 0.35;
	var scaleOrb = 1.0;
	var scaleGround = 5.0;
    var amb = vec4(1,1,1,1.0);
    var dif = vec4(0.6,0.4,0.4,1.0);
    var spec = vec4(1.0,1.0,1.0,1.0);
    var shine = 100.0


	ground1 = new Ground(posGround[0],posGround[1],posGround[2],scaleGround,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	room1 = new Sky(0,0,0,5,0,0,0,amb,dif,spec,shine);

    platform1bottom = new PlatformBottom(0,0,0,0.2,0,0,0,amb,dif,spec,shine);
	platform1top = new PlatformTop(0,0,0,0.2,0,0,0,amb,dif,spec,shine);
	buttonStand = new Cube(0,0.1,1,0.1,0,0,0,amb,dif,spec,shine);
	button = new Button(0,0.2,1,0.1,0,0,0,amb,dif,spec,shine);

	platform2bottom = new PlatformBottom(3,0,-3,0.2,0,0,0,amb,dif,spec,shine);
	platform2top = new PlatformTop(3,0,-3,0.2,0,0,0,amb,dif,spec,shine);

	platform3bottom = new PlatformBottom(-3,0,-3,0.2,0,0,0,amb,dif,spec,shine);
	platform3top = new PlatformTop(-3,0,-3,0.2,0,0,0,amb,dif,spec,shine);

	platform4bottom = new PlatformBottom(-3,0,3,0.2,0,0,0,amb,dif,spec,shine);
	platform4top = new PlatformTop(-3,0,3,0.2,0,0,0,amb,dif,spec,shine);

	platform5bottom = new PlatformBottom(3,0,3,0.2,0,0,0,amb,dif,spec,shine);
	platform5top = new PlatformTop(3,0,3,0.2,0,0,0,amb,dif,spec,shine);

	smf1 = new Frog(3,0.9,-3,0.5,rot[0],rot[1],rot[2],amb,dif,spec,shine, "textures/off-white-wall.jpg");
	smf2 = new Frog(-3,0.9,-3,0.5,rot[0],rot[1],rot[2],amb,dif,spec,shine, "textures/off-white-wall.jpg");
	smf3 = new Frog(-3,0.9,3,0.5,rot[0],rot[1],rot[2],amb,dif,spec,shine, "textures/off-white-wall.jpg");
	smf4 = new Frog(3,0.9,3,0.5,rot[0],rot[1],rot[2],amb,dif,spec,shine, "textures/off-white-wall.jpg");


	orb = new Orb(posOrb[0],posOrb[1],posOrb[2],scaleOrb,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	objects = [ground1, room1, platform1bottom, platform1top, platform2bottom, platform2top,platform3bottom, platform3top,platform4bottom, platform4top,platform5bottom, platform5top, smf1, smf2, smf3, smf4]


    render();

	document.addEventListener('keydown', function(event) {
		// up arrow
		if(event.keyCode == 38 && cameraMoveable) {
			camera1.moveForward();
		}

		// down arrow
		if(event.keyCode == 40 && cameraMoveable) {
			camera1.moveBackward();
		}

		// left arrow
		if(event.keyCode == 37 && cameraMoveable) {
			camera1.moveLeft();
		}

		// right arrow
		if(event.keyCode == 39 && cameraMoveable) {
			camera1.moveRight();
		}

		// z key
		if(event.keyCode == 90 && cameraMoveable) {
			camera1.rotateRight();
		}

		// a key
		if (event.keyCode == 65 && cameraMoveable) {
			camera1.rotateLeft();
		}

		// x key
		if (event.keyCode == 88 && cameraMoveable) {
			camera1.goDown();
		}

		// s key
		if (event.keyCode == 83 && cameraMoveable) {
			camera1.goUp();
		}

		// c key
		if (event.keyCode == 67 && cameraMoveable) {
			camera1.goRight();
		}

		// d key
		if (event.keyCode == 68 && cameraMoveable) {
			camera1.goLeft();
		}

		// spacebar
		if (event.keyCode == 32) {
			if (cameraMoveable) {
				camera1 = new Camera(vec3(0,4.5,4.5), vec3(1,0,0), vec3(0,Math.sqrt(2)/2,-Math.sqrt(2)/2), vec3(0,Math.sqrt(2)/2,Math.sqrt(2)/2));
			} else {
				camera1 = new Camera(vec3(0,0.5,2), vec3(1,0,0), vec3(0,1,0), vec3(0,0,1));
			}
			cameraMoveable = !cameraMoveable;
		}
	});
};

var directionX = 1;
var directionY = 1;
var step = 0;
var theta = 2.5;
function render(){
	setTimeout(function() {
		requestAnimationFrame(render);
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.disable(gl.DEPTH_TEST);
		room1.draw();
		gl.enable(gl.DEPTH_TEST);

		ground1.draw();

		platform1bottom.draw();
		platform1top.draw();
		buttonStand.draw();
		button.draw();

		platform2bottom.draw();
		platform2top.draw();

		platform3bottom.draw();
		platform3top.draw();

		platform4bottom.draw();
		platform4top.draw();

		platform5bottom.draw();
		platform5top.draw();

		smf1.rotateObject(theta);
		smf1.draw();

		smf2.rotateObject(theta);
		smf2.draw();

		smf3.rotateObject(theta);
		smf3.draw();

		smf4.rotateObject(theta);
		smf4.draw();

		if (showReflection) {
			orb.draw();
		}
	}, 100);
}


