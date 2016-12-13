 var netMap = {
     /**
      * 创建地图
      * @param  {[type]} centerPoint 地图中心点
      * @return {[type]}             [description]
      */
     createMap: function(centerPoint) {
         this.centerPoint = centerPoint || new NPMAP3D.Geometry.Point3D(101.8359071295526, 36.530410447258824, 100000);
         this.map = this.viewer = new NPMAP3D.MAP3D('viewerContainer', {
             selectionIndicator: true,
             homeButton: true
         });
         this.map.viewer.camera.flyHome = this.gohome;

         var scene = this.map.viewer.scene;
         var handler = new Cesium.ScreenSpaceEventHandler(this.map.viewer.scene.canvas);
         handler.setInputAction(function(position) {
             var selected = scene.pick(position.position);
             if (selected) {
                 window.selected = selected;
                 if (typeof(activeProject) != "undefined") {
                     activeProject(selected.id._positionLay.id || selected.primitive._positionLay.id);
                 }
             }

         }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
         this.gohome();
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
             maximumLevel: 21,
             minimumTerrainLevel: 10,
             //maximumTerrainLevel:21,
             rectangle: new NPMAP3D.Geometry.Extent(97.6979636816088, 34.16246365697366, 105.98924193032873, 39.55334308624505)
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
         var terrainProvider = new Cesium.CesiumTerrainProvider({
             url: 'terrain_tiles20', //qianghai_
             requestVertexNormals: false
         });
         // var terrainProvider = new Cesium.CesiumTerrainProvider({
         //     url: 'https://assets.agi.com/stk-terrain/world',//'http://readymap.org/readymap/tiles/1.0.0/128/',//
         //     requestVertexNormals: false
         // });
         netMap.map.viewer.terrainProvider = terrainProvider;
         netMap.map.viewer.scene.globe.enableLighting = false;
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
             Cesium.Cartesian3.fromDegrees(tempPositon.lon, tempPositon.lat, 0));
         var model = scene.primitives.add(Cesium.Model.fromGltf({
             url: url,
             modelMatrix: modelMatrix,
             scale: 1.0
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
         if (customerAttribute.nodes) {
             model.show = false;
             window.setTimeout(function() {
                 (function(model) {
                     var nodes = {};
                     model._nodeCommands.forEach(function(v, i) {
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
                             parents[i].publicNode.show = false;
                         }

                     });
                     model.nodes = nodes;
                     for (var i = customerAttribute.nodes.length - 1; i >= 0; i--) {
                         nodes[customerAttribute.nodes[i]].node.show = true;
                     }
                     model.show = true;
                 })(model)
             }, 1000);
         }

         customerAttribute.position = tempPositon;
         model._positionLay = customerAttribute;
         return model;
     },
     requestModel: function(file, callback) {
         $.getJSON('data/' + file, function(model) {
             callback(netMap.createModel(model, model.url, model), model);
         });
     }

 }
