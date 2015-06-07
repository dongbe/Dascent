/**
 * Created by donatien-gbe on 22/03/15.
 */

var http = require("http");
var https = require("https");
var device = require('./');

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
exports.getJSON = function(options, onResult)
{
  console.log("rest::getJSON");

  var prot = options.port == 443 ? https : http;
  var req = prot.request(options, function(res)
  {
    var output = '';
    console.log(options.host + ':' + res.statusCode);
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      output += chunk;
    });

    res.on('end', function() {
      if (output){
        var obj = JSON.parse(output);
      }else{
        obj=null;
      }
      onResult(res.statusCode, obj);

    });
  });

  req.on('error', function(err) {
    console.log('problem with request: ' + err.message);
  });

  req.end();
};
