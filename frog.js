class Frog extends Drawable{
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

	static uSpotlightDirectionShader = -1;
    static uSpotlightAmbientShader = -1;
    static uSpotlightDiffuseShader = -1;
    static uSpotlightSpecularShader = -1;

    static texture = -1;
    static uTextureUnitShader = -1;
    
    static computeNormals(){
		var normalSum = [];
		var counts = [];
		
		//initialize sum of normals for each vertex and how often its used.
		for (var i = 0; i<Frog.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}
	
		//for each triangle
		for (var i = 0; i<Frog.indices.length; i+=3) {
			var a = Frog.indices[i];
			var b = Frog.indices[i+1];
			var c = Frog.indices[i+2];
			
			var edge1 = subtract(Frog.vertexPositions[b],Frog.vertexPositions[a])
			var edge2 = subtract(Frog.vertexPositions[c],Frog.vertexPositions[b])
			var N = cross(edge1,edge2)
			
			normalSum[a] = add(normalSum[a],normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b],normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c],normalize(N));
			counts[c]++;
	
		}
		
		for (var i = 0; i < Frog.vertexPositions.length; i++) {
			this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
		}
    }

	static initializeTexture(){
        var image1 = new Image();

        image1.onload = function(){
            Frog.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Frog.texture);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);

			Frog.imagesLoaded = 6;
            
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
        }
        
        image1.src = Frog.fname;
    }

    
    static initialize() {
		var Frog_file = loadFileAJAX("frog.smf");
		var lines = Frog_file.split('\n');
		for(var line = 0; line < lines.length; line++){
			var strings = lines[line].trimRight().split(' ');
			switch(strings[0]){
				case('v'):
					Frog.vertexPositions.push(vec3(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3])));
					Frog.vertexColors.push(vec4(1.0, 1.0, 0.0, 1.0));
					break;
				case('f'):
					Frog.indices.push(parseInt(strings[1])-1);
					Frog.indices.push(parseInt(strings[2])-1);
					Frog.indices.push(parseInt(strings[3])-1);
					break;
			}
		}

        Frog.computeNormals();
    	Frog.shaderProgram = initShaders( gl, "/vshader_cube.glsl", "/fshader_cube.glsl");
    	gl.useProgram(Frog.shaderProgram );
		
		// Load the data into the GPU
		Frog.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Frog.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Frog.vertexPositions), gl.STATIC_DRAW );
		
		Frog.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Frog.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Frog.vertexNormals), gl.STATIC_DRAW );
		
		Frog.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Frog.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(Frog.indices), gl.STATIC_DRAW );

		Frog.uTextureUnitShader = gl.getUniformLocation(Frog.shaderProgram, "uTextureUnit");
			
		// Associate our shader variables with our data buffer
		Frog.aPositionShader = gl.getAttribLocation( Frog.shaderProgram, "aPosition" );
		// Frog.aColorShader = gl.getAttribLocation( Frog.shaderProgram, "aColor" );
		Frog.aNormalShader = gl.getAttribLocation( Frog.shaderProgram, "aNormal" );
		
		Frog.uModelMatrixShader = gl.getUniformLocation( Frog.shaderProgram, "modelMatrix" );
		Frog.uCameraMatrixShader = gl.getUniformLocation( Frog.shaderProgram, "cameraMatrix" );
		Frog.uProjectionMatrixShader = gl.getUniformLocation( Frog.shaderProgram, "projectionMatrix" );
		
		Frog.uMatAmbientShader = gl.getUniformLocation( Frog.shaderProgram, "matAmbient" );
		Frog.uMatDiffuseShader = gl.getUniformLocation( Frog.shaderProgram, "matDiffuse" );
		Frog.uMatSpecularShader = gl.getUniformLocation( Frog.shaderProgram, "matSpecular" );
		Frog.uMatAlphaShader = gl.getUniformLocation( Frog.shaderProgram, "matAlpha" );
		
		Frog.uLightDirectionShader = gl.getUniformLocation( Frog.shaderProgram, "lightDirection" );
		Frog.uLightAmbientShader = gl.getUniformLocation( Frog.shaderProgram, "lightAmbient" );
		Frog.uLightDiffuseShader = gl.getUniformLocation( Frog.shaderProgram, "lightDiffuse" );
		Frog.uLightSpecularShader = gl.getUniformLocation( Frog.shaderProgram, "lightSpecular" );

		Frog.uSpotlightDirectionShader = gl.getUniformLocation( Frog.shaderProgram, "spotlightDirection" );
		Frog.uSpotlightAmbientShader = gl.getUniformLocation( Frog.shaderProgram, "spotlightAmbient" );
		Frog.uSpotlightDiffuseShader = gl.getUniformLocation( Frog.shaderProgram, "spotlightDiffuse" );
		Frog.uSpotlightSpecularShader = gl.getUniformLocation( Frog.shaderProgram, "spotlightSpecular" );
	
    }
    	
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh,fname){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
		Frog.fname = fname;
        if(Frog.shaderProgram == -1)
            Frog.initialize()
			Frog.initializeTexture();

        
    }
    
    draw() {

		if (Frog.texture == -1 && Frog.imagesLoaded != 6) {
			return;
		}
    
        gl.useProgram(Frog.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Frog.positionBuffer);
       	gl.vertexAttribPointer(Frog.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, Frog.normalBuffer);
       	gl.vertexAttribPointer(Frog.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
       	
		gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, Frog.texture);
       	gl.uniform1i(Frog.uTextureUnitShader,0);

		gl.uniformMatrix4fv(Frog.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(Frog.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
		gl.uniformMatrix4fv(Frog.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));
		
		gl.uniform4fv(Frog.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Frog.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Frog.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Frog.uMatAlphaShader, this.matAlpha);
		
		
		gl.uniform3fv(Frog.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Frog.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(Frog.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Frog.uLightSpecularShader, light1.specular);

		gl.uniform3fv(Frog.uSpotlightDirectionShader, light2.direction);
		gl.uniform4fv(Frog.uSpotlightAmbientShader, light2.ambient);
		gl.uniform4fv(Frog.uSpotlightDiffuseShader, light2.diffuse);
		gl.uniform4fv(Frog.uSpotlightSpecularShader, light2.specular);
			
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Frog.indexBuffer);
		
		gl.enableVertexAttribArray(Frog.aPositionShader);    
		gl.enableVertexAttribArray(Frog.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, Frog.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(Frog.aPositionShader);    
    	gl.disableVertexAttribArray(Frog.aNormalShader);    
    }
}

