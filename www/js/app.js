// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('myApp', ['ionic', 'myApp.controllers','myApp.services'])

.run(function($ionicPlatform, $rootScope, $ionicLoading) {
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

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    //abstract: true abstract state and this state defin the state in wich you can nested (anidar) other states
    //abstract top state
    abstract: true,
    templateUrl: 'templates/sidebar.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
    url: '/home',
    views: {
      'mainContent': {
        templateUrl: 'templates/home.html',
        controller:   'ActionsController'
      }
    }
  })
  .state('app.define',{
    url:'/define',
    views:{
      'mainContent':{
        templateUrl:'templates/defineActions.html',
        controller: 'ActionsController'
      }
    }
  })
  .state('app.getstartaction', {
      url: '/getStartAction',
      views: {
        'mainContent': {
          templateUrl: 'templates/getstartaction.html'
        }
      }
    })
    .state('app.closeactions', {
      url: '/closeActions',
      views: {
        'mainContent': {
          templateUrl: 'templates/close_actions.html',
          controller: ''
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
          controller: ''
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

   .state('app.login', {
      url: '/login',
      views: {
        'mainContent': {
          templateUrl: 'templates/login.html',
          controller: ''
        }
      }
    })

  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
