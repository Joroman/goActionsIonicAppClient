// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

angular.module('myApp', ['ionic', 'myApp.controllers','myApp.services', 'ion-floating-menu','chart.js','nvd3'])

.run(function($ionicPlatform, $rootScope, $ionicLoading, $timeout) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
      $timeout(function(){
                $cordovaSplashscreen.hide();
      },2000);
  });

    $rootScope.$on('loading:show', function () {
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner> Loading ...'
        })
    });

    $rootScope.$on('loading:hide', function () {
        $ionicLoading.hide();
    });

    $rootScope.$on('$stateChangeStart', function () {
        console.log('Loading ...');
        $rootScope.$broadcast('loading:show');
    });

    $rootScope.$on('$stateChangeSuccess', function () {
        console.log('done');
        $rootScope.$broadcast('loading:hide');
    });
})

.config(function($stateProvider, $urlRouterProvider, ChartJsProvider) {
  // Configure all line charts
 ChartJsProvider.setOptions('line', {
   chartColors: ['#5cb85c','#FF7E67'],
   responsive: true
 });

 ChartJsProvider.setOptions('bar', {
   chartColors: ['#5cb85c','#FF7E67'],
   responsive: true
 });

  $stateProvider

    .state('app', {
    url: '/app',
    //abstract: true abstract state and this state defin the state in wich you can nested (anidar) other states
    //abstract top state
    abstract: true,
    templateUrl: 'templates/sidebar.html',
    controller: 'AppCtrl'
  })

  .state('app.home',{
    url:'/home',
    views:{
      'mainContent':{
        templateUrl:'templates/home.html'
        //controller:'HomeController'
      }
    }
  })

  .state('app.activeActions', {
    url: '/activeActions',
    views: {
      'mainContent': {
        templateUrl: 'templates/activeActions.html',
        controller:   'ActionsController'
      }
    }
  })
  .state('app.actionDetail',{
    url:'/actionDetail/:id',
    views:{
      'mainContent':{
        templateUrl:'templates/actionDetail.html',
        controller:'ActionDetailController'
      }
    }
  })

    .state('app.closeActions', {
      url: '/closeActions',
      views: {
        'mainContent': {
          templateUrl: 'templates/close_actions.html',
          controller: 'CloseActionsController'
        }
      }
    })

    .state('app.closeActionDetail',{
      url:'/closeActions/:id',
      views:{
        'mainContent':{
        templateUrl:'templates/closeActionDetail.html',
        controller:'CloseActionDetailController'
        }
      }
    })

   .state('app.clients', {
      url: '/clients',
      views: {
        'mainContent': {
          templateUrl: 'templates/clients.html',
          controller: 'ClientsController'
        }
      }
    })

  .state('app.contacts', {
    url: '/clients/:id',
    views: {
      'mainContent': {
        templateUrl: 'templates/contacts.html',
        controller: 'ContactsController'
      }
    }
  })
   .state('app.sales', {
      url: '/sales',
      views: {
        'mainContent': {
          templateUrl: 'templates/sales.html',
          controller: 'SalesController'
        }
      }
    })

    .state('app.contactus', {
      url: '/contactus',
      views: {
        'mainContent': {
          templateUrl: 'templates/contactus.html',
          controller: ''
        }
      }
    })
;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
