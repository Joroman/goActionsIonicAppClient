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
          $scope.clients = response.sort(function(a,b) {
            return (a.company_name > b.company_name) ? 1 : ((b.company_name > a.company_name) ? -1 : 0);
          } );
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
  $scope.showPanel= true;
  $scope.showDef  = false;
  $scope.showPros = false;
  $scope.showReq  = false;
  $scope.showRes  = false;

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

  /*****************SHOW LIST ACTION**************************/
  $scope.showList= function(define,prospect,request,response){
    $scope.actions=actionsService.query()
      .$promise.then(
            function(res){
              $scope.actions = res;
              $scope.actionsSort = actionsSortService.sortActions(res);

              $scope.showPanel= false;
              $scope.showDef  = define;
              $scope.showPros = prospect;
              $scope.showReq  = request;
              $scope.showRes  = response;


          },function (response) {
               $scope.message = "Error: "+response.status + " " + response.statusText;
      });

  }

  $scope.resetView= function(){
    $scope.showPanel= true;
    $scope.showDef  = false;
    $scope.showPros = false;
    $scope.showReq  = false;
    $scope.showRes  = false;
  }

  $scope.goActionDetail = function(action){
    //go to contacts
    $state.go('app.actionDetail',{id:action._id});
    $scope.resetView();

  };

}])

.controller('ActionDetailController',['$scope','$stateParams','actionsService','$ionicModal','clientsService','$ionicPopup','$state',
function($scope,$stateParams,actionsService,$ionicModal,clientsService,$ionicPopup,$state){
  $scope.action={};
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
      var actionState = {define:true,prospect:false,request:false,response:false};
       // ACTIVE ACTIONS DEFINE ACTIONS
        if (action.feedback==null && action.response==null && action.request==null && action.prospection==null){
            actionState.define=true;
            actionState.prospect=false;
            actionState.request=false;
            actionState.response=false;
            $scope.action.start_date    = new Date (action.start_date);
            $scope.action.end_date      = new Date (action.end_date);

        }
       // ACTIVE ACTIONS PORSPECTION ACTIONS
       if (action.feedback==null && action.response==null && action.request==null && action.prospection!=null){
          actionState.prospect=true;
          actionState.define=false;
          actionState.request=false;
          actionState.response=false;
          $scope.action.start_date    = new Date (action.start_date);
          $scope.action.end_date      = new Date (action.end_date);
          $scope.action.prospection.meeting_date = new Date(action.prospection.meeting_date);
        }
       // ACTIVE ACTIONS REQUEST ACTION
       if (action.feedback==null && action.response==null && action.request!=null && action.prospection!=null){
          actionState.request=true;
          actionState.define=false;
          actionState.prospect=false;
          actionState.response=false;
           $scope.action.start_date    = new Date (action.start_date);
           $scope.action.end_date      = new Date (action.end_date);
           $scope.action.prospection.meeting_date  = new Date(action.prospection.meeting_date);
           $scope.action.request.response_date     = new Date (action.request.response_date);
        }
      //ACTIVE ACTIONS RESPONSE ACTION
      if (action.feedback==null && action.response!=null && action.request!=null && action.prospection!=null){
          actionState.response=true;
          actionState.define=false;
          actionState.prospect=false;
          actionState.request=false;
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
    };

    /******************MODALS new Phase***********************/
    //NEW PHASE MODAL
    $ionicModal.fromTemplateUrl('templates/modals/newPhaseActionModal.html', {
       scope: $scope,
       animation: 'slide-in-up'
     }).then(function(modal) {
       $scope.newModal = modal;
     });
     $scope.openNewModal = function() {
       createNewActionPhase();
       $scope.newModal.show();
     };
     $scope.closeNewModal = function() {
       $scope.newModal.hide();
     };

     var createNewActionPhase = function(){
        if($scope.actionState.define == true){
          $scope.action.prospection={};
          $scope.action.prospection.contact="";
        }
        if($scope.actionState.prospect == true)
        {
          $scope.action.request={};
        }
        if($scope.actionState.request == true)
          $scope.action.response={};

        if($scope.action.response==true)
          $scope.actionState.feedback={};
     }
     // Triggered on a button click, or some other target
     //ionic popUp to show the client contacts and choose one
     $scope.showPopup = function() {
       $scope.action.prospection.contact="";
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
            //  $scope.actionState=getActionState(res);
              $state.go('app.activeActions');
            },function(res){
              $scope.message = "Error: "+response.status + " " + response.statusText;
            });

        },function(response){
          $scope.message = "Error: "+response.status + " " + response.statusText;
      });

    }

    /******************MODALS closeAction***********************/
    //DELETE MODAL
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
      $state.go('app.activeActions');
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

}])

