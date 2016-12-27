 var netMap = {
     nodeTree: true,
     /**
      * 创建地图
      * @param  {[type]} centerPoint 地图中心点
      * @return {[type]}             [description]
      */
     createMap: function(centerPoint) {
         this.centerPoint = centerPoint || new NPMAP3D.Geometry.Point3D(101.8359071295526, 36.530410447258824, 100000);
         this.map = this.viewer = new NPMAP3D.MAP3D('viewerContainer', {
             //selectionIndicator: true,
             homeButton: false,
             terrainExaggeration: 1.0
         });
         /// this.map.viewer.camera.flyHome = this.gohome;

         var scene = this.map.viewer.scene;
         var handler = new Cesium.ScreenSpaceEventHandler(this.map.viewer.scene.canvas);
         var page = this.getQueryString('page') || "1";
         var test = this.getQueryString('test');
         if (test) {
             activeProject = function(msg) {
                 window.alert("标段" + msg);
             }
             clickProject = function(msg) {
                 window.alert("节点:" + msg);
             }
         }
         var viewer = this.map.viewer;
         if (page === "1") {
             // 双击显示模型的ID
             handler.setInputAction(function(position) {
                 var selected = scene.pick(position.position);
                 if (selected) {
                     window.selected = selected;
                     var id = (selected.id && selected.id._positionLay.id) || (selected.primitive._positionLay.id);
                     console.log(id);
                     if (typeof(activeProject) != "undefined") {
                         activeProject(id);
                     }
                     viewer.trackedEntity = selected.primitive;
                 } else {
                     viewer.trackedEntity = null;
                 }
                 return false;

             }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
         } else if (page === '2') {
             // 单击显示某标段的ID
             handler.setInputAction(function(position) {
                 var selected = scene.pick(position.position);
                 if (selected) {
                     console.log(selected.node.id);
                     window.selected = selected;
                     if (typeof(clickProject) != "undefined") {
                         clickProject(selected.node.id);
                     }
                     viewer.trackedEntity = selected.primitive;
                 } else {
                     viewer.trackedEntity = null;
                     typeof(clickProject) != "undefined" && clickProject(null);
                 }
                 return false;

             }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
         }
         this.gohome();
         this.registerEvent();
         return this.map;
     },
     /**
      * 新增图层
      */
     addLayer: function(url) {

         // var addedImageryLayer = new NPMAP3D.Layer.GoogleLayer('map/s/{z}/{x}/{y}.jpg', 'GOOGLE', {
         //     minimumLevel: 5,
         //     maximumLevel: 21
         // });
         // this.map.addLayer(addedImageryLayer);
         //  
         var addedImageryLayer = new NPMAP3D.Layer.GoogleLayer(url, 'GOOGLE', {
             minimumLevel: 0,
             maximumLevel: 19,
             //style: NPMAP3D.BaseMap.GOOGLE_ROAD
             //maximumTerrainLevel: 18,
             // minimumTerrainLevel:0,
             //rectangle: new NPMAP3D.Geometry.Extent(97.6979636816088, 34.16246365697366, 105.98924193032873, 39.55334308624505)
         });
         this.map.addLayer(addedImageryLayer);
     },
     /**
      * 回到初始位置
      * @return {[type]} [description]
      */
     gohome: function(callback) {
         netMap.map.flyTo(netMap.centerPoint, {
             time: 10
         }, callback);
     },
     /**
      * 增加地形数据
      * @return {[type]} [description]
      */
     addterrain: function() {
         // var terrainProvider = new Cesium.CesiumTerrainProvider({
         //     url: 'terrain_tiles20', //qianghai_
         //     requestVertexNormals: false
         // });
         var terrainProvider = new Cesium.CesiumTerrainProvider({
             url: 'https://assets.agi.com/stk-terrain/world', //'http://readymap.org/readymap/tiles/1.0.0/128/',//
             requestVertexNormals: false
         });

         // var terrainProvider = new Cesium.ArcGisImageServerTerrainProvider({
         //     url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer',
         //     //token: 'KED1aF_I4UzXOHy3BnhwyBHU4l5oY6rO6walkmHoYqGp4XyIWUd5YZUC1ZrLAzvV40pR6gBXQayh0eFA8m6vPg..',
         //     //proxy: new Cesium.DefaultProxy('/terrain/')
         // });

         // var terrainProvider = new Cesium.VRTheWorldTerrainProvider({
         //     url: 'http://www.vr-theworld.com/vr-theworld/tiles1.0.0/73/',
         //     credit: 'Terrain data courtesy VT MÄK'
         // });
         //var terrainProvider = new Cesium.EllipsoidTerrainProvider();
         netMap.map.viewer.scene.globe.depthTestAgainstTerrain = true;
         netMap.map.viewer.terrainProvider = terrainProvider;
         netMap.map.viewer.scene.globe.enableLighting = false;
         netMap.map.viewer.scene.fog.enabled = false;
     },
     /**
      * 加载模型
      * @param  {[type]} position          位置
      * @param  {[type]} url               模型URL
      * @param  {[type]} customerAttribute 自定义属性
      * @return {[type]}                   [description]
      */
     createModel: function(position, url, customerAttribute) {
         var tempPositon = position;
         var position = Cesium.Cartesian3.fromDegrees(position.lon, position.lat, 0);
         var heading = Cesium.Math.toRadians(0);
         var pitch = Cesium.Math.toRadians(0.0);
         var roll = 0.0;
         var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, heading, pitch, roll);
         var scene = this.map.viewer.scene;
         var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
             Cesium.Cartesian3.fromDegrees(tempPositon.lon, tempPositon.lat, tempPositon.height || 0));
         var model = scene.primitives.add(Cesium.Model.fromGltf({
             url: url,
             modelMatrix: modelMatrix,
             scale: customerAttribute.scale || 1
         }));
         // 
         //primitive._nodeCommands.forEach(function(v,i){nodes.push({name:v.pickCommand._owner.node.name,node:v.pickCommand._owner.node})})
         // var model = this.map.viewer.entities.add({
         //     name: url,
         //     position: position,
         //     orientation: orientation,
         //     model: {
         //         uri: url,
         //         //minimumPixelSize: 128,
         //         maximumScale: 2
         //     }
         // });
         // if (customerAttribute.nodes) {
         model.show = false;
         //customerAttribute.nodes 为null 则全部显示，为[] 则表示，只显示数组中的，其他不显示
         window.setTimeout(function() {
             (function(model) {
                 var nodes = {};
                 model._nodeCommands.forEach(function(v, i) {
                     if (netMap.nodeTree) {
                         var parents = v.pickCommand._owner.node._runtimeNode.parents;
                         for (var i = parents.length - 1; i >= 0; i--) {
                             if (!nodes[parents[i].publicNode.id]) {
                                 nodes[parents[i].publicNode.id] = {
                                     node: parents[i].publicNode,
                                     children: [v.pickCommand._owner.node]
                                 };
                             } else {
                                 nodes[parents[i].publicNode.id].children.push(v.pickCommand._owner.node);
                             }
                             parents[i].publicNode.show = customerAttribute.nodes ? false : true;
                         }
                     } else {
                         nodes[v.pickCommand._owner.node.id] = v.pickCommand._owner.node;
                         v.pickCommand._owner.node.show = customerAttribute.nodes ? false : true;
                     }
                 });
                 model.nodes = nodes;
                 if (customerAttribute.nodes) {
                     for (var i = customerAttribute.nodes.length - 1; i >= 0; i--) {
                         if (netMap.nodeTree) {
                             nodes[customerAttribute.nodes[i]] && (nodes[customerAttribute.nodes[i]].node.show = true);
                         } else {
                             nodes[customerAttribute.nodes[i]] && (nodes[customerAttribute.nodes[i]].show = true);
                         }
                     }
                 }
                 model.show = true;
             })(model)
         }, 1500);
         //}

         customerAttribute.position = tempPositon;
         model._positionLay = customerAttribute;
         return model;
     },
     requestModel: function(file, callback) {
         $.getJSON('data/' + file + "?v=" + new Date().getTime(), function(model) {
             callback(netMap.createModel(model, model.url, model), model);
         });
     },
     removeModel: function() {
         this.map.viewer.scene.primitives.removeAll();
     },
     lookAround: function(range) {

     },
     registerEvent: function() {
         var button = {
             "zoomin": "放大",
             "zoomout": "缩小",
             "rotate": "旋转",
             "tilt": "倾斜",
             "ortho": "鸟瞰",
             "lightsOff": "关灯",
             "lights": "开灯",
             "lightbulb": "全图"
         };

         this.createClickButton("zoomIn", "fa-plus", button.zoomin);
         this.createClickButton("zoomOut", "fa-minus", button.zoomout);
         this.createClickButton("rotateLeft", "fa-repeat", button.rotate);
         this.createClickButton("rotateRight", "fa-undo", button.rotate);
         this.createClickButton("rotateUp", "fa-arrows-v", button.tilt);
         this.createClickButton("ortho", "fa-th-large", button.ortho);
         this.createClickButton("lights", "lights", button.lightbulb);


     },
     createClickButton: function(button, cssName, title) {
         $("." + button, $(".ButtonDiv")).attr('title', title).on('mouseenter', function() {

         }).on("mouseleave", function() {

         }).click(function() {
             switch (button) {
                 case "zoomIn":
                     netMap.map.viewer.camera.zoomIn();
                     break;
                 case "zoomOut":
                     netMap.map.viewer.camera.zoomOut();
                     break;
                 case "rotateLeft":
                     break;
                 case "rotateRight":
                     break;
                 case "rotateUp":
                     break;
                 case "ortho":
                     netMap.gohome();
                     break;
                 case "lights":
                     netMap.map.viewer.camera.flyHome();
                     break;
                 default:
                     break;
             }
         });
     },
     getQueryString: function(name) {
         var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
         var r = window.location.search.substr(1).match(reg);
         if (r != null) return unescape(r[2]);
         return null;
     },
     loadTest: function() {
         this.removeModel();
         var customerAttribute = {
                 "id": "3",
                 "url": "model/qinghai_1.gltf",
                 lat:36.656402701296095,
                 lon:101.44785242332834,
                 "height": 10,
                 "nodes": null,
                 "scale": 0.025
             },
             url = customerAttribute.url,
             position = {
                 "lon": customerAttribute.lon,
                 "lat": customerAttribute.lat,
                 h:customerAttribute.height
             };
         var tempPositon = position;
         var position = Cesium.Cartesian3.fromDegrees(position.lon, position.lat, position.h);
         var heading = Cesium.Math.toRadians(-270);
         var pitch = Cesium.Math.toRadians(0);
         var roll = Cesium.Math.toRadians(180);
         var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, heading, pitch, roll);
         var scene = this.map.viewer.scene;
         var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
             Cesium.Cartesian3.fromDegrees(tempPositon.lon, tempPositon.lat, tempPositon.height || 0));

         var model = this.map.viewer.entities.add({
             name: url,
             position: position,
             orientation: orientation,
             model: {
                 uri: url,
                 scale: customerAttribute.scale || 1
             }
         });
         //this.map.viewer.trackedEntity = model;
         customerAttribute.position = tempPositon;
         model._positionLay = customerAttribute;
         return model;
     },
     crateMarker: function(pt, title) {
         pt = pt || this.map.getCenter();
         var pinBuilder = new Cesium.PinBuilder();
         // if (!this.overlayLayer) {
         //     this.overlayLayer = new NPMAP3D.Layer.OverlayLayer('defaultOverLayLayer2');
         //     this.map.addOverlayLayer(this.overlayLayer);
         // }

         // var marker = new NPMAP3D.Overlay.Marker(pt, {
         //     image: pinBuilder.fromText(title || 'A', Cesium.Color.RED, 32).toDataURL(),
         //     width: 32,
         //     height: 32
         // });
         // this.overlayLayer.addOverlay(marker);
         var t = NPMAP3D.NPCoordinate.coordinateTransByBasemap(pt.lon, pt.lat);
         var position = Cesium.Cartesian3.fromDegrees(t.lon, t.lat, pt.h || 0);
         var marker = this.map.viewer.entities.add({
             position: position,
             billboard: {
                 image: pinBuilder.fromText(title || 'A', Cesium.Color.RED, 32).toDataURL(),
                 width: 32,
                 height: 32
             }
         });
         return marker;
     },
     addMarkers: function() {
         var points = [{
             lon: 101.434346,
             lat: 36.659984,
             h: 2400,
             title: 'A'
         }, {
             lon: 101.416501,
             lat: 36.669277,
             h: 2600,
             title: 'B'
         }, {
             lon: 101.403986,
             lat: 36.668913,
             h: 2800,
             title: 'C'
         }, {
             lon: 101.372745,
             lat: 36.676674,
             h: 3000,
             title: 'D'
         }];

         for (var i = points.length - 1; i >= 0; i--) {
             this.crateMarker(points[i], points[i].title);
         }

     },
     loadKmz: function(url) {
         this.removeModel();
         // $.ajaxTransport("+binary", function(options, originalOptions, jqXHR) {
         //     // check for conditions and support for blob / arraybuffer response type
         //     if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob))))) {
         //         return {
         //             // create new XMLHttpRequest
         //             send: function(headers, callback) {
         //                 // setup all variables
         //                 var xhr = new XMLHttpRequest(),
         //                     url = options.url,
         //                     type = options.type,
         //                     async = options.async || true,
         //                     // blob or arraybuffer. Default is blob
         //                     dataType = options.responseType || "blob",
         //                     data = options.data || null,
         //                     username = options.username || null,
         //                     password = options.password || null;

         //                 xhr.addEventListener('load', function() {
         //                     var data = {};
         //                     data[options.dataType] = xhr.response;
         //                     // make callback and send data
         //                     callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
         //                 });

         //                 xhr.open(type, url, async, username, password);

         //                 // setup custom headers
         //                 for (var i in headers) {
         //                     xhr.setRequestHeader(i, headers[i]);
         //                 }

         //                 xhr.responseType = dataType;
         //                 xhr.send(data);
         //             },
         //             abort: function() {
         //                 jqXHR.abort();
         //             }
         //         };
         //     }
         // });
         // $.ajax({
         //     url: "model/gdpPerCapita2008.kmz",
         //     type: "GET",
         //     dataType: "binary",
         //     processData: false,
         //     success: function(result) {
         //         // console.log('ok')
         //         netMap.map.viewer.dataSources.add(new Cesium.KmlDataSource().load(result));
         //     }
         // });
         var viewer = this.map.viewer;
         var options = {
             camera: viewer.scene.camera,
             canvas: viewer.scene.canvas
         };
         url = "model/qinghai.kmz";
         return this.map.viewer.dataSources.add(new Cesium.KmlDataSource().load(url || 'model/gdpPerCapita2008.kmz'));
     }

 }