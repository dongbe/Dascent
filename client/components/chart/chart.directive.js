'use strict';

angular.module('dascentApp')
  .directive('chart', function ($window) {
      return {
        scope:{
          chartData:'='
        },
        template: '<div id="chart" width="850" height="200"></div>',
        restrict: 'EA',
        link: function (scope, element, attrs) {
          var dataToPlot=[];
          scope.$watch('chartData', function(newval,oldval){
            if (!newval) {
              return;
            }
            dataToPlot=newval;
            console.log(dataToPlot);
            var group=[];
            var nouveau=true;
            if(dataToPlot.length){
              var grp=[{name:"unknown",nb:0}];
              for (var i in dataToPlot){
                if(!dataToPlot[i].group){
                  grp[0].nb=grp[0].nb+1;
                }else{
                  for(var y=0 in grp){
                    if (dataToPlot[i].group[0]===grp[y].name){
                      grp[y].nb+=1;
                      nouveau=false;
                    }
                  }
                  if(nouveau){
                    grp.push({name:dataToPlot[i].group[0],nb:1});
                  }
                }
              }
              group=grp;
            }
            console.log(group);

          });

          var data =[4,8,15,16,23,42];
          var letter=["A","B","C","D","E","F"];
          var d3= $window.d3;
          var x = d3.scale.linear()
            .domain([0, d3.max(data)])
            .range([0, 420]);
          var y = d3.scale.linear()
            .domain(letter)
            .range([letter.length*10, 0]);

          var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

          var chart = d3.select('#chart')
            .append("div").attr("class", "chart")
            .selectAll('div')
            .data(data).enter()
            .append("text")
            .attr("class", "left")
            .text("test")
            .append("div").transition().ease("elastic")
            .style("width", function(d) { return x(d) + "px"; })
            .text(function(d) { return d; });
          /*var chart = d3.select('#chart').append("div").attr("class", "chart").selectAll('div').data(data).enter()
           .append("div").transition().ease("elastic").style("width", function(d) {return x(d) + "%";})
           .text(function(d){return d +"%";});*/
          //element.text('this is the chart directive');
        }
      };

  });
