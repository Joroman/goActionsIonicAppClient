angular.module('myApp.services',['ngResource'])

.constant('baseUrl',"http://192.168.1.129:3000/")

.factory('clientsService',['$resource','baseUrl',function($resource,baseUrl){
    return $resource(baseURL+'clients/:id',null, {
        update:{method:'PUT'}
    });
]])
;