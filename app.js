//Intializing the module 
var fancyMonk= angular.module('fancyMonk',['ngRoute','ui.bootstrap']);

//Routing part 
fancyMonk.config(['$routeProvider',function($routeProvider,$locationProvider){

$routeProvider

.when('/',{
    templateUrl: 'pages/home.html',
    controller: 'mainController'
})

.when('/details',{
        templateUrl: 'pages/details.html',
        controller: 'detailsController'
})

.when('/addRestaurant',{
    templateUrl: 'pages/addRestaurant.html',
    controller: 'addRestaurantController'
})

.when('/addedRestaurant',{
    templateUrl: 'pages/addedRestaurant.html',
    controller: 'addedRestaurantController'
})
}]);

//this is a service to store the current logged in user detail (.i.e, mail_id)
fancyMonk.service('userDetails',function(){
    this.mail_id = ''; 
})
//this is mainController
fancyMonk.controller('mainController',function($scope,$uibModal,$http,$location,userDetails){
    //this is to open login modal
    $scope.openLogin = function(){
        var loginFlag = false;
        var modalInstance =  $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'login.html',
            controller: 'loginModalInstanceCtrl',
            size: 'lg'
        });
        modalInstance.result.then(function(data){
             //fetch the user details from json for authentication process
             $http.get('http://localhost:3000/users').then(function (response) {
                for(var i=0;i<response.data.length;i++){
                    if(response.data[i].username === data.name && response.data[i].password === data.password){
                        console.log('User is aunthenticated');
                        userDetails.mail_id = data.name;
                        $location.path('/details');
                        loginFlag = false;
                        break;
                    }
                    else{
                        loginFlag = true; 
                    }
                }
                if(loginFlag){
                    window.alert('Enter valid username and password!');
                        $scope.openLogin();
                }
             });
        });
    }
    $scope.id = 1;
    //This is to open signUp modal
    $scope.openSignUp = function(){
         var modalInstance =  $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'signUp.html',
            controller: 'signUpModalInstanceCtrl',
            size: 'lg'
        });
        modalInstance.result.then(function(data){
            var signUpData = {
                id: $scope.id.toString(),
                name : data.name,
                mobile_number : data.mobileNumber,
                mail_id: data.username,
                password: data.password
            }
            //updating the json to store new user details
            $http.post('http://localhost:3000/userDetails',angular.toJson(signUpData)).then(function (response) {
                $scope.id =$scope.id+1;
                console.log('SignUp is successfull'); 
                var loginData = {
                    id: $scope.id.toString(),
                    username:data.username,
                    password:data.password
                }
                console.log('loginData:',loginData);
                 //updating the json to store new user details
                $http.post('http://localhost:3000/users',angular.toJson(loginData)).then(function(response){
                    console.log('login details added successfully');
                });
                $location.path('/details');
            });
        });
    }
})

fancyMonk.controller('detailsController',function($scope,$uibModal,$http,$location,userDetails){
    var index ;
    $scope.restaurants = [];
    //to get the details for current logged in user
    $http.get('http://localhost:3000/userDetails').then(function(response){
        for(var i=0;i<response.data.length;i++){
            if(userDetails.mail_id === response.data[i].mail_id){
                index = i;
                break;
            }
        }
        $scope.name = response.data[index].name;
    });
    //to get the list of restaurants from json
    $http.get('http://localhost:3000/restaurants').then(function(response){
        for(var j=0;j<response.data.length;j++){
            $scope.restaurants.push(response.data[j]);
        }
    });
});

