/// built-in NodeJS modules

//example node server done in class
var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');

// downloaded NodeJS modules
var mime = require('mime-types');
var multiparty = require('multiparty');

var port = 8026;
var public_dir = path.join(__dirname, 'public');
//var public_dir = path.join(__dirname, 'tmarrinan.github.io');

var server = http.createServer((req, res) => {
    var req_url = url.parse(req.url);
    var filename = req_url.pathname.substring(1);
    if (filename === "") {
        filename = "exampleindex.html";
 }
    console.log(filename);

    if (req.method === 'GET')
    {
        fs.readFile(path.join(public_dir, filename), (err, data) => {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Oh no! Couldn\'t find that page!');
                res.end();
            }
            else {
                var mime_type = mime.lookup(filename) || 'text/plain';
                res.writeHead(200, {'Content-Type': mime_type});
                res.write(data);
                res.end();
            }
        });

        //res.writeHead(200, {'Content-Type': 'text/plain'});
        //res.write('Hello World!');
        //res.end();
    }
 else
    {
        if (filename === "upload") {
            var form = new multiparty.Form();
            form.parse(req, (err, fields, files) => {
                console.log(fields);
                console.log(files);
                console.log(fields.fname);
                fs.copyFile(files.img_file[0].path, files.img_file[0].originalFilename, (err) => {
                    if (err) {
                        console.log('Could not copy file');
                    }
                });
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.write('Thank you for your submission!');
                res.end();
            });
        }
        else {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.write('Error');
            res.end();
        }
    }
});

console.log('Now listening on port ' + port);
server.listen(port, '0.0.0.0');
