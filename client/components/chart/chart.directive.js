'use strict';

angular.module('dascentApp')
  .directive('chart', function ($window, cfpLoadingBar) {
    return {
      scope: {
        chartData: '='
      },
      template: '<div id="chartDraw"  class="col-md-6" width="500" ></div><div id="chart" class="col-md-4 col-md-offset-2"></div>',
      link: function (scope, element) {
        var text = [];
        var init = 0;
        var loading = false;
        var d3 = $window.d3;
        var w = 250;
        var h = 250;
        var r = h / 2;
        var data = [];
        var devices = [];
        var group = {};
        var object = {};
        var color = d3.scale.category10();
        var grp = [{name: 'unknown', total: 0, used: 0}];

        scope.$on('cfpLoadingBar:completed', function () {
          init++;
          if (scope.$parent.devices && init == 2 && !loading) {
            for (var i in scope.$parent.devices) {
              if (!scope.$parent.devices[i].group) {
                grp[0].total = grp[0].total + 1;
              } else {
                group = _.find(grp, {name: scope.$parent.devices[i].group[0]});
                if (group !== undefined) {
                  group.total++;
                } else {
                  grp.push({name: scope.$parent.devices[i].group[0], total: 1});
                }
              }
              if (scope.$parent.devices[i].hasOwnProperty('_owner')) {
                group = _.find(grp, {name: scope.$parent.devices[i].group[0]});
                group.used++;
                object = _.find(data, {label: 'Used'});
                if (object === undefined) {
                  data.push({label: 'Used', value: 1});
                } else {
                  object.value++;
                }
              } else {
                object = _.find(data, {label: 'Unused'});
                if (object === undefined) {
                  data.push({label: 'Unused', value: 1});
                }
                else {
                  object.value++;
                }
              }
            }

            var x = d3.scale.linear()
              .domain([0, scope.$parent.devices.length])
              .range([0, 500]);

            d3.select('#chartDraw')
              .append('div').attr('class', 'chart')
              .selectAll('div')
              .data(grp).enter()
              .append('text')
              .attr('class', 'left')
              .text(function (d) {
                return d.name;
              })
              .append('div')
              .style('width', function (d) {
                return x(d.total) + 'px';
              })
              .text(function (d) {
                return d.total;
              })
              .append('div').attr('class', 'charty')
              .style('background-color', '#09990d')
              .style('width', function (d) {
                return x(d.used) + 'px';
              })
              .text(function (d) {
                return d.used;
              });

            var vis = d3.select('#chart')
              .append('svg:svg')
              .data([data]).attr('width', w).attr('height', h)
              .append('svg:g').attr('transform', 'translate(' + r + ',' + r + ')');
            var pie = d3.layout.pie().value(function (d) {
              return d.value;
            });

// declare an arc generator function
            var arc = d3.svg.arc().outerRadius(r);

// select paths, use arc generator to draw
            var arcs = vis.selectAll('g.slice').data(pie).enter().append('svg:g').attr('class', 'slice');
            arcs.append('svg:path')
              .attr('fill', function (d, i) {
                return color(i + 2);
              })
              .attr('d', function (d) {
                return arc(d);
              });

// add the text
            arcs.append('svg:text').attr('transform', function (d) {
              d.innerRadius = 0;
              d.outerRadius = r;
              return 'translate(' + arc.centroid(d) + ')';
            }).attr('text-anchor', 'middle').text(function (d, i) {
                return data[i].value + ' ' + data[i].label + ' devices';
              }
            );
          }
        });

        if (scope.$parent.devices && init == 0) {

          if (!scope.$parent.importDevice) {
            loading = true;
            for (var i in scope.$parent.devices) {
              if (!scope.$parent.devices[i].group) {
                grp[0].total = grp[0].total + 1;
              } else {
                var group = _.find(grp, {name: scope.$parent.devices[i].group[0]});
                if (group !== undefined) group.total++; else grp.push({
                  name: scope.$parent.devices[i].group[0],
                  total: 1,
                  used: 0
                });
              }
              if (scope.$parent.devices[i].hasOwnProperty('_owner')) {
                var group = _.find(grp, {name: scope.$parent.devices[i].group[0]});
                group.used++;
                var object = _.find(data, {label: 'Used'});
                if (object === undefined)data.push({label: 'Used', value: 1}); else object.value++;
              } else {
                var object = _.find(data, {label: 'Unused'});
                if (object === undefined)data.push({label: 'Unused', value: 1});
                else
                  object.value++;
              }
            }

            var x = d3.scale.linear()
              .domain([0, scope.$parent.devices.length])
              .range([0, 500]);

            d3.select('#chartDraw')
              .append('div').attr('class', 'chart')
              .selectAll('div')
              .data(grp).enter()
              .append('text')
              .attr('class', 'left')
              .text(function (d) {
                return d.name;
              })
              .append('div')
              .style('width', function (d) {
                return x(d.total) + 'px';
              })
              .text(function (d) {
                return d.total;
              })
              .append('div').attr('class', 'charty')
              .style('background-color', '#09990d')
              .style('width', function (d) {
                return x(d.used) + 'px';
              })
              .text(function (d) {
                return d.used;
              });


            var vis = d3.select('#chart')
              .append('svg:svg')
              .data([data]).attr('width', w).attr('height', h)
              .append('svg:g').attr('transform', 'translate(' + r + ',' + r + ')');
            var pie = d3.layout.pie().value(function (d) {
              return d.value;
            });

// declare an arc generator function
            var arc = d3.svg.arc().outerRadius(r);

// select paths, use arc generator to draw
            var arcs = vis.selectAll('g.slice').data(pie).enter().append('svg:g').attr('class', 'slice');
            arcs.append('svg:path')
              .attr('fill', function (d, i) {
                return color(i + 2);
              })
              .attr('d', function (d) {
                return arc(d);
              });

// add the text
            arcs.append('svg:text').attr('transform', function (d) {
              d.innerRadius = 0;
              d.outerRadius = r;
              return 'translate(' + arc.centroid(d) + ')';
            }).attr('text-anchor', 'middle').text(function (d, i) {
                return data[i].value + ' ' + data[i].label + ' devices';
              }
            );
          }
        }
      }
    };

  });
