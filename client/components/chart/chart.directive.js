'use strict';

angular.module('dascentApp')
  .directive('chart', function ($window) {
      return {
        scope:{
          chartData:'='
        },
        template: '<div id="chartDraw" width="510" ng-cloak></div>',
        link: function (scope,element) {
          var text = [];

          console.log(scope.$parent.devices);


          if(scope.$parent.devices){
            var grp=[{name:'unknown',nb:0}];
            for (var i in scope.$parent.devices){
              var nouveau=true;
              if(!scope.$parent.devices[i].group){
                grp[0].nb=grp[0].nb+1;
              }else{
                for(var y in grp){
                  if (scope.$parent.devices[i].group[0]===grp[y].name){
                    grp[y].nb+=1;
                    nouveau=false;
                  }
                }
                if(nouveau){
                  grp.push({name:scope.$parent.devices[i].group[0],nb:1});
                }
              }
            }

            var d3= $window.d3;
            var x = d3.scale.linear()
              .domain([0, scope.$parent.devices.length])
              .range([0, 500]);

            d3.select('#chartDraw')
              .append('div').attr('class', 'col-md-6 chart')
              .selectAll('div')
              .data(grp).enter()
              .append('text')
              .attr('class', 'left')
              .text(function(d) { return d.name; })
              .append('div').transition().ease('elastic')
              .style('width', function(d) { return x(d.nb) + 'px'; })
              .text(function(d) { return d.nb; });
          }
          scope.$watch(scope.$parent.devices,function (data) {
            console.log(data);

          });

        }
      };

  });
