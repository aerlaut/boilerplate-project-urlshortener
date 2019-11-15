'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var BodyParser = require('body-parser');

var cors = require('cors');

var app = express();
app.use(BodyParser.urlencoded({extended: false}))
        
// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


// Create mongoose Schema
mongoose.connect(process.env.MONGO_URI);

var Schema = mongoose.Schema;

var URLSchema = new Schema({
  id: {type: Number, required: true},
  url: {type: String, required: true }
});

var URL = mongoose.model('URL', URLSchema);

// your first API endpoint... 
app.post('/api/shorturl/new', function (req, res) {
  
  let url_check = /^(http(s)?:\/\/)?([a-zA-Z\-]+)?(\.[a-zA-Z\-]+)+(\/([-a-zA-Z0-9@:%_\+.~#?&//=]*))?$/g;
  
  if(!url_check.test(req.body.url)) {
    
    res.json({"error":"invalid URL"});
    
  } else {
    
  // check DNS for errors
  
    let lookup_str = req.body.url.replace(/^https?:\/\//g, '');

    dns.lookup(lookup_str, function (err, addresses) {
      if(err) console.error(err.code);
    });

    let idx; 
    URL.countDocuments( function (err, count) {

      if (err) console.error("count" + err);
      idx = count;

      URL.create({ id : idx + 1, url : req.body.url }, function (err, data) {
        if(err) console.error(err);
        res.json({"original_url": req.body.url, "short_url": data.id})
      });

    });
    
  }

});


app.listen(port, function () {
  console.log('Node.js listening ...');
});