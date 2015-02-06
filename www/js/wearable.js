var utils = {
  right: function (str, n) {
    if (n <= 0)
       return "";
    else if (n > String(str).length)
       return str;
    else {
       var iLen = String(str).length;
       return String(str).substring(iLen, iLen - n);
    }
  }
};

var wearable = {

    acelerometerPosition: 0,

    initialize: function() {

        bluetoothSerial.subscribe("\n", wearable.onDeviceMessage, wearable.generateFailureFunction("Subscribe Failed"));
        bluetoothSerial.list(wearable.onDeviceList, wearable.generateFailureFunction("List Failed"));
        app.updateNode("content-status", "INICIALIZANDO");
        wearable.acelerometerPosition = 0;
    },

    updateBuzzer: function (value) {

      comando = "#BZ";
      if (value == "1234" || value == "6789") {
        comando = "#PM";
      }

      bluetoothSerial.write(comando + utils.right("0000" + value,4) + "\n", function () {
        setTimeout(function () {

          bluetoothSerial.write("#BZ0000\n", {}, wearable.onWearableWriteFailure);

        }, 1000);
      }, wearable.onWearableWriteFailure);

    },

    updateLed: function (led, value) {

      bluetoothSerial.write("#" + led + utils.right("0000" + value,4) + "\n", {}, wearable.onWearableWriteFailure);

    },

    updateLedR: function (value) {

      wearable.updateLed("LR", value);

    },

    updateLedG: function (value) {

      wearable.updateLed("LG", value);

    },

    updateLedB: function (value) {

      wearable.updateLed("LB", value);

    },
    onLuminosityChange: function (luminosityValue) {

      app.updateNode("content-lightbulb",luminosityValue);

    },

    onAcelerometer: function (value) {

      if (wearable.acelerometerPosition == 0) {
        app.updateNode("content-acelerometer-x",value);
      } else if (wearable.acelerometerPosition == 1) {
          app.updateNode("content-acelerometer-y",value);
      } else if (wearable.acelerometerPosition == 2) {
        app.updateNode("content-acelerometer-z",value);
      }
      wearable.acelerometerPosition++;
      if (wearable.acelerometerPosition > 2)
        wearable.acelerometerPosition = 0;
    },

    onButtonOne: function (bool) {

      if (bool == "1") {
        strBool = "ON";
        app.updateClass("content-button-1-icon", "fa fa-circle");
      } else {
        strBool = "OFF";
        app.updateClass("content-button-1-icon", "fa fa-circle-thin");
      }

      app.updateNode("content-button-1", strBool);

    },

    onButtonTwo: function (bool) {

      if (bool == "1") {
        strBool = "ON";
        app.updateClass("content-button-2-icon", "fa fa-circle");
      } else {
        strBool = "OFF";
        app.updateClass("content-button-2-icon", "fa fa-circle-thin");
      }

      app.updateNode("content-button-2", strBool);

    },

    onDeviceMessage: function (msg) {
      msgCommand = msg.substr(0,3).trim();
      msgValue   = msg.substr(3,msg.length-3).trim();

      switch (msg.substr(0,3)) {
        case "#LI":
          console.log("Luminosidade:")
          console.log(msgValue);
          wearable.onLuminosityChange(msgValue);
          break;
        case "#B1":
          console.log("Botão 1:")
          console.log(msgValue);
          wearable.onButtonOne(msgValue);
          break;
        case "#B2":
          console.log("Botão 2:")
          console.log(msgValue);
          wearable.onButtonTwo(msgValue);
          break;
        case "#AC":
          console.log("Acelerometro:")
          console.log(msgValue);
          wearable.onAcelerometer(msgValue);
          break;
        default:
          console.log("Genérico:")
          console.log(msg);
          break;
      }
        console.log("device:" + msg);
    },

    onDeviceList: function(devices) {
        console.log("Listing devices");
        console.log(devices);
        devices.forEach(function(device) {

          regex = /wV3/i;

          if (regex.test(device.name)) {
              console.log(device);
              app.updateNode("content-status", "CONECTANDO");
              bluetoothSerial.connect(device.address, wearable.onWearableConnectSuccess, wearable.onWearableConnectFailure);
          }

        });
    },

    generateFailureFunction: function(message) {
        var func = function(reason) { // some failure callbacks pass a reason
            var details = "";
            if (reason) {
                details += ": " + JSON.stringify(reason);
            }
            console.log(message + details);
        };
        return func;
    },

    onWearableConnectSuccess: function () {
        console.log('onWearableConnectSuccess!');
        wearable.acelerometerPosition = 0;
        app.updateNode("content-status", "CONECTADO");
        bluetoothSerial.subscribe("\n", wearable.onDeviceMessage, wearable.generateFailureFunction("Subscribe Failed"));
        bluetoothSerial.write("#LR0000\n", function () {

          bluetoothSerial.write("#LG0000\n", function () {

            bluetoothSerial.write("#LB0000\n", function () {

              app.updateValue("content-led-r",0);
              app.updateValue("content-led-g",0);
              app.updateValue("content-led-b",0);

              bluetoothSerial.write("#AC0000\n", function () {
                bluetoothSerial.write("#AC0001\n", function () {
                  bluetoothSerial.write("#AC0002\n", function () {

                    bluetoothSerial.write("#LI0000\n", {}, wearable.onWearableWriteFailure);

                  }, wearable.onWearableWriteFailure);
                }, wearable.onWearableWriteFailure);
              }, wearable.onWearableWriteFailure);

              setInterval(function(){
                  bluetoothSerial.write("#AC0000\n", function () {
                    bluetoothSerial.write("#AC0001\n", function () {
                      bluetoothSerial.write("#AC0002\n", function () {

                      }, wearable.onWearableWriteFailure);
                    }, wearable.onWearableWriteFailure);
                  }, wearable.onWearableWriteFailure);
              }, 2000);


            }, wearable.onWearableWriteFailure);

          }, wearable.onWearableWriteFailure);

        }, wearable.onWearableWriteFailure);

        setInterval(function(){
            bluetoothSerial.write("#LI0000\n", {}, wearable.onWearableWriteFailure);
        }, 3000);
    },

};
