const canvas = document.getElementById('map');
const map = new harp.MapView({
   canvas,
   theme: "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_night_reduced.json",
   //For tile cache optimization:
   //projection: harp.sphereProjection,
   maxVisibleDataSourceTiles: 40, 
   tileCacheSize: 100
});

map.setCameraGeolocationAndZoom(
   new harp.GeoCoordinates(1.278676, 103.850216),
   16
);

const mapControls = new harp.MapControls(map);
const ui = new harp.MapControlsUI(mapControls);
canvas.parentElement.appendChild(ui.domElement);
mapControls.maxPitchAngle = 90;
mapControls.setRotation(6.3, 50);

// const controls = new GlobeControls(map);
// controls.enabled = true;

map.resize(window.innerWidth, window.innerHeight);
window.onresize = () => map.resize(window.innerWidth, window.innerHeight);

const omvDataSource = new harp.OmvDataSource({
   baseUrl: "https://xyz.api.here.com/tiles/herebase.02",
   apiFormat: harp.APIFormat.XYZOMV,
   styleSetName: "tilezen",
   authenticationCode: 'AAcS3KhZt_eW80bB6e6wj2E',
});
map.addDataSource(omvDataSource);

// const options = { tilt: 45, distance: 3000 };
// const coordinates = new harp.GeoCoordinates(1.278676, 103.850216);
// let azimuth = 300;
// map.addEventListener(harp.MapViewEventNames.Render, () => {
//    map.lookAt(coordinates, options.distance, options.tilt, (azimuth += 0.1))
// });
// map.beginAnimation();

//setTimeout(function(){map.endAnimation()},3000);

// fetch('wireless-hotspots.geojson')
// .then(data => data.json())
// .then(data => {
//    const geoJsonDataProvider = new harp.GeoJsonDataProvider("wireless-hotspots", data);
//    const geoJsonDataSource = new harp.OmvDataSource({
//       dataProvider: geoJsonDataProvider,
//       name: "wireless-hotspots",
//       //styleSetName: "wireless-hotspots" NOTE: Not necessary here. For use if you want to add your style rules in the external stylesheet.
//    });

//    map.addDataSource(geoJsonDataSource).then(() => {
//       const styles = [{
//          when: "$geometryType == 'point'",
//          technique: "circles",
//          renderOrder: 10000,
//          attr: {
//             color: "#7ED321",
//             size: 15
//          }
//       }]
//       geoJsonDataSource.setStyleSet(styles);
//       map.update();
//    });
// })

const globalRailroads = new harp.OmvDataSource({
   baseUrl: "https://xyz.api.here.com/hub/spaces/hUJ4ZHJR/tile/web",
   apiFormat: harp.APIFormat.XYZSpace,
   authenticationCode: 'AJXABoLRYHN488wIHnxheik', //Use this token!
});

map.addDataSource(globalRailroads).then(() => {
   const styles = [{
      "when": "$geometryType ^= 'line'",
      "renderOrder": 1000,
      "technique": "solid-line",
      "attr": {
         "color": "red",
         "transparent": true,
         "opacity": 1,
         "metricUnit": "Pixel",
         "lineWidth": 1
      }
   }]

   globalRailroads.setStyleSet(styles);
   map.update();
});

canvas.onclick = evt => {
   const geometry = new THREE.BoxGeometry(100, 100, 100);
   const material = new THREE.MeshStandardMaterial({ color: 0x00ff00fe });
   const cube = new THREE.Mesh(geometry, material);
   cube.renderOrder = 100000;

   const geoPosition = map.getGeoCoordinatesAt(evt.pageX, evt.pageY);
   cube.geoPosition = geoPosition;
   map.mapAnchors.add(cube);
   map.update();
}

const clock = new THREE.Clock();
let mixer;

//Initialize the loader
const loader = new THREE.FBXLoader();
loader.load('dancing.fbx', (obj) => {
   mixer = new THREE.AnimationMixer(obj);

   const action = mixer.clipAction(obj.animations[0]);
   action.play();

   obj.traverse(child => child.renderOrder = 10000);
   obj.renderOrder = 10000;
   obj.rotateX(Math.PI / 2);
   obj.scale.set(2.3, 2.3, 2.3);
   obj.name = "human";

   //Assign the coordinates to the obj
   obj.geoPosition = new harp.GeoCoordinates(1.285166, 103.863233);
   map.mapAnchors.add(obj);
});

map.addEventListener(harp.MapViewEventNames.Render, () => {
   if (mixer) {
      const delta = clock.getDelta();
      mixer.update(delta);
   }
});
map.beginAnimation();