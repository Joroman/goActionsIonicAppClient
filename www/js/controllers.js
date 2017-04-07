angular.module('myApp.controllers', [])

.controller('AppCtrl',function ($scope, $rootScope, $ionicModal, $timeout, $localStorage,AuthFactory) {

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

.controller('ActionsController',['$scope','actionsService','actionsSortService','$state','$ionicModal','clientsService','$ionicPopup',
function($scope,actionsService,actionsSortService,$state,$ionicModal,clientsService,$ionicPopup) {

  $scope.loadActions = function(){
    $scope.actions=actionsService.query()
      .$promise.then(
            function(response){
              $scope.actions = response;
              $scope.actionsSort = actionsSortService.sortActions(response);
          },function (response) {
               $scope.message = "Error: "+response.status + " " + response.statusText;
      });
  };

  var loadClients = function(){
      $scope.clients=clientsService.query()
      .$promise.then(
        function(response){
          $scope.clients=response;
        },function(response){
           $scope.message = "Error: "+response.status + " " + response.statusText;
        });
  };

  $scope.selectClient = function(client){
    $scope.action._client = client._id;
    $scope.action.client_name = client.company_name;
    $scope.myPopup.close();
  };

    $scope.loadActions();

      $ionicModal.fromTemplateUrl('templates/getStartActionModal.html', {
       scope: $scope,
       animation: 'slide-in-up'
     }).then(function(modal) {
       $scope.modal = modal;
     });
     $scope.openModal = function() {
       $scope.action={name:"",_client:"",description:"",client_name:"",start_date:"",end_date:""};
       $scope.modal.show();
     };
     $scope.closeModal = function() {
       $scope.modal.hide();
     };


  /*******************CHOOSE CLIENT**********************************/
  /**************************$ionicPopup************************/
  // Triggered on a button click, or some other target
  $scope.showPopup = function() {
    loadClients();
    $scope.myPopup = $ionicPopup.show({
      templateUrl: 'templates/popUp.html',
          title: 'Select Client',
          scope: $scope,
          buttons: [{
            text: 'Cancel',
            type: 'button-assertive',
            onTap: function() {
              return true;
            }
          }]
    });
  };

  /**********************POST ACTION***************************/
    $scope.createAction = function(){
         actionsService.save($scope.action);
         $scope.modal.hide();
         $scope.loadActions();

       };


}])

.controller('ActionListController',['$scope','actionsService','$state','actionsSortService',function($scope,actionsService,$state,actionsSortService){
    $scope.actions=actionsService.query()
  .$promise.then(
    function(response){
      $scope.actions = response;
      $scope.actionsSort = actionsSortService.sortActions(response);
    },function (response) {
       $scope.message = "Error: "+response.status + " " + response.statusText;
    });

    $scope.goActionDetail = function(action){
      //go to contacts
      $state.go('app.actionDetail',{id:action._id});
    };

}])

.controller('ActionDetailController',['$scope','$stateParams','actionsService','$ionicModal','clientsService','$ionicPopup','$state',
function($scope,$stateParams,actionsService,$ionicModal,clientsService,$ionicPopup,$state){

    var loadAction = function(){
      if($stateParams!= null){
        $scope.action=actionsService.get({id:$stateParams.id})
        .$promise.then(
            function(response){
              $scope.action= response;
              $scope.actionState=getActionState(response);
            },function(response){
               $scope.message = "Error: "+response.status + " " + response.statusText;
          });
      }

    };

    var loadClient = function () {
      $scope.client=clientsService.get({id:$scope.action._client})
      .$promise.then(
        function(response){
            $scope.client=response;
        },function(response){
             $scope.message = "Error: "+response.status + " " + response.statusText;
        });
    }

    /*********************GIBVE THE CURRENT PHASE OF THE ACTION *******/
    var getActionState = function (action) {
      var actionState = {define:false,prospect:false,request:false,response:false};
       // ACTIVE ACTIONS DEFINE ACTIONS
        if (action.feedback==null && action.response==null && action.request==null && action.prospection==null){
            actionState.define=true;
            $scope.action.start_date    = new Date (action.start_date);
            $scope.action.end_date      = new Date (action.end_date);
        }
       // ACTIVE ACTIONS PORSPECTION ACTIONS
       if (action.feedback==null && action.response==null && action.request==null && action.prospection!=null){
          actionState.prospect=true;
          $scope.action.start_date    = new Date (action.start_date);
          $scope.action.end_date      = new Date (action.end_date);
          $scope.action.prospection.meeting_date = new Date(action.prospection.meeting_date);
        }
       // ACTIVE ACTIONS REQUEST ACTION
       if (action.feedback==null && action.response==null && action.request!=null && action.prospection!=null){
          actionState.request=true;
           $scope.action.start_date    = new Date (action.start_date);
           $scope.action.end_date      = new Date (action.end_date);
           $scope.action.prospection.meeting_date  = new Date(action.prospection.meeting_date);
           $scope.action.request.response_date     = new Date (action.request.response_date);
        }
      //ACTIVE ACTIONS RESPONSE ACTION
      if (action.feedback==null && action.response!=null && action.request!=null && action.prospection!=null){
          actionState.response=true;
          $scope.action.start_date    = new Date (action.start_date);
          $scope.action.end_date      = new Date (action.end_date);
          $scope.action.prospection.meeting_date  = new Date(action.prospection.meeting_date);
          $scope.action.request.response_date     = new Date (action.request.response_date);
          $scope.action.response.date_send        = new Date(action.response.date_send);
          $scope.action.feedback  ={};
          $scope.action.feedback.offer_win        ="false";
          console.log( $scope.action.feedback.offer_win);
       }

       return actionState;
    };

    //LOAD ACTIONS AND THE STATE
    loadAction();
    loadClient();

    /******************MODALS Edit phase***********************/
    //EDIT MODAL
    $ionicModal.fromTemplateUrl('templates/modals/editActionModal.html', {
       scope: $scope,
       animation: 'slide-in-up'
     }).then(function(modal) {
       $scope.editModal = modal;
     });
     $scope.openEditModal = function() {
       $scope.editModal.show();
     };
     $scope.closeEditModal = function() {
       $scope.editModal.hide();
     };

    $scope.updateAction = function(){
      actionsService.update({id:$scope.action._id},$scope.action)
      .$promise.then(
        function(response){
          $scope.action= response;
          $scope.editModal.hide();
        },function(response){
             $scope.message = "Error: "+response.status + " " + response.statusText;
        });
    }

    /******************MODALS new Phase***********************/
    //NEW PHASE MODAL
    $ionicModal.fromTemplateUrl('templates/modals/newPhaseActionModal.html', {
       scope: $scope,
       animation: 'slide-in-up'
     }).then(function(modal) {
       $scope.newModal = modal;
     });
     $scope.openNewModal = function() {
       $scope.action.prospection = {};
       $scope.newModal.show();
     };
     $scope.closeNewModal = function() {
       $scope.newModal.hide();
     };

     // Triggered on a button click, or some other target
     //ionic popUp to show the client contacts and choose one
     $scope.showPopup = function() {
       loadClient();
       $scope.myPopup = $ionicPopup.show({
         templateUrl: 'templates/popUpContacts.html',
             title: 'Select Client',
             scope: $scope,
             buttons: [{
               text: 'Cancel',
               type: 'button-calm',
               onTap: function() {
                 return true;
               }
             }]
       });
     };

    $scope.chooseContact = function(contact){
        $scope.action.prospection.contact = contact.name + " "+ contact.category +","+" "+ contact.phone +","+" "+ contact.email;
        $scope.myPopup.close();
    }

    $scope.createNewPhase = function () {
      actionsService.delete({id:$scope.action._id})
      .$promise.then(
        function(response){
          actionsService.save($scope.action)
          .$promise.then(
            function(res){
              $scope.closeNewModal();
              $scope.actionState=getActionState(res);
            },function(res){
              $scope.message = "Error: "+response.status + " " + response.statusText;
            });

        },function(response){
          $scope.message = "Error: "+response.status + " " + response.statusText;
      });

    }

    /******************MODALS closeAction***********************/
    //NEW PHASE MODAL
    $ionicModal.fromTemplateUrl('templates/modals/deleteActionModal.html', {
       scope: $scope,
       animation: 'slide-in-up'
     }).then(function(modal) {
       $scope.deleteModal = modal;
     });
     $scope.openDeleteModal = function() {
      $scope.action.feedback ={};
       $scope.deleteModal.show();
     };
     $scope.closeDeleteModal = function() {
       $scope.deleteModal.hide();
       retunrList();
     };



    $scope.closeAction = function(){

      $scope.action.feedback.offer_win=false;
      $scope.action.feedback.project_start_date=new Date();

        actionsService.delete({id:$scope.action._id})
        .$promise.then(
          function(response){
              actionsService.save($scope.action)
                  .$promise.then(function(res){
                      $scope.closeDeleteModal();
                  },function(res){
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                  });

          },function(response){
              $scope.message = "Error: "+response.status + " " + response.statusText;
          });
    };

    //retunr to the list when de actiondetail is close
    var retunrList = function (){
      if(  $scope.actionState.define == true){
          $state.go('app.defineList');
      }
      if(  $scope.actionState.prospect == true){
          $state.go('app.prospectList');
      }
      if(  $scope.actionState.request == true){
          $state.go('app.requestList');
      }
      if(  $scope.actionState.response == true){
          $state.go('app.responseList');
      }

    };

}])
;
