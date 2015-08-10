/**
 * Created by donatien-gbe on 12/06/15.
 */
'use strict';

angular.module('dascentApp')
  .controller('AddCtrl', function($scope, $cordovaBarcodeScanner, ManDev) {

   $scope.scanBarcode= function(){
     $cordovaBarcodeScanner.scan().then(function(imgData){

       ManDev.addDevice(imgData.text).then(function(){
         alert("Device "+imgData.text+" added successfully");
       }).catch(function(error){
         alert(error.message);
       });
     }, function(error){
       alert(error.message);
     });
   }
  });
