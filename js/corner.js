/// <reference path='./babylonjs/babylon.d.ts' />

function generateCorner(H, W2, W3, W4, W5, grdTexture, wallTexture) {
  var W = W3 + W5;
  var L = W2 + W4;

  const canvas = document.getElementById("renderCanvas");
  // Generate the BABYLON 3D engine
  var engine = new BABYLON.Engine(canvas, true);

  function createScene() {
    // create a scene
    const scene = new BABYLON.Scene(engine);
    //scene.clearColor = BABYLON.Color3.Blue();
    scene.ambientColor = new BABYLON.Color3(26, 26, 51);
    console.log(scene.clearColor);

    // create a camera
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2,
      10,
      new BABYLON.Vector3(0, 0, 0),
      scene
    );
    // const camera = new BABYLON.FreeCamera('camera', scene);

    // move the camera around
    camera.attachControl(canvas, true);

    // create a light
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, H, 0),
      scene
    );

    var corner = function (x, y) {
      return new BABYLON.Vector3(x, 0, y);
    };

    var wall = function (corner) {
      this.corner = corner;
    };

    var buildFromPlan = function (ground, walls, ply, H, options, scene) {
      // outside base
      var outerData = [];
      var angle = 0;
      var direction = 0;
      var line = BABYLON.Vector3.Zero();

      // turn the wall black and dynamic
      /* walls[1].corner.subtractToRef(walls[0].corner, line); */

      var nextLine = BABYLON.Vector3.Zero();
      // subtract the wall 1 from wall 2 which gives intersection line between them
      /* walls[2].corner.subtractToRef(walls[1].corner, nextLine); */

      var nbWalls = walls.length;
      for (var w = 0; w <= nbWalls; w++) {
        // The arccosine (angle in radians) of the given number if it's between -1 and 1; otherwise, NaN.
        // -1 = 180°   0 = 90°   1 = 0°
        angle = Math.acos(
          BABYLON.Vector3.Dot(line, nextLine) /
            (line.length() * nextLine.length())
        );
        direction = BABYLON.Vector3.Cross(nextLine, line).normalize().y;
        lineNormal = new BABYLON.Vector3(line.z, 0, -1 * line.x).normalize();
        line.normalize();
        outerData[(w + 1) % nbWalls] = walls[(w + 1) % nbWalls].corner
          .add(lineNormal.scale(ply))
          .add(line.scale((direction * ply) / Math.tan(angle / 2)));
        line = nextLine.clone();
        /* walls[(w + 3) % nbWalls].corner.subtractToRef(walls[(w + 2) % nbWalls].corner, nextLine); */
      }

      var positions = [];
      var indices = [];

      for (var w = 0; w < nbWalls; w++) {
        positions.push(walls[w].corner.x, walls[w].corner.y, walls[w].corner.z); // inner corners base
      }

      for (var w = 0; w < nbWalls; w++) {
        positions.push(outerData[w].x, outerData[w].y, outerData[w].z); // outer corners base
      }

      for (var w = 0; w < nbWalls; w++) {
        indices.push(
          w,
          (w + 1) % nbWalls,
          nbWalls + ((w + 1) % nbWalls),
          w,
          nbWalls + ((w + 1) % nbWalls),
          w + nbWalls
        ); // base indices
      }

      var currentLength = positions.length; // inner and outer top corners 2*(4*3)=24
      for (var w = 0; w < currentLength / 3; w++) {
        //currentlength*3 = 8 corners in and out
        positions.push(positions[3 * w]);
        positions.push(H);
        positions.push(positions[3 * w + 2]);
      }

      currentLength = indices.length;
      for (var i = 0; i < currentLength / 3; i++) {
        indices.push(
          indices[3 * i + 2] + 2 * nbWalls,
          indices[3 * i + 1] + 2 * nbWalls,
          indices[3 * i] + 2 * nbWalls
        ); // top indices
      }

      for (var w = 0; w < nbWalls; w++) {
        indices.push(
          w,
          w + 2 * nbWalls,
          ((w + 1) % nbWalls) + 2 * nbWalls,
          w,
          ((w + 1) % nbWalls) + 2 * nbWalls,
          (w + 1) % nbWalls
        ); // inner wall indices
        indices.push(
          ((w + 1) % nbWalls) + 3 * nbWalls,
          w + 3 * nbWalls,
          w + nbWalls,
          ((w + 1) % nbWalls) + nbWalls,
          ((w + 1) % nbWalls) + 3 * nbWalls,
          w + nbWalls
        ); // outer wall indices
      }

      //Empty array to contain calculated values or normals added
      var normals = [];

      var uvs = [];
      //take uv value relative to bottom left corner of roof (-15/2, -10/2) noting length and width of roof is 15,10
      // base uv value on the x, z coordinates only
      // (x, z) = (15, 10)
      for (var p = 0; p < positions.length / 18; p++) {
        // 18=3coordinates*6corners
        uvs.push(
          (positions[3 * p + 0] - -W / 2) / L,
          -(positions[3 * p + 1] - W / 2) / L
        );

        uvs.push(
          (positions[3 * p + 0] - -W / 2) / L,
          (positions[3 * p + 1] - W / 2) / L
        );

        uvs.push(
          (positions[3 * p + 0] - -W / 2) / L,
          -(positions[3 * p + 1] - W / 2) / L
        );

        uvs.push(
          (positions[3 * p + 0] - -W / 2) / L,
          (positions[3 * p + 1] - W / 2) / L
        );

        uvs.push(
          (positions[3 * p + 0] - -W / 2) / L,
          -(positions[3 * p + 1] - W / 2) / L
        );

        uvs.push(
          (positions[3 * p + 0] - -W / 2) / L,
          (positions[3 * p + 1] - W / 2) / L
        );

        /* uvs.push(
				0,1,-0,-0.5,0,1,0,-0.5,
				1,1,-0,-0.5,1,1,0,-0.5,
			);*/
        //uvs.push((positions[3 * p + 0]), (positions[3 * p + 1]));
      }

      console.log(outerData);
      console.log(walls);
      console.log(positions);
      console.log(uvs);

      BABYLON.VertexData.ComputeNormals(positions, indices, normals);
      BABYLON.VertexData._ComputeSides(
        BABYLON.Mesh.FRONTSIDE,
        positions,
        indices,
        normals,
        uvs
      );

      //Create a custom mesh
      var customMesh = new BABYLON.Mesh("custom", scene);

      //Create a vertexData object
      var vertexData = new BABYLON.VertexData();

      //Assign positions and indices to vertexData
      vertexData.positions = positions;
      vertexData.indices = indices;
      vertexData.normals = normals;
      vertexData.uvs = uvs;

      //Apply vertexData to custom mesh
      vertexData.applyToMesh(customMesh);
      customMesh.convertToFlatShadedMesh();

      var mat1 = new BABYLON.StandardMaterial("mat1", scene);
      //mat1.diffuseColor = new BABYLON.Color3(1, 1, 0);
      var texture1 = new BABYLON.Texture("../assets/" + wallTexture, scene);
      // texture.uScale = 10;
      // texture.vScale = 10;
      mat1.ambientTexture = texture1;

      customMesh.material = mat1;

      return customMesh;
    };

    var baseData = [
      -W / 2,
      -L / 2,
      W / 2,
      -L / 2,
      W / 2,
      -L / 2 + W2,
      W / 2 - W3,
      -L / 2 + W2,
      W / 2 - W3,
      L / 2,
      -W / 2,
      L / 2,
    ];

    var corners = [];
    for (b = 0; b < baseData.length / 2; b++) {
      corners.push(new corner(baseData[2 * b], baseData[2 * b + 1]));
    }

    var walls = [];
    for (c = 0; c < corners.length; c++) {
      walls.push(new wall(corners[c]));
    }

    var ply = 0;
    // var height = 5;
    var shape = [
      new BABYLON.Vector3(-W / 2, 0, -L / 2),
      new BABYLON.Vector3(W / 2, 0, -L / 2),
      new BABYLON.Vector3(W / 2, 0, -L / 2 + W2),
      new BABYLON.Vector3(W / 2 - W3, 0, -L / 2 + W2),
      new BABYLON.Vector3(W / 2 - W3, 0, L / 2),
      new BABYLON.Vector3(-W / 2, 0, L / 2),
    ];
    var ground = BABYLON.MeshBuilder.ExtrudePolygon(
      "polygon",
      { shape: shape, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
      scene
    );
    var mat0 = new BABYLON.StandardMaterial("mat0", scene);
    //mat0.diffuseColor = new BABYLON.Color3(1, 1, 0);
    var texture0 = new BABYLON.Texture("../assets/" + grdTexture, scene);
    //texture0.uScale = 10;
    // texture0.vScale = 10;
    mat0.ambientTexture = texture0;
    ground.material = mat0;

    var build = buildFromPlan(ground, walls, ply, H, scene);

    return scene;
  }

  // create our scene
  const scene = createScene();

  engine.runRenderLoop(() => {
    // function gonna be called every single loops to draw our world
    scene.render();
  });

  /*
document.getElementById('width').value = "";
document.getElementById('length').value = "";
document.getElementById('height').value = "";
*/
}
