angular.module('myApp.controllers', [])

.controller('ClientsController',['$scope','$ionicActionSheet','$timeout',function($scope, $ionicActionSheet, $timeout){
    // Triggered on a button click, or some other target
 $scope.show = function() {
//client list recover
     $scope.client={
                    _id:"0",
            company_name  :"",
            direction     :"",
            city          :"",
            country       :"",
            phone         :"",
            email         :"",
            contacts:[]
            };
        //GET CLIENTS
   /**     clientsService.query(
            function(res){
                $scope.clients=res;
                  console.log($scope.clients);

        });
 
     **/
     
     
// Show the action sheet
  $ionicActionSheet.show({
      buttons: [
        { text: '<i class="icon ion-android-contacts"></i> Show Client Contacts' },
        { text: '<i class="icon ion-plus-circled"></i> New Client' }
      ],
      destructiveText: 'Delete Client',
      cancelText: 'Cancel',
      cancel: function() {
        console.log('CANCELLED');
      },
      buttonClicked: function(index) {
        console.log('BUTTON CLICKED', index);
        return true;
      },
      destructiveButtonClicked: function() {
        console.log('DESTRUCT');
        return true;
      }
    });
     
   // For example's sake, hide the sheet after two seconds
   $timeout(function() {
     hideSheet();
   }, 2000);

 };
    
}])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
