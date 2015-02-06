app.controller('SbcController', ['$rootScope', '$scope', 'sbcApi',function($rootScope, $scope, sbcApi){

  // Registering the User
  sbcApi.registerUser('<your-key>', '<your-username');


/*
 * SERVICE
 */
  // Getting Service Info
  sbcApi.getService().success(function(data){
    console.log(data);
  }).error(function(err){
    console.log(err);
  });

  // ApiParams Optional
  var apiParams = {limit:1,offset:10};

  // Getting Asstes List
  sbcApi.getAssets(apiParams).success(function(data){
    console.log(data);
  }).error(function(err){
    console.log(err);
  });

  // Getting Groups List
  sbcApi.getGroups(apiParams).success(function(data){
    console.log(data);
  }).error(function(err){
    console.log(err);
  });

  // Getting Asset Info

  apiParams.assetId = 'asset1'; // REQUIRED

  sbcApi.getAsset(apiParams).success(function(data){
    console.log(data);
  }).error(function(err){
    console.log(err);
  });

  // Getting Asset History
  apiParams.assetId = 'asset1'; // REQUIRED

  sbcApi.getAssetHistory(apiParams).success(function(data){
    console.log(data);
  }).error(function(err){
    console.log(err);
  });

  // Getting Asset History by Sensor
  apiParams.assetId = 'asset1'; // REQUIRED
  apiParams.sensorName = 'temperature'; // REQUIRED

  sbcApi.getAssetHistoryBySensor(apiParams).success(function(data){
    console.log(data);
  }).error(function(err){
    console.log(err);
  });


  // Removing a User Property
  sbcApi.removeUserProperties('prop_name').success(function(data){
    console.log(data);
  }).error(function(err){
    console.log(err);
  });

  sbcApi.removeUserProperties(['prop_name1', 'prop_name2']).success(function(data){
    console.log(data);
  }).error(function(err){
    console.log(err);
  });


  // Setting a User Property
  var property = {
    name: "prop",
    value: 1
  };

  sbcApi.setUserProperties(property).success(function(data){
    console.log(data);
  }).error(function(err){
    console.log(err);
  });

  var properties = [{
    name: "prop1",
    value: 1
  },{
    name: "prop2",
    value: {test:true, _x:1}
  }];

  sbcApi.setUserProperties(properties).success(function(data){
    console.log(data);
  }).error(function(err){
    console.log(err);
  });

  // Getting a User Property

  sbcApi.getUserProperties('prop1').success(function(data){
    console.log(data);
  }).error(function(err){
    console.log(err);
  });

  // Second param tells that a JSON is expected
  sbcApi.setUserProperties('prop2', true).success(function(data){
    console.log(data);
  }).error(function(err){
    console.log(err);
  });

/*
 * Sensors
 */
  var sensors = [];

  var mysensor1 = new sbcApi('<sensor-id>', 'sensor-alias', '<default-data>'),
  sensors.push(mysensor1);

  mysensor1.setSensorData('new-data');

  mysensor1.save().success(function(){
    console.log("Saves, I guess...");
  }).error(function(err){
    console.log(err);
  });

  var mysensor2 = new sbcApi('<sensor-id>', 'sensor-alias', '<default-data>');
  sensors.push(mysensor2);


  sensorBatch = new SensorBatch(sensors);

  sensorBatch.save().success(function(){
    console.log('Saved, I guess...');
  }).error(function(err){
    console.log(err);
  });


}]);
