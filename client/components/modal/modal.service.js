'use strict';

angular.module('dascentApp')
  .factory('Modal', function ($rootScope, $modal) {
    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $modal.open() returns
     */
    function openModal(scope, modalClass) {
      var modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';

      angular.extend(modalScope, scope);

      return $modal.open({
        templateUrl: 'components/modal/modal.html',
        windowClass: modalClass,
        scope: modalScope
      });
    }

    // Public API here
    return {

      /* Confirmation modals */
      confirm: {

        /**
         * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} del - callback, ran when delete is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        delete: function (del) {
          del = del || angular.noop;

          /**
           * Open a delete confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed staight to del callback
           */
          return function () {
            var args = Array.prototype.slice.call(arguments),
              name = args.shift(),
              deleteModal;

            deleteModal = openModal({
              modal: {
                dismissable: true,
                title: 'Confirm Delete',
                html: '<img ng-src="' + name[0].path + '">' +
                '<p>Are you sure you want to delete <strong>' + name[0] + '</strong> ?</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: 'Delete',
                  click: function (e) {
                    deleteModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function (e) {
                    deleteModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            deleteModal.result.then(function (event) {
              del.apply(event, args);
            });
          };
        },

        browse: function (del) {
          del = del || angular.noop;

          return function () {
            var args = Array.prototype.slice.call(arguments),
            //name = args.shift(),
              browseModal;

            browseModal = openModal({
              modal: {
                dismissable: true,
                title: 'Confirm upload',
                html: '<p>Are you sure you want to Upload the file ?</p>',
                buttons: [{
                  classes: 'btn-primary',
                  text: 'Create device',
                  click: function (e) {
                    browseModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function (e) {
                    browseModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-primary');

            browseModal.result.then(function (event) {
              del.apply(event, args);
            });
          };
        },
        upload: function (del) {
          del = del || angular.noop;

          return function () {
            var args = Array.prototype.slice.call(arguments),
              name = args.shift(),
              uploadModal;
            uploadModal = openModal({
              modal: {
                dismissable: true,
                title: 'Confirm upload',
                html: '<p>Are you sure you want to Upload the file?</p>  ' +
                '<form class="form" ng-submit="createDevice(fileContent)" novalidate>' +
                '<input type="file" file-reader="fileContent" accept=".csv" required>' +
                '<button class="btn btn-success" type="submit">Create devices</button>' +
                '</form>',
                buttons: [{
                  classes: 'btn-primary',
                  text: 'Create device',
                  click: function (e) {
                    uploadModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function (e) {
                    uploadModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-primary');

            uploadModal.result.then(function (event) {
              del.apply(event, args);
            });
          };
        }
      }
    };
  });
