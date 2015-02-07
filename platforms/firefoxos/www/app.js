//
// Here is how to define your module
// has dependent on mobile-angular-ui
//
var app = angular.module('MobileAngularUiExamples', [
  'ngRoute',
  'mobile-angular-ui',

  // touch/drag feature: this is from 'mobile-angular-ui.gestures.js'
  // it is at a very beginning stage, so please be careful if you like to use
  // in production. This is intended to provide a flexible, integrated and and
  // easy to use alternative to other 3rd party libs like hammer.js, with the
  // final pourpose to integrate gestures into default ui interactions like
  // opening sidebars, turning switches on/off ..
  'mobile-angular-ui.gestures'
]);

//
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false'
// in order to avoid unwanted routing.
//
app.config(function($routeProvider) {
  $routeProvider.when('/',              {templateUrl: 'home.html', reloadOnSearch: false});
  $routeProvider.when('/about',        {templateUrl: 'about.html', reloadOnSearch: false});
  $routeProvider.when('/how-works',        {templateUrl: 'how-works.html', reloadOnSearch: false});
});

app.run(function($rootScope) {
  $rootScope.dca_username = localStorage.getItem("dca_username", "");
  $rootScope.dca_password = localStorage.getItem("dca_password", "");
  $rootScope.dca_service  = localStorage.getItem("dca_service", "");
  $rootScope.dca_apikey   = localStorage.getItem("dca_apikey", "");

});

//
// For this trivial demo we have just a unique MainController
// for everything
//
app.controller('MainController', function($rootScope, $scope){

  // User agent displayed in home page
  $scope.userAgent = navigator.userAgent;

  // Needed for the loading screen
  $rootScope.$on('$routeChangeStart', function(){
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function(){
    $rootScope.loading = false;
  });

  // Fake text i used here and there.
  $scope.lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel explicabo, aliquid eaque soluta nihil eligendi adipisci error, illum corrupti nam fuga omnis quod quaerat mollitia expedita impedit dolores ipsam. Obcaecati.';

  //
  // 'Scroll' screen
  //
  var scrollItems = [];

  for (var i=1; i<=100; i++) {
    scrollItems.push('Item ' + i);
  }

  $scope.scrollItems = scrollItems;

  $scope.bottomReached = function() {
    
  }

});


app.controller('AccountController', function ($rootScope, $scope) {

  $scope.dca_username = $rootScope.dca_username;
  $scope.dca_password = $rootScope.dca_password;
  $scope.dca_service  = $rootScope.dca_service;
  $scope.dca_apikey   = $rootScope.dca_apikey;

  $scope.updateAccount = function () {

    localStorage.setItem('dca_username', $scope.dca_username);
    localStorage.setItem('dca_password', $scope.dca_password);
    localStorage.setItem('dca_service',  $scope.dca_service);
    localStorage.setItem('dca_apikey',   $scope.dca_apikey);

  };

});