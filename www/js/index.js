/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    updateClass: function (elementId, newClassName) {

      try {

        document.getElementById(elementId).className = newClassName;

      } catch (e) {
        console.log("Erro atualizando " + elementId + ":");
        console.log(e);
      }
    },

    updateNode: function (elementId, htmlValue) {

      try {

        document.getElementById(elementId).innerHTML = htmlValue;

      } catch (e) {
        console.log("Erro atualizando " + elementId + ":");
        console.log(e);
      }
    },

    updateValue: function (elementId, newValue) {

      try {

        document.getElementById(elementId).value = newValue;

      } catch (e) {
        console.log("Erro atualizando " + elementId + ":");
        console.log(e);
      }
    },

    onLedChangeR: function (value) {

        wearable.updateLedR(value);

    },
    onLedChangeG: function (value) {

        wearable.updateLedG(value);

    },
    onLedChangeB: function (value) {

        wearable.updateLedB(value);

    },

    onBuzzerChange: function (value) {

        wearable.updateBuzzer(value);

    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        wearable.initialize();
        setup();
        ledsOff();
        //TEMP
        if(navigator.mozAlarms) {
            new Notification("Hi there!");
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        
    }
};

function setup(){
    $("#red-switch").change(function(){
        if(this.checked){
            var color = "red";
            if(promptInterval(color)){
                var interval = window.localStorage.getItem("redInterval");
                scheduleActivity(1, color, interval, "Hora de comer!");
            } else {
                alert("O valor informado está incorreto");
                this.checked = false;
                $("#red-interval").html("");
                window.localStorage.removeItem("red");
            }
        } else {
            ledsOff();
            cancelActivity(1);
            $("#red-interval").html("");
            window.localStorage.removeItem("redInterval");
        }
    });

    $("#green-switch").change(function(){
        if(this.checked){
            var color = "green";
            if(promptInterval(color)){
                var interval = window.localStorage.getItem("greenInterval");
                scheduleActivity(2, color, interval, "Hora de praticar exercícios!");
            } else {
                alert("O valor informado está incorreto");
                this.checked = false;
                $("#green-interval").html("");
                window.localStorage.removeItem("green");
            }
        } else {    
            ledsOff();
            cancelActivity(2);
            $("#green-interval").html("");
            window.localStorage.removeItem("greenInterval");
        }
    });

    $("#blue-switch").change(function(){
        if(this.checked){
            var color = "blue";
            if(promptInterval(color)){
                var interval = window.localStorage.getItem("blueInterval");
                scheduleActivity(3, color, interval, "Hora de beber água!");
            } else {
                alert("O valor informado está incorreto");
                this.checked = false;
                $("#blue-interval").html("");
                window.localStorage.removeItem("blue");
            }
        } else {
            ledsOff();
            cancelActivity(3);
            $("#blue-interval").html("");
            window.localStorage.removeItem("blueInterval");
        }
    });

    $("#sidebar-home").on("click", function(e){
        e.preventDefault(); 
        var url = window.location.href.substring(0, window.location.href.indexOf("#"));
        document.location.href = url;
    });

    var redInterval = window.localStorage.getItem('redInterval');
    var greenInterval = window.localStorage.getItem('greenInterval');
    var blueInterval = window.localStorage.getItem('blueInterval');
    if(redInterval != undefined && redInterval > 0 && redInterval < 25){
        $("#red-switch").prop('checked', true);
        $("#red-interval").html("Lembrar a cada " + redInterval + "h");
    }
    if(greenInterval != undefined && greenInterval > 0 && greenInterval < 25){
        $("#green-switch").prop('checked', true);
        $("#green-interval").html("Lembrar a cada " + greenInterval + "h");
    }
    if(blueInterval != undefined && blueInterval > 0 && blueInterval < 25){
        $("#blue-switch").prop('checked', true);
        $("#blue-interval").html("Lembrar a cada " + blueInterval + "h");
    }
}

function promptInterval(color){
    var interval;
    if(color === "red"){
        interval = prompt("De quantas em quantas horas você deseja ser lembrado para comer?\nValor Mínimo: 1\nValor Maximo: 24\nEx: 1");
        if(!isInt(interval) || interval < 1 || interval > 24){
            return false;
        }
        window.localStorage.setItem('redInterval', interval);
        $("#red-interval").html("Lembrar a cada " + interval + "h");
    } else if(color === "green"){
        interval = prompt("Qual o horário do dia que você deseja praticar atividade física?\nValor Mínimo: 1\nValor Maximo: 24\nEx: 6");
        if(!isInt(interval) || interval < 1 || interval > 24){
            return false;
        }
        window.localStorage.setItem('greenInterval', interval);
        $("#green-interval").html("Lembrar todo dia às " + interval + "h");
    } else if(color === "blue"){
        interval = prompt("De quantas em quantas horas você deseja ser lembrado para beber água?\nValor Mínimo: 1\nValor Maximo: 24\nEx: 3");
        if(!isInt(interval) || interval < 1 || interval > 24){
            return false;
        }
        window.localStorage.setItem('blueInterval', interval);
        $("#blue-interval").html("Lembrar a cada " + interval + "h");
    }
    return true;
}

function scheduleActivity(id, color, hours, message){
    var date = new Date();
    date.setHours(date.getHours() + hours);
    if(color === "green"){
        date.setHours(hours);
        date.setMinutes(0);
        date.setSeconds(0);
    }

    //TEMP
    date = new Date();
    date.setSeconds(date.getSeconds() + 5);

    cancelActivity(id);
    window.plugin.notification.local.add({
        id: id,
        date: date,
        title: "LifeBand",
        message: message,
        autoCancel: true,
        icon: "ic_launcher",
        smallIcon: "ic_launcher",
        sound: 'android.resource://com.adrielcafe.lifeband/raw/notification',
        repeat: 1//color === "green" ? "daily" : hours
    });
    window.plugin.notification.local.onclick = function (id, state, json) {
        ledsOff();
    };
    window.plugin.notification.local.oncancel = function (id, state, json) {
        ledsOff();
    };
    window.plugin.notification.local.ontrigger = function (id, state, json) {
        if(id == 1){
            ledRed();
        } else if(id == 2){
            ledGreen();
        } else if(id == 3){
            ledBlue();
        }
    };
}

function cancelActivity(id){
    window.plugin.notification.local.cancel(id);
}

function ledRed(){
    ledsOff();
    try {
        wearable.updateLedR(255);
        wearable.updateLedG(0);
        wearable.updateLedB(0);
        wearable.updateBuzzer(0500);
    } catch(e){ }
}

function ledGreen(){
    ledsOff();
    try {
        wearable.updateLedR(0);
        wearable.updateLedG(255);
        wearable.updateLedB(0);
        wearable.updateBuzzer(0500);
    } catch(e){ }
}

function ledBlue(){
    ledsOff();
    try {
        wearable.updateLedR(0);
        wearable.updateLedG(0);
        wearable.updateLedB(255);
        wearable.updateBuzzer(0500);
    } catch(e){ }
}

function ledsOff(){
    try {
        wearable.updateLedR(0);
        wearable.updateLedG(0);
        wearable.updateLedB(0);
    } catch(e){ }
}

function isInt(value) {
  return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}
