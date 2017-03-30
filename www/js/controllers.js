angular.module('myApp.controllers', [])

.controller('AppCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $localStorage,AuthFactory) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    $scope.registration = {};
    $scope.loggedIn = false;

    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);
        $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);

        $scope.closeLogin();
    };

    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };

    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });




    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.registerform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeRegister = function () {
        $scope.registerform.hide();
    };

    // Open the login modal
    $scope.register = function () {
        $scope.registerform.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doRegister = function () {
        console.log('Doing registration', $scope.registration);
        $scope.loginData.username = $scope.registration.username;
        $scope.loginData.password = $scope.registration.password;

        AuthFactory.register($scope.registration);
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeRegister();
        }, 1000);
    };

    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
        $localStorage.storeObject('userinfo',$scope.loginData);
    });
})

.controller('ClientsController',['$scope','$ionicActionSheet','$timeout','clientsService','$state','$ionicModal','$ionicPopup',
function($scope, $ionicActionSheet, $timeout, clientsService, $state, $ionicModal,$ionicPopup){
    // Triggered on a button click, or some other target
    //client list recover
  $scope.client = {company_name:"",direction:"",phone:"",email:""};
  $scope.loadClients = function(){
    clientsService.query(
        function (response) {
          $scope.clients = response.sort(function(a, b){return a.company_name - b.company_name});
        },
        function (response) {
           response.console.error();
    });

  };

$scope.loadClients();

 $scope.show = function(client) {
   $scope.client=client;
   $scope.client.phone=JSON.parse(client.phone);
// Show the action sheet
  var hideSheet= $ionicActionSheet.show({
      buttons: [
        { text: '<i class="icon ion-android-contacts"></i> Show Client Contacts' },
        { text: '<i class="icon ion-plus-circled"></i> Edit Client' }
      ],
      destructiveText: 'Delete Client',
      buttonClicked: function(index) {
        console.log('BUTTON CLICKED', index);
        if(index == 0){
          //go to contacts
          $state.go('app.contacts',{id:client._id});
        }
        if(index == 1){
         $scope.editClientModal();
        }
        return true;
      },
      destructiveButtonClicked: function() {
        //delete client
         $scope.showPopup();
        return true;
      }
    });

   // For example's sake, hide the sheet after two seconds
   $timeout(function() {
     hideSheet();
   }, 2000);

 };

   /********************$ionicModal Create Client**************************/
 // Create the new contact modal that we will use later
   $ionicModal.fromTemplateUrl('templates/newClient.html', {
       scope: $scope
   }).then(function (modal) {
       $scope.modal = modal;
   });

   // Triggered in the newContact modal to close it
   $scope.closeNewClient = function () {
       $scope.modal.hide();
   };

   // Open the NewContact modal
   $scope.createNewClientModal = function () {
      $scope.client = {company_name:"",direction:"",phone:"",email:""};
       $scope.modal.show();
   };

   $scope.createNewClient = function () {
     clientsService.save($scope.client,function(res){
         $scope.client=res;
     });
     $scope.closeNewClient();
     $scope.loadClients();
   }

   /********************$ionicModal Edit Client **************************/
 // Create the new contact modal that we will use later
   $ionicModal.fromTemplateUrl('templates/editClient.html', {
       scope: $scope
   }).then(function (modal) {
       $scope.modal_edit = modal;
   });

   // Triggered in the newContact modal to close it
   $scope.closeEditClient = function () {
       $scope.modal_edit.hide();
   };

   // Open the NewContact modal
   $scope.editClientModal = function () {
       $scope.modal_edit.show();
   };

   $scope.editClient = function () {
     clientsService.update({id:$scope.client._id},$scope.client)
     .$promise.then(
         function(response){

           $scope.loadClients();
         },function(response){
             $scope.message = "Error: "+response.status + " " + response.statusText;
         });
     $scope.closeEditClient();

   }

   /*******************DELETE CLIENT**********************************/
   /**************************$ionicPopup************************/
 // Triggered on a button click, or some other target
 $scope.showPopup = function() {
   // An elaborate, custom popup
   var myPopup = $ionicPopup.show({
     template: 'Are you sure you want to delete the Client and all the contacts?',
     title: 'Delete Client',
     scope: $scope,
     buttons: [
       { text: 'Cancel' },
       {
         text: '<b>Delete</b>',
         type: 'button-assertive',
         onTap: function(e) {
           $scope.deleteClient();
         }
       }
     ]
   });

   myPopup.then(function(res) {
     console.log('Tapped!', res);
   });

   $timeout(function() {
      myPopup.close(); //close the popup after 3 seconds for some reason
   }, 3000);
  };

  /**********DELETE client***************************/
  //DELETE client
       $scope.deleteClient    = function(){
         clientsService.delete({id:$scope.client._id})
         .$promise.then(
             function(response){
               $scope.loadClients();
             },function(response){
                 $scope.message = "Error: "+response.status + " " + response.statusText;
             });
       };
}])

