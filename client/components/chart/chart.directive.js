'use strict';

angular.module('dascentApp')
  .directive('chart', function ($window) {
      return {
        scope:{
          chartData:'='
        },
        template: '<div id="chart" width="510"></div>',
        link: function (scope,element) {
          var data = [];
          var text = [];

          scope.$watch(function (data) {

            if(data.chartData.length>0){
              var grp=[{name:'unknown',nb:0}];
              for (var i in data.chartData){
                var nouveau=true;
                if(!data.chartData[i].group){
                  grp[0].nb=grp[0].nb+1;
                }else{
                  for(var y in grp){
                    if (data.chartData[i].group[0]===grp[y].name){
                      grp[y].nb+=1;
                      nouveau=false;
                    }
                  }
                  if(nouveau){
                    grp.push({name:data.chartData[i].group[0],nb:1});
                  }
                }
              }

              var d3= $window.d3;
              var x = d3.scale.linear()
                .domain([0, data.chartData.length])
                .range([0, 500]);

              d3.select('#chart')
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
          });

        }
      };

  });
