class Orb extends Drawable{
    static vertexPositions = [];
    static vertexColors = [];
    
    static vertexNormals = [];

    static indices = [];

    static positionBuffer = -1;
    static colorBuffer = -1;
    static indexBuffer = -1;
    static normalBuffer = -1;
    
    static shaderProgram = -1;
    static aPositionShader = -1;
    static aColorShader = -1;
    static aNormalShader = -1;
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;
    
    static uMatAmbientShader = -1;
    static uMatDiffuseShader = -1;
    static uMatSpecularShader = -1;
    static uMatAlphaShader = -1;
    
    static uLightDirectionShader = -1;
    static uLightAmbientShader = -1;
    static uLightDiffuseShader = -1;
    static uLightSpecularShader = -1;

	static uSLightDirectionShader = -1;
    static uSLightAmbientShader = -1;
    static uSLightDiffuseShader = -1;
    static uSLightSpecularShader = -1;
    
    static computeNormals(){
		var normalSum = [];
		var counts = [];
		
		//initialize sum of normals for each vertex and how often its used.
		for (var i = 0; i<Orb.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}
		
		//for each triangle
		for (var i = 0; i<Orb.indices.length; i+=3) {
			var a = Orb.indices[i];
			var b = Orb.indices[i+1];
			var c = Orb.indices[i+2];
			
			var edge1 = subtract(Orb.vertexPositions[b],Orb.vertexPositions[a])
			var edge2 = subtract(Orb.vertexPositions[c],Orb.vertexPositions[b])
			var N = cross(edge1,edge2)
			
			normalSum[a] = add(normalSum[a],normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b],normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c],normalize(N));
			counts[c]++;
		
	}
		
	for (var i = 0; i < Orb.vertexPositions.length; i++)
	    this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
    }

	static initializeTexture(){
		var texsize = 256;
		Orb.envTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, Orb.envTexture);
		
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, texsize, texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, texsize, texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, texsize, texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, texsize, texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, texsize, texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, texsize, texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);

		Orb.envFrameBuffer = gl.createFramebuffer();
		Orb.envFrameBuffer.width = texsize;
		Orb.envFrameBuffer.height = texsize;
		gl.bindFramebuffer(gl.FRAMEBUFFER, Orb.envFrameBuffer);

		Orb.envRenderBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, Orb.envRenderBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, texsize, texsize);

		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, Orb.envRenderBuffer);

		gl.bindFramebuffer(gl.FRAMEBUFFER, null); //restore to window frame/depth buffer
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	}

	static createEnvironmentMap(){
		var texsize = 256;
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.envFrameBuffer);
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.envRenderBuffer);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP,this.envTexture);

		var origu = vec3(camera1.u);
		var origv = vec3(camera1.v);
		var orign = vec3(camera1.n);
		var origvrp = vec3(camera1.vrp);
		var viewportParams = gl.getParameter(gl.VIEWPORT);

		gl.viewport(0,0, texsize, texsize);

		camera1.projectionMatrix = perspective(90, 1.0, 0.1, 100);
		camera1.vrp = vec3(this.tx,this.ty,this.tz);

		for(var j = 0; j < 6; j++){
			gl.bindTexture(gl.TEXTURE_CUBE_MAP,this.envTexture);
			switch(j){
				case 0: //-z
					console.log('helo');
					camera1.u = vec3(-1,0,0);
					camera1.v = vec3(0,-1,0);
					camera1.n = vec3(0,0,1);
					gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, this.envTexture, 0);
					break;
					//etc..
				default:
					console.log('next');
			}
			camera1.updateCameraMatrix();
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
			for(var i = 0; i < objects.length; i++){
				// if(objects[i]!=this)
					objects[i].draw();}
		}

			//the regular rendering
		camera1.u = origu;
		camera1.v = origv;
		camera1.n = orign;
		camera1.vrp = origvrp;
		camera1.updateCameraMatrix();

		camera1.projectionMatrix = perspective(90,1.0,0.1,10);
		
		gl.viewport( viewportParams[0], viewportParams[1], viewportParams[2], viewportParams[3]);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	} //end method
	

    
    static initialize() {
		var colors = [
            vec4(1.0, 0.0, 0.0, 1.0),  // red
            vec4(1.0, 0.0, 1.0, 1.0),  // magenta
            vec4(1.0, 1.0, 1.0, 1.0),  // white
            vec4(1.0, 1.0, 0.0, 1.0),  // yellow
            vec4(0.0, 0.0, 0.0, 1.0),  // black
            vec4(0.0, 0.0, 1.0, 1.0),  // blue
            vec4(0.0, 1.0, 1.0, 1.0),  // cyan
            vec4(0.0, 1.0, 0.0, 1.0)   // green
        ];
        var fname = "bound-lo-sphere.smf";
        var smf_file = loadFileAJAX(fname); 
		var lines = smf_file.split('\n');
		for(var line = 0; line < lines.length; line++){
			var strings = lines[line].trimRight().split(' ');
			if (strings[0] == "v"){
				var vertex = vec3(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3]));
				Orb.vertexPositions.push(vertex);
                Orb.vertexColors.push(vec4(1.0, 1.0, 0.0, 1.0));
			} else if (strings[0] == "f") {
                Orb.indices.push(parseInt(strings[1])-1);
                Orb.indices.push(parseInt(strings[2])-1);
                Orb.indices.push(parseInt(strings[3])-1);
			}
		}
        Orb.computeNormals();
    	Orb.shaderProgram = initShaders( gl, "/vshader_orb.glsl", "/fshader_orb.glsl");
    	gl.useProgram(Orb.shaderProgram );
		
		// Load the data into the GPU
		Orb.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Orb.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Orb.vertexPositions), gl.STATIC_DRAW );
		
		Orb.colorBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Orb.colorBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Orb.vertexColors), gl.STATIC_DRAW );
		
		Orb.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Orb.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Orb.vertexNormals), gl.STATIC_DRAW );
		
		Orb.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Orb.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(Orb.indices), gl.STATIC_DRAW );
			
		// Associate our shader variables with our data buffer
		Orb.aPositionShader = gl.getAttribLocation( Orb.shaderProgram, "aPosition" );
		Orb.aColorShader = gl.getAttribLocation( Orb.shaderProgram, "aColor" );
		Orb.aNormalShader = gl.getAttribLocation( Orb.shaderProgram, "aNormal" );
		
		Orb.uModelMatrixShader = gl.getUniformLocation( Orb.shaderProgram, "modelMatrix" );
		Orb.uCameraMatrixShader = gl.getUniformLocation( Orb.shaderProgram, "cameraMatrix" );
		Orb.uProjectionMatrixShader = gl.getUniformLocation( Orb.shaderProgram, "projectionMatrix" );
		
		Orb.uMatAmbientShader = gl.getUniformLocation( Orb.shaderProgram, "matAmbient" );
		Orb.uMatDiffuseShader = gl.getUniformLocation( Orb.shaderProgram, "matDiffuse" );
		Orb.uMatSpecularShader = gl.getUniformLocation( Orb.shaderProgram, "matSpecular" );
		Orb.uMatAlphaShader = gl.getUniformLocation( Orb.shaderProgram, "matAlpha" );
		
		Orb.uLightDirectionShader = gl.getUniformLocation( Orb.shaderProgram, "lightDirection" );
		Orb.uLightAmbientShader = gl.getUniformLocation( Orb.shaderProgram, "lightAmbient" );
		Orb.uLightDiffuseShader = gl.getUniformLocation( Orb.shaderProgram, "lightDiffuse" );
		Orb.uLightSpecularShader = gl.getUniformLocation( Orb.shaderProgram, "lightSpecular" );

		Orb.uSLightDirectionShader = gl.getUniformLocation( Orb.shaderProgram, "SlightDirection" );
		Orb.uSLightAmbientShader = gl.getUniformLocation( Orb.shaderProgram, "SlightAmbient" );
		Orb.uSLightDiffuseShader = gl.getUniformLocation( Orb.shaderProgram, "SlightDiffuse" );
		Orb.uSLightSpecularShader = gl.getUniformLocation( Orb.shaderProgram, "SlightSpecular" );
		
    }
    	
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Orb.shaderProgram == -1)
            Orb.initialize()
			Orb.initializeTexture()
    }
    
    draw() {
    
        gl.useProgram(Orb.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Orb.positionBuffer);
       	gl.vertexAttribPointer(Orb.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, Orb.colorBuffer);
       	gl.vertexAttribPointer(Orb.aColorShader, 4, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, Orb.normalBuffer);
       	gl.vertexAttribPointer(Orb.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
       	
		// Orb.createEnvironmentMap();

		gl.uniformMatrix4fv(Orb.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(Orb.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
		gl.uniformMatrix4fv(Orb.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));
		
		gl.uniform4fv(Orb.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Orb.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Orb.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Orb.uMatAlphaShader, this.matAlpha);
		
		
		gl.uniform3fv(Orb.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Orb.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(Orb.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Orb.uLightSpecularShader, light1.specular);

		gl.uniform3fv(Orb.uSLightDirectionShader, light2.direction);
		gl.uniform4fv(Orb.uSLightAmbientShader, light2.ambient);
		gl.uniform4fv(Orb.uSLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(Orb.uSLightSpecularShader, light2.specular);
		
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Orb.indexBuffer);
	
		gl.enableVertexAttribArray(Orb.aPositionShader);    
		gl.enableVertexAttribArray(Orb.aColorShader);
		gl.enableVertexAttribArray(Orb.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, Orb.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(Orb.aPositionShader);    
    	gl.disableVertexAttribArray(Orb.aColorShader);    
    	gl.disableVertexAttribArray(Orb.aNormalShader);    
    }
}

