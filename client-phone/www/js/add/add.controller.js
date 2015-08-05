/**
 * Created by donatien-gbe on 12/06/15.
 */
'use strict';

angular.module('dascentApp')
  .controller('AddCtrl', function($scope, $cordovaBarcodeScanner) {

   $scope.scanBarcode= function(){
     $cordovaBarcodeScanner.scan().then(function(imgData){
       alert(imgData.text);
       console.log(imgData.format);
       console.log(imgData.cancelled);
     }, function(error){
       console.log("check");
       console.log(error);
     });
   }
  });