//this is the  addRestaurant controller
fancyMonk.controller('addRestaurantController',function($scope,$uibModal,$http,$rootScope,$location,userDetails){

        $scope.finish = true;
        var index;
        $scope.restaurantCuisines = [];
        $scope.menuDetails = [];
        $scope.tableDetails = [];
        //this is used to get the current logged in user details
        $http.get('http://localhost:3000/userDetails').then(function(response){
        for(var i=0;i<response.data.length;i++){
            if(userDetails.mail_id === response.data[i].mail_id){
                index = i;
                break;
            }
        }
        $scope.name = response.data[index].name;
    });
    //this is invoke the addMenu modal
    $scope.showAddMenu = function(){
        var modalInstance =  $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'addMenu.html',
            controller: 'addMenuModalInstanceCtrl',
            size: 'lg',
            resolve:{
                details : function(){
                    return $scope.restaurantMenuType;
                }
            }
        });
        modalInstance.result.then(function(data){
            $scope.menuDetails.push(data);
        })
        console.log('menu details:', $scope.menuDetails);
    }
    //This is used to invoke the addTable modal
    $scope.showAddTable = function(){
        var modalInstance =  $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'addTable.html',
            controller: 'addTableuModalInstanceCtrl',
            size: 'lg',
        });
        modalInstance.result.then(function(data){
            $scope.tableDetails.push(data);
            $scope.finish = false;
        })
        console.log('table details:', $scope.tableDetails);
    }
    $rootScope.id = 1;
    $scope.done = function(){
        $scope.restaurantDetails = {
        name : $scope.restaurantName,
        location: $scope.restaurantLocation,
        menuType: $scope.restaurantMenuType,
        cuisines: $scope.restaurantCuisine,
        tableCount: $scope.restaurantTableCount
    }
    console.log('restaurantDetails:',$scope.restaurantDetails);
        var postData = {
        id: $rootScope.id,
        username : $scope.name,
        restaurantDetails: $scope.restaurantDetails,
        menuDetails : $scope.menuDetails,
        tableDetails : $scope.tableDetails
        }
    $http.post('http://localhost:3000/addedRestaurant',postData).then(function(response){
     console.log('response',response);   
     $rootScope.id  = $rootScope.id + 1;
     $location.path('/addedRestaurant');
    })
    }
    
});
//This is the login modal instance controller
fancyMonk.controller('loginModalInstanceCtrl',function($scope,$uibModalInstance){
    //this is used to returnt the modal details
    $scope.ok = function(){
    $uibModalInstance.close({name:$scope.username,password:$scope.password});
    }
    //this is used to dismiss the modal
    $scope.cancel = function(){
    $uibModalInstance.dismiss();
    }
})

//this is the Add MEnu modal instance controller
fancyMonk.controller('addMenuModalInstanceCtrl',function($scope,$uibModalInstance,details){
     //These variables are used for the manipulation over the Modal
    $scope.menuTaxonomy = details;
    $scope.taxonMenuItem = false;
    $scope.showOtherDetails = false;
    $scope.taxonsPrice = '';
    $scope.foodDescription = '';

    //to check whether checkbox is checked/unchecked
    $scope.checkbox = function(value){
        if(value === 'menu'){
            $scope.selectedTaxonomy = $scope.menuTaxonomy;
            console.log('selectedTaxonomy:',$scope.selectedTaxonomy);
        }
        else{
            $scope.selectedTaxonomy = value;
            console.log('selectedTaxonomy:',$scope.selectedTaxonomy);
        }
    }
    //to show the dropdown
    $scope.showMenuItem = function(){
        $scope.taxonMenuItem = true;
    }
    //This is used to update the taxons2 variable
    $scope.showDetails = function(value){
        $scope.taxons2 = value;
        $scope.showOtherDetails = true;
    }
    //This is used to update the taxonsPrice variable
    $scope.priceInput = function(value){
        $scope.taxonsPrice = value;
    }
    //This is used to update the foodDescription variable
    $scope.foodInput = function(value){
        $scope.foodDescription = value;
        $scope.showAddTable = true;
    }
    //This is used to return the modal details
    $scope.ok = function(){
        $uibModalInstance.close({'menuTaxonomy':$scope.menuTaxonomy,'taxons1':$scope.taxons1,'taxons2':$scope.taxons2,'taxonsPrice':$scope.taxonsPrice,'foodDescription':$scope.foodDescription});
    }
})


//This is the SignUp modal instance controller
fancyMonk.controller('signUpModalInstanceCtrl',function($scope,$uibModalInstance){
    //This returns the modal details
    $scope.ok = function(){
        $uibModalInstance.close({name:$scope.name,mobileNumber:$scope.mobileNumber,username:$scope.username,password:$scope.password});
    }
    //This is used to dismiss the modal
    $scope.cancel = function(){
        $uibModalInstance.dismiss();
    }
})

//This is the Add table modal instance controller
fancyMonk.controller('addTableuModalInstanceCtrl',function($scope,$uibModalInstance){
    //this returns the modal details
    $scope.ok = function(){
        $uibModalInstance.close({'tableId':$scope.tableId,'tableName':$scope.tableName,'tableChairsCount':$scope.tableChairsCount});
    }
})

//this is the addedRestaurantController
fancyMonk.controller('addedRestaurantController',function($scope,$http){

//to the addedRestaurant details from json
    $http.get('http://localhost:3000/addedRestaurant').then(function(data){
        console.log('data:',data);
        $scope.addedRestaurant =  data.data[0].restaurantDetails;
    })
})