.controller('CloseActionsController',['$scope','actionsService','$state',function($scope,actionsService,$state){

  $scope.year       = new Date().getFullYear();
  $scope.wins       =[];
  $scope.losses     =[];
  $scope.dataWins   =[];
  $scope.dataLosses =[];
  $scope.data       = new Array (2);
  $scope.data[0]    = new Array(12);
  $scope.data[1]    = new Array (12);
  $scope.showWin        =true;

  $scope.seeList=function(){
    $scope.showWin= !$scope.showWin;
  }

  var getActions = function(){
    actionsService.query()
      .$promise.then(
        function(response){
          takeCloseActions(response);
          $scope.wins       = filterYear($scope.wins);
          $scope.losses     = filterYear($scope.losses);
          $scope.dataWins   = countOnMonths($scope.wins);
          $scope.dataLosses = countOnMonths($scope.losses);
          setDataValue();
      },function(response){
        $scope.message = "Error: "+response.status + " " + response.statusText;
    });
  };

  getActions();

  //take only the actions close and fitlter for win and lose.
  var takeCloseActions = function (actions) {
        for (var x=0; x<actions.length; x++){
          if(actions[x].feedback!= null && actions[x].feedback.offer_win==true){
            $scope.wins.push(actions[x]);
          }
          if(actions[x].feedback!= null && actions[x].feedback.offer_win==false){
            $scope.losses.push(actions[x]);
          }
        }
      $scope.wins.sort(function(a,b) {
          return new Date(a.feedback.project_start_date).getTime() - new Date(b.feedback.project_start_date).getTime();
      });
      $scope.losses.sort(function(a,b) {
        return new Date(a.feedback.project_start_date).getTime() - new Date(b.feedback.project_start_date).getTime();
    });
    };


    //filter the array for year
    var filterYear = function(actions){
      var arrayYear= [];
      for (var x = 0 ; x<actions.length; x++){
        if($scope.year === new Date (actions[x].feedback.project_start_date).getFullYear()){
          arrayYear.push(actions[x]);
        }
      }
      return arrayYear;
    };

    // put in an array of months 0 January 11 dicember
    // count de number of actions in this month
    var countOnMonths = function (array) {
      var orderArray = new Array(12);
      var count = 0;
      for (var month = 0; month<12; month++){
        count=0;
        for (var x = 0; x< array.length; x++){
          if (month === new Date(array[x].feedback.project_start_date).getMonth())
              count ++;
        }
        orderArray[month]=count;
      }

      return orderArray;
    };


    //generate Bidimensional array for tuelve months
    var setDataValue = function(){
      for (var x=0; x<12; x++){
        $scope.data[0][x]=$scope.dataWins[x];
        $scope.data[1][x]=$scope.dataLosses[x];
      }
    };

    //change the year update the GRAPH
    $scope.updateGraph = function(year){
      $scope.year=year;
      $scope.wins       =[];
      $scope.losses     =[];
      $scope.dataWins   =[];
      $scope.dataLosses =[];
      $scope.data       = new Array (2);
      $scope.data[0]    = new Array(12);
      $scope.data[1]    = new Array (12);
      getActions();
    };

    $scope.showDetail = function(action){
        $state.go('app.closeActionDetail',{id:action._id});
    };

    /** CREATE THE CHART TO SHOW THE GRAPH**/
    $scope.labels = ["January", "February", "March", "April", "May", "June", "July","August","September","October","November","December"];
    $scope.series = ['Actions WIN', 'Actions LOSE'];

    $scope.onClick = function (points, evt) {
      console.log(points, evt);
    };
}])

