'use strict';

angular.module('dascentApp')
  .controller('SignupCtrl', function ($http, $scope, Auth, $location, notifications, vcRecaptchaService) {
    $scope.user = {};
    $scope.errors = {};
    $scope.key = '6LfJBggTAAAAAKTxuVMmz97y5k1bWyB5FFi5wgJy';//recaptha public key
    $scope.response = true;
    $scope.mill={};

    $scope.test = function(form){
      var value = document.getElementById('ex-text').value;
      console.log(value);
    };
    $scope.init = function () {
     console.log("test");
     var test='MSG NUM @\n@\n@\n@';
     var lines;
     lines = test.split('\n');
     var format=lines[0]+'________\n';
     for (var i = 1; i < lines.length; i++) {
       format+=lines[i]+'________\n';
     }

     var mk = {
       elm: document.getElementById('ex-text'),
       format: format,
       separator: '\n@ /'+test,
       typeon: '_',
       allowed: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
       onbadkey: function(){
         var origStyle = document.getElementById('ex-text').style['color'];
         document.getElementById('ex-text').style['color'] = '#f00';
         setTimeout(function(){ document.getElementById('ex-text').style['color']=origStyle; },120);
       }
     };
      $scope.formatted = MaskedInput(mk);
     document.addEventListener("load",$scope.formatted, false);
     document.getElementById("demo").innerHTML = "Iframe is loaded.";
      console.log($scope.formatted);
    };
    $scope.setResponse = function (response) {
      $scope.response = true;
    };
    $scope.setWidgetId = function (widgetId) {
      $scope.widgetId = widgetId;
    };


    $scope.register = function (form) {
      $scope.submitted = true;
      /*
      var response = vcRecaptchaService ? vcRecaptchaService.getResponse($scope.widgetId) : '';

      if (response.length < 1) {
        $scope.response = false;
      } else {
        $scope.response = true;
      } */
      if (form.$valid) {

        if ($scope.user.password1 === $scope.user.password2) {
          Auth.createUser({
            name: $scope.user.name,
            lastname: $scope.user.lastname,
            email: $scope.user.email,
            password: $scope.user.password1

          })
            .then(function () {
              // Account created, redirect to home
              notifications.showSuccess('Account successfully created!!');
              $location.path('/login');
            })
            .catch(function (err) {
              err = err.data;
              $scope.errors = {};
              $scope.response = false;
              vcRecaptchaService.reload($scope.widgetId);

              // Update validity of form fields that match the mongoose errors
              angular.forEach(err.errors, function (error, field) {
                form[field].$setValidity('mongoose', false);
                $scope.errors[field] = error.message;
              });
            });
        }
        else {
          notifications.showError('password not good');
        }

      }
    };

    $scope.registerPro = function (form) {
      $scope.submitted = true;
      /*
      var response = vcRecaptchaService.getResponse($scope.widgetId);
      if (response.length < 1) {
        $scope.response = false;
      } else {
        $scope.response = true;
      }*/
      if (form.$valid) {
        if ($scope.user.password1 === $scope.user.password2) {
          Auth.createUser({
            name: $scope.user.name,
            isskey: $scope.user.isskey,
            idclient: $scope.user.idclient,
            email: $scope.user.email,
            password: $scope.user.password1
          })
            .then(function () {
              // Account created, redirect to home
              notifications.showSuccess('Account successfully created!!');
              $location.path('/login');
            })
            .catch(function (err) {
              err = err.data;
              $scope.errors = {};
              $scope.response = false;
              vcRecaptchaService.reload($scope.widgetId);

              // Update validity of form fields that match the mongoose errors
              angular.forEach(err.errors, function (error, field) {
                form[field].$setValidity('mongoose', false);
                $scope.errors[field] = error.message;
              });
            });
        }
        else {
          notifications.showError('password not good');
        }
      }
    };

  });
