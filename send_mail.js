var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');
var api_key = 'key-279bb6d09997242d39bed9245d811781';//put your mailgun API key here 
var domain = 'sandbox83c8225801c845a891b3cc0f7fd484aa.mailgun.org';//put your mailgun Domain here 
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get') {
        displayForm(res);
    } else if (req.method.toLowerCase() == 'post') {
        processFormFieldsIndividual(req, res);
    }
});

function displayForm(res) {
    fs.readFile('send_mail.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

function processFormFieldsIndividual(req, res) {
    var fields = [];
    var form = new formidable.IncomingForm();

	
    form.on('field', function (field, value) {
        console.log(field);
        console.log(value);
        fields[field] = value;
    });

	
    form.on('file', function (name, file) {
        console.log(name);
        console.log(file);
        fields[name] = file;
    });


    form.on('progress', function (bytesReceived, bytesExpected) {
        var progress = {
            type: 'progress',
            bytesReceived: bytesReceived,
            bytesExpected: bytesExpected
        };
        console.log(progress);
    });

	
    form.on('end', function () {

        res.writeHead(200, {
            'content-type': 'application/json'
        });
       

        var FileItem = fields["attachment"];

        var attch = new mailgun.Attachment({data: FileItem.path, filename: FileItem.name});

        var data = {
          from: fields["name"]+' <'+fields["email"]+'>',
          to: 'englishlearn2014@gmail.com',//the Email address should be the one which registered in mailgun and change (api_key, domain) above
          subject: fields["subject"],
          text: fields["message"],
          attachment: attch
        };

        mailgun.messages().send(data, function (error, body) {
          console.log(body);
          res.end(JSON.stringify({
              fields: body
          }));
        });
    });
    form.parse(req);
}

server.listen(8000);
console.log("server listening on 8000");