.controller('CloseActionDetailController',['$scope','actionsService','$stateParams',function ($scope,actionsService,$stateParams) {

  actionsService.get({id:$stateParams.id})
  .$promise.then(
      function(response){
        $scope.action=response;
        controllCars(response);
      },function(response){
          $scope.message = "Error: "+response.status + " " + response.statusText;
    });

    var controllCars = function (action) {
      if(action.feedback.offer_win==true){
          $scope.res=true;
          $scope.req=true;
          $scope.pro=true;

      }
      else{
        if(action.response!=null && action.request!= null && action.prospection!=null){
          $scope.res=true;
          $scope.req=true;
          $scope.pro=true;

        }
        if(action.response==null && action.request!= null && action.prospection!=null){
          $scope.res=false;
          $scope.req=true;
          $scope.pro=true;

        }
        if(action.response==null && action.request== null && action.prospection!=null){
          $scope.res=false;
          $scope.req=false;
          $scope.pro=true;

        }
        if(action.response==null && action.request== null && action.prospection==null){
          $scope.res=false;
          $scope.req=false;
          $scope.pro=false;

        }
      }

    }

}])

.controller('SalesController',['$scope','salesService','clientsService',function($scope,salesService,clientsService){

  $scope.year             = new Date().getFullYear();
  $scope.salesYear        =[];
  $scope.salesLastYear    =[];
  $scope.dataSalesYear    =[];
  $scope.dataSalesLastYear=[];
  $scope.clientsYear      =[];
  $scope.clientsLastYear  =[];
  $scope.data       = new Array (2);
  $scope.data[0]    = new Array(12);
  $scope.data[1]    = new Array(12);

  var getSales = function(){
    salesService.query()
    .$promise.then(
      function (response) {
        $scope.sales = response;
        $scope.salesYear        =filterYear(response,$scope.year);
        $scope.salesLastYear    =filterYear(response,($scope.year -1));
        $scope.clientsYear      =takeClients($scope.salesYear);
        $scope.clientsLastYear  =takeClients($scope.salesLastYear);
        $scope.dataSalesYear    =countMonthSales($scope.salesYear);
        $scope.dataSalesLastYear=countMonthSales($scope.salesLastYear);
        setValueSales();

    },function(response){
          $scope.message = "Error: "+response.status + " " + response.statusText;
    });
  }


  //filter the array for year
  var filterYear = function(sales,year){
    var arrayYear= [];
    for (var x = 0 ; x<sales.length; x++){
      if(year === new Date (sales[x].sales_date).getFullYear()){
        arrayYear.push(sales[x]);
      }
    }
    return arrayYear;
  };

  //take the list of clients that have sales with sales object
  var takeClients = function(sales){
    var list=[];
    if(sales.length>0){
      for(var x =0; x< sales.length; x++){
        if(list.indexOf(sales[x]._client)==-1){
          list.push(sales[x]._client);
        }
      }
    }
    return list;
  };

  var countMonthSales = function(sales){
    var arrayMonthSales = new Array(12);
    var salesMonth=0;

    for (var month =0; month<12 ; month++){
      salesMonth=0;
        for(var x=0; x<sales.length; x++){
          if(month== new Date(sales[x].sales_date).getMonth())
            salesMonth= salesMonth + sales[x].project_price;
        }
        arrayMonthSales[month] = salesMonth;
    }
    return arrayMonthSales;
  };

  var setValueSales= function(){
    $scope.data[0]=$scope.dataSalesYear;
    $scope.data[1]=$scope.dataSalesLastYear;
  }

  getSales();


  /** CREATE THE CHART TO SHOW THE GRAPH**/
  $scope.labels = ["January", "February", "March", "April", "May", "June", "July","August","September","October","November","December"];
  $scope.series = ["Sales " + $scope.year, "Sales " + ($scope.year-1)];
    /*$scope.data   =[
    [65, 59, 80, 81, 56, 55, 40,90,100,20,11,200],
   [28, 48, 40, 19, 86, 27, 90,23,99,120,11,67]
 ];*/
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };

}])
;
