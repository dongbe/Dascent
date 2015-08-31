'use strict';

angular.module('dascentApp')
  .controller('SettingsCtrl', function ($scope, User, Auth, notifications, Upload) {
    $scope.errors = {};
    $scope.user = Auth.getCurrentUser();
    $scope.isConstructor = Auth.isConstructor();
    $scope.uploadedImage = {};
    $scope.new = {};

    $scope.changePassword = function (form) {
      $scope.submitted = true;
      if (form.$valid) {
        Auth.changePassword($scope.user.oldPassword, $scope.user.newPassword)
          .then(function () {
            $scope.message = 'Password successfully changed.';
            $scope.pwd = false;
          })
          .catch(function () {
            form.password.$setValidity('mongoose', false);
            $scope.errors.other = 'Incorrect password';
            $scope.message = '';
          });
      }
    };

    $scope.update = function (form) {
      $scope.submitted = true;
      if (form.$valid) {

        if ($scope.isConstructor) {
          Auth.updateProvider({
            name: $scope.user.name,
            lastname: $scope.user.lastname,
            email: $scope.user.email
          })
            .then(function () {
              // Account created, redirect to home
              notifications.showSuccess('Account successfully updated!!');
            })
            .catch(function (err) {
              err = err.data;
              $scope.errors = {};
              $scope.response = false;

              // Update validity of form fields that match the mongoose errors
              angular.forEach(err.errors, function (error, field) {
                form[field].$setValidity('mongoose', false);
                $scope.errors[field] = error.message;
              });
            });
        } else {
          Auth.update({
            name: $scope.user.name,
            lastname: $scope.user.lastname,
            email: $scope.user.email,
            isskey: $scope.user.isskey,
            idclient: $scope.user.idclient
          })
            .then(function () {
              // Account created, redirect to home
              notifications.showSuccess('Account successfully updated!!');
            })
            .catch(function (err) {
              err = err.data;
              $scope.errors = {};
              $scope.response = false;

              // Update validity of form fields that match the mongoose errors
              angular.forEach(err.errors, function (error, field) {
                form[field].$setValidity('mongoose', false);
                $scope.errors[field] = error.message;
              });
            });
        }
      }
    };

    $scope.onFileSelect = function (image) {
      // This is how I handle file types in client side
      if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
        notifications.showError('Only PNG and JPEG are accepted.');
        return;
      }
      $scope.uploadInProgress = true;
      $scope.uploadProgress = 0;

      $scope.upload = Upload.upload({
        url: '/api/users/' + $scope.user._id + '/avatar',
        method: 'POST',
        file: image
      }).progress(function (event) {
        $scope.uploadProgress = Math.floor(event.loaded / event.total);
      }).success(function (data) {
        $scope.uploadInProgress = false;
        // If you need uploaded file immediately
        $scope.user.avatar = data;
        $scope.imageSrc = null;

      }).error(function (err) {
        $scope.uploadInProgress = false;
        console.log('Error uploading file: ' + err.message || err);
      });
    };
  })
  .directive('ngFileSelect', function () {
    return {
      link: function ($scope, el) {
        el.bind('change', function (e) {
          var reader = new FileReader();
          reader.onload = function (loadEvent) {
            $scope.$apply(function () {
              $scope.imageSrc = loadEvent.target.result;
            });
          };
          $scope.files = e.target.files[0];
          reader.readAsDataURL(e.target.files[0]);
        });
      }
    };
  });
