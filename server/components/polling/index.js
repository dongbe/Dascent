/**
 * Created by donatien-gbe on 22/03/15.
 */

var http = require("http");
var https = require("https");
var device = require('./');
var querystring = require('querystring');

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
exports.getJSON = function(options, onResult)
{
  console.log("rest::getJSON");

  var prot = options.port === 443 ? https : http;
  var req = prot.request(options, function(res)
  {
    var output = '';
    var obj=null;
    console.log(options.host + ':' + res.statusCode);
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      output += chunk;
    });

    res.on('end', function() {
      if (output){
        obj = JSON.parse(output);
      }
      onResult(res.statusCode, obj);

    });
  });

  req.on('error', function(err) {
    console.log('problem with request: ' + err.message);
  });

  req.end();
};

exports.postJSON = function(data,device,onResult){
  var config={
    host: 'api.orange.com',
    method: 'POST',
    path: '/datavenue/v1/datasources/'+device.id+'/streams/'+device.stream+'/values',
    headers: {
      'X-ISS-Key': '47a2d4ef8a8847299645a9cba12d2b88',
      'X-OAPI-Key': '9jsBDxbDGwa9d6sY9PGizgEyIh8kAX7o',
      'Content-Type': 'application/json'
    }
  };

  var standard={
    host:'iotsandbox.cisco.com',
    port:8888,
    method:'POST',
    path:'/stdacsent/stdtContainer3?ty=4',
    headers:{
      'Content-Type': 'application/json',
      'X-M2M-Origin': '//iotsandbox.cisco.com:10000',
      'X-M2M-RI': 12345
    }
  };

  var post_req = https.request(config, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('Response: ' + chunk);
      onResult(chunk);
    });
  });
  var post_st_req = http.request(standard, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('Response: ' + chunk);
    });
  });
  var postData=JSON.stringify(data);
  var postStData= querystring.stringify(data);
  console.log(postData);
  post_req.write('[{"value": '+postData+'}]');
  post_req.on('error', function(err) {
    console.log('problem with request: ' + err.message);
  });
  post_req.end();
  post_st_req.write('{"con":"'+postStData+'"}');
  post_st_req.on('error', function(err) {
    console.log('problem with request: ' + err.message);
  });
  post_st_req.end();


};
