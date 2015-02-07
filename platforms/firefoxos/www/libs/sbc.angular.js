app.value('apiURL', {
    BASE: 'http://dca.telefonicabeta.com',
    SERVICE: this.BASE + '/m2m/v2/services/:name',
    ASSETS: this.SERVICE + '/assets/',
    GROUPS: this.SERVICE + '/groups/',
    ASSET: this.SERVICE + '/assets/:id/',
    HISTORY: this.SERVICE + '/assets/:id/data/',
    DATA_SAVE: this.BASE + ':8002'
});

app.value('apiHeaders', '');


app.factory('sbcApi', ['$http', '$q', '$timeout', '$rootScope', 'apiURL', 'apiHeaders', function($http, $q, $timeout, $rootScope, apiURL, apiHeaders) {

  var apikey = "",
      username = "",
      api = {},
      timers = [],
      apiTimeout = 1000,
      self = this;

  var setApiKey = function (newKey) {
    apikey = newKey;
    return this;
  };

  var setUsername = function (newName) {
    username = newName;
    return this;
  };

  var getHeaders = function () {
    return {headers: {
      // "Authorization": "M2MToken "+SBCConfig.AUTH_TOKEN
    }};
  };

  var replaceURL = function (url) {
    return url.replace(":name", username);
  };

  var registerUser = function (key, user) {
    setApiKey(key);
    setUsername(user);

    return this;
  };

  api.convertObject = function (old) {
    if (old.name) {
      var obj = {};
      obj[old.name] = old.value.toString(); // @TODO Remove .toString() when the SBC accepts another types than string.
      return obj;
    } else {
      return old;
    }
  };

  api.setTimeout = function (newTimeout) {
    apiTimeout = newTimeout;
  };

  api.getTimeout = function () {
    return apiTimeout;
  };

  api.getPagination = function (apiParams) {
    var pageNumber = (apiParams.pageNumber)?apiParams.pageNumber:0;
    var pageSize   = (apiParams.pageSize)?apiParams.pageSize:10;
    var pageOffset = pageNumber * pageSize;
    return "&limit=" + pageSize.toString() + "&offset=" + pageOffset.toString();
  };

  api.getService = function (apiParams) {
    return $http.get(replaceURL(apiURL.SERVICE), apiHeaders);
  };

  api.getAssets = function (apiParams) {
    if (!apiParams) {
      apiParams = {};
    }

    return $http.get(replaceURL(apiURL.ASSETS) + "?" + $.param(apiParams) + "&" + api.getPagination(apiParams), apiHeaders);
  };

  api.getGroups = function (apiParams) {
    if (!apiParams) {
      apiParams = {};
    }

    return $http.get(replaceURL(apiURL.GROUPS) + "?" + $.param(apiParams) + "&" + api.getPagination(apiParams), apiHeaders);
  };

  api.getAsset = function (apiParams) {
    if (!apiParams) {
      apiParams = {};
    }

    return $http.get(replaceURL(apiURL.ASSET).replace(":id", apiParams.assetId), apiHeaders);
  };

  api.getAssetHistory = function (apiParams) {
    if (!apiParams) {
      apiParams = {};
    }

    return $http.get(replaceURL(apiURL.HISTORY).replace(":id", apiParams.assetId) + "?sortBy=!samplingTime&" + api.getPagination(apiParams), apiHeaders);
  };

  api.getAssetHistoryBySensor = function (apiParams) {
    if (!apiParams) {
      apiParams = {};
    }

    return $http.get(replaceURL(apiURL.HISTORY).replace(":id", apiParams.assetId) + "?sortBy=!samplingTime&attribute=" + apiParams.sensorName + "&" + api.getPagination(apiParams), apiHeaders);
  };

  api.removeUserProperties = function (propName) {
    var deferred = $q.defer();
    var promise = deferred.promise;
    var that = this;
    this.getService().success(function (data) {

      userProps = data.data.UserProps;

      var newProps = [];

      for (var dI = 0; dI < userProps.length; dI++) {
        if ( angular.isArray(propName) ) {
          if (propName.indexOf(userProps[dI].name) < 0) {
            newProps.push(that.convertObject(userProps[dI]));
          }
        } else {
          if (propName != userProps[dI].name) {
            newProps.push(that.convertObject(userProps[dI]));
          }
        }
      }

      $http.put(replaceURL(apiURL.SERVICE), {'UserProps':newProps}, apiHeaders).success(function(putdata) {
        deferred.resolve(putdata);
      });
    });

    promise.success = function(fn) {
        promise.then(fn);
        return promise;
    }

    promise.error = function(fn) {
        promise.then(null, fn);
        return promise;
    }

    return promise;
  };

  api.getUserProperties = function (propName, json) {
    var deferred = $q.defer();
    var promise = deferred.promise;
    var that = this;
    this.getService().success(function (data) {

      userProps = data.data.UserProps;

      var newProps = [];
      var putdata = null;

      for (var dI = 0; dI < userProps.length; dI++) {
        var value = userProps[dI].value;
        if (json) {
          value = JSON.parse(userProps[dI].value);
        }
        if ( angular.isArray(propName) ) {
          if (!putdata) {
            putdata = {};
          }
          if ( propName.indexOf(userProps[dI].name) >= 0) {
            putdata[userProps[dI].name] = value;
          }
        } else if (propName == userProps[dI].name) {
          putdata = value;
        }
      }
      deferred.resolve(putdata);
    });

    promise.success = function(fn) {
        promise.then(fn);
        return promise;
    }

    promise.error = function(fn) {
        promise.then(null, fn);
        return promise;
    }

    return promise;
  };

  api.setUserProperties = function (apiParams) {
    if (!apiParams) {
      apiParams = {};
    }

    var deferred = $q.defer();
    var promise = deferred.promise;
    var that = this;
    this.getService().success(function (data) {

      userProps = data.data.UserProps;

      if ( angular.isArray(apiParams) ) {
        for (var dI = 0; dI < apiParams.length; dI++) {
          isUpdate = false;
          for (var upI = 0; upI < userProps.length; upI++) {
            if ( apiParams[dI].name == userProps[upI].name) {
              isUpdate = true;
              userProps[upI] = apiParams[dI];
            }
          }
          if ( !isUpdate ) {
            userProps.push(apiParams[dI]);
          }
        }

        for (var idx = 0; idx < userProps.length; idx++) {
          userProps[idx] = that.convertObject(userProps[idx]);
        }

      } else if (typeof apiParams == 'object' && apiParams.name) {
        isUpdate = false;
        for (var upI = 0; upI < userProps.length; upI++) {
          if ( apiParams.name == userProps[upI].name) {
            isUpdate = true;
            userProps[upI] = that.convertObject(apiParams);
            break;
          } else {
            userProps[upI] = that.convertObject(userProps[upI]);
          }
        }
        if ( !isUpdate ) {
          userProps.push(that.convertObject(apiParams));
        }
      }

      $http.put(apiURL.service, {'UserProps':userProps}).success(function(putdata) {
        deferred.resolve(putdata);
      });
    });

    promise.success = function(fn) {
        promise.then(fn);
        return promise;
    }

    promise.error = function(fn) {
        promise.then(null, fn);
        return promise;
    }

    return promise;
  };

  api.requestLoop = function (apiMethod, apiParams, callback) {

    if (!apiParams) {
      apiParams = {};
    }

    var timerId = timers.length;

    timers[timerId] = function (myId) {

      var timerLoop;
      var frequencySeconds = (apiParams.timeout)?apiParams.timeout:api.getTimeout();
      var timer = {};

      timerLoop = function () {

        timer = $timeout(timerLoop, frequencySeconds);

        api[apiMethod](apiParams)
          .success(function (data) {
            callback(data,timer);
          });

      };

      timerLoop();

      return {
        cancel : function () {
          $timeout.cancel(timer);
        }
      }
    };

    return timers[timerId](timerId);

  };

  var Sensor = function(id, alias, defaultData) {
    var sensorId = "",
        sensorAlias = "",
        bodyPattern = "|||:id||:alias|:data",
        sensorData = "";

    if (id) {
      sensorId = id.toString();
    }

    if (alias) {
      sensorAlias = alias.toString();
    }

    if (defaultData) {
      sensorData = defaultData.toString();
    }

    var getSensorBody = function() {
      return bodyPattern.replace(":id", sensorId).replace(":alias", sensorAlias).replace(":data", sensorData)
    };

    var setSensorData = function(newData) {
      sensorData = newData.toString();
      return this;
    };

    var save = function(newData) {

      if (newData) {
        setSensorData(newData);
      }

      return $http({
        url: apiURL.DATA_SAVE + '/idas/2.0?apikey='+ apikey +'&ID=kit-iot-4g',
        dataType: 'text',
        method: 'POST',
        data: getSensorBody(),
        headers: {
            "Content-Type": "text/plain"
        }
      });
    };

    return {
      getSensorBody: getSensorBody,
      setSensorData: setSensorData,
      save: save
    };

  };

  var SensorBatch = function (sensors) {
      var sensorsList = {},
          map = [];

      for (key in sensors) {
        if (sensors[key].id && sensors[key].alias) {
          sensorsList[sensors[key].id] = new Sensor(sensors[key].id, sensors[key].alias, sensors[key].data);
          map.push(sensors[key].id);
        }
      };

      var save = function() {
        var deferred = $q.defer(),
            promise = deferred.promise,
            bodyList = [],
            that = this;

        for (key in map) {
          bodyList.push(sensorsList[map[key]].getSensorBody());
        }

        $http({
          url: apiURL.DATA_SAVE + '/idas/2.0?apikey='+ apikey +'&ID=kit-iot-4g',
          dataType: 'text',
          method: 'POST',
          data: bodyList.join("#"),
          headers: {
              "Content-Type": "text/plain"
          }
        }).success(function(){
          deferred.resolve(true);
        }).error(function(err){
          deferred.resolve(false, err);
        });

        promise.success = function(fn) {
            promise.then(fn);
            return promise;
        };

        promise.error = function(fn) {
            promise.then(null, fn);
            return promise;
        };

        return promise;
      };

      return {
        sensorsList: sensorsList,
        save: save
      };

    };

  return {
    api: api,
    setApiKey: setApiKey,
    setUsername: setUsername,
    registerUser: registerUser,
    Sensor: Sensor,
    SensorBatch: SensorBatch
  };

}]);



