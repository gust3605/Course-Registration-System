var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');
var sqlite3 = require('sqlite3').verbose();

//just a simple server that runs locally
const hostname = '127.0.1';
const port = 3000;

var public_dir = path.join(__dirname, "public");


console.log(public_dir);

const server = http.createServer((req,res)=>{
	var req_url = url.parse(req.url);
	var filename = req_url.pathname.substring(1);

	if(filename === ""){
		filename = "index.html";
	}
	console.log(filename);
	

	if (req.method === "GET"){
		fs.readFile(path.join(public_dir, filename), (err, data) =>{
			if(err){
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.write('could not find page.');
				res.end();
			}
			else{
				var mime_type = mime.lookup(filename) || 'text/plain';
				res.writeHead(200, {'Content-Type': mime_type});
				res.write(data);
				res.end();
			}
		});
	}
	else{//handle post
		
	}
	
	
});

var class_list = new Vue({
	el: '#class_table',
	data: {
		results: []
	}
	
});

server.listen(port,hostname,() =>{
	console.log('server running at http://${hostname}:{port}/');
	//console.log(filename);
});