.controller('ContactsController',['$scope','$stateParams','clientsService','$ionicModal','$ionicActionSheet','$ionicPopup',
function($scope,$stateParams,clientsService,$ionicModal,$ionicActionSheet,$ionicPopup){

    $scope.contact ={name:"",category:"",phone:"",email:""};
    //GET the client and his contacts
    $scope.loadClient = function(){
      clientsService.get({id:$stateParams.id})
      .$promise.then(
          function(response){
            $scope.client=response;
          },function(response){
              $scope.message = "Error: "+response.status + " " + response.statusText;
          });
    };

    $scope.loadClient();
  /******************** $ionicActionSheet*****************************/
    $scope.show = function(contact){
      $scope.contact=contact;
      $scope.contact.phone=JSON.parse(contact.phone);

      var hideSheet= $ionicActionSheet.show({
          buttons: [
            { text: '<i class="icon ion-plus-circled"></i> Edit Contact' }
          ],
          destructiveText: 'Delete Client',
          buttonClicked: function(index) {
            if(index==0){
                $scope.editContactModal();
            }
              return true;
          },
          destructiveButtonClicked: function() {
              $scope.showPopup();
                return true;
          }
        });

       // For example's sake, hide the sheet after two seconds
       $timeout(function() {
         hideSheet();
       }, 2000);
    };

    /********************$ionicModal**************************/
  // Create the new contact modal that we will use later
    $ionicModal.fromTemplateUrl('templates/newContact.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the newContact modal to close it
    $scope.closeNewContact = function () {
        $scope.modal.hide();
    };

    // Open the NewContact modal
    $scope.createNewContactModal = function () {
        $scope.contact ={name:"",category:"",phone:"",email:""};
        $scope.modal.show();
    };
    // create a new contact and save to the BD. Fisrt delete 2on post=save
    $scope.createNewContact = function(){
      if($scope.client.contacts==null){$scope.client.contacts=[];}

           $scope.client.contacts.push($scope.contact);

           clientsService.delete({id:$scope.client._id},function(){
               clientsService.save($scope.client,function(res){
                   $scope.client=res;
               });
           });
           $scope.contact ={name:"",category:"",phone:"",email:""};
             $scope.closeNewContact();
    }

    /*******************update client when you Edit************************/
    // Create the new contact modal that we will use later
      $ionicModal.fromTemplateUrl('templates/editContact.html', {
          scope: $scope
      }).then(function (modal) {
          $scope.modal_edit = modal;
      });

      // Triggered in the newContact modal to close it
      $scope.closeEditContact = function () {
          $scope.modal_edit.hide();
      };

      // Open the NewContact modal
      $scope.editContactModal = function () {
          $scope.modal_edit.show();
      };
    $scope.updateClientContact = function(){
           clientsService.update({id:$scope.client._id},$scope.client);
             $scope.closeEditContact();
       };

  /**************************$ionicPopup************************/
// Triggered on a button click, or some other target
$scope.showPopup = function() {
  // An elaborate, custom popup
  var myPopup = $ionicPopup.show({
    template: 'Are you sure you want to delete the contact?',
    title: 'Delete Contact',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Delete</b>',
        type: 'button-assertive',
        onTap: function(e) {
          $scope.deleteContact();
        }
      }
    ]
  });

  myPopup.then(function(res) {
    console.log('Tapped!', res);
  });

  $timeout(function() {
     myPopup.close(); //close the popup after 3 seconds for some reason
  }, 3000);
 };

 /**********DELETE contact***************************/
 //DELETE CONTACT
      $scope.deleteContact    = function(){
          if($scope.contact!=null){
              var index=$scope.client.contacts.indexOf($scope.contact);
              if(index != -1){
                  $scope.client.contacts.splice(index,1);
                  //put operation
                  clientsService.update({id:$scope.client._id},$scope.client).$promise.then(
                    function(response){
                        $scope.loadClient();
                    },function(response){
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                  });
              }

          }

      };

}])
;
