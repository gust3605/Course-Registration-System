var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');
var sqlite3 = require('sqlite3').verbose();
const express = require('express');
var multiparty = require('multiparty');
var util = require('util');

//just a simple server that runs locally
const hostname = '127.0.1';
const port = 3000;



var public_dir = path.join(__dirname, "public");
let db = new sqlite3.Database('classes.db');


const app = express();
app.use(express.static(public_dir));

app.get('/', (res,req) => {
	console.log("app get called");
	res.send('hello world');
});

app.get('/filter_subj', (req, res) => {
	console.log("app filter called");	
	var subj = '';
	
	var form = new multiparty.Form();
	form.parse(req,function(err,fields,files){
		res.writeHead(200, {'Content-Type' : 'text/plain'});
		var response = fields;
		var subj = response.subject[0];
		
		db.all('SELECT * FROM courses WHERE subject=?',subj,function(err,rows){
	}
});

//login
app.post('/login',function(req,res){
	console.log("app post login called");
	var id = '';
	var passwd = '';
	var status = '';

	var form = new multiparty.Form();
	form.parse(req,function(err,fields,files){
		res.writeHead(200, {'Content-Type' : 'text/plain'});
		//res.write(recieved login)
		var response = fields;
		var id = response.ID[0];
		var status = response.Status[0];
		//password needs to be hashed clientside js
		var passwd = response.Password[0];
		db.all('SELECT *FROM people WHERE university_id=?',id,function(err,rows){
			if(err){
				return console.log(err.message);
			}
			else{
				console.log('not error in login');
				if(rows.length == 0){
					console.log("username does not exist create new username");
					//redirect back to login
				}//if no username is found
				else{
					if(passwd == rows[0].password){
						console.log('login successful');
						//login successful redirect to search page
					}
					else{
						console.log(passwd +' does not match passwd: '+ JSON.stringify(rows));
					}
				}
			}

			
		});
		res.end();
	});

});

//register new account
app.post('/register',function(req,res){
	console.log("app post register called");
	var id = '';
	var passwd = '';
	var status = '';
	var fName = '';
	var lName = '';

	var form = new multiparty.Form();
	
	form.parse(req,function(err, fields, files){
		
		res.writeHead(200, {'Content-Type': 'text/plain'});
		
		//res.write('recieved registration:\n\n');
		//res.end(util.inspect({fields,files : files}));


		var response = fields;
		

		var id = response.ID[0];

		//password needs to be hashed client side before being sent over
		var passwd = response.Password[0];
		var status = response.Status[0];
		var fName = response.FirstName[0];
		var lName = response.LastName[0];
		var courses ='';

		//added passwd field
		db.run('INSERT INTO people Values(?,?,?,?,?,?)', [id, passwd, status, fName, lName, courses] ,function(err){

			if(err){
				return console.log(err.message);
			}
			console.log('person successfully registered into server');
		})

		res.end(util.inspect({fields:fields, files:files}));
	});

	
});


app.listen(3000, ()=>console.log('server listening on port '+port));




/*


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
		//possibility is query. Fill array with filter parameters then call the vue object query method
	}
	
	
});

var class_list = new Vue({
	el: '#class_table',
	data: {
		results: []
	},
	query_db(filter_by) {
		var query ='SELECT *FROM courses WHERE';
		let db = new sqlite3.Database('/classes.db', (err) => {
			if (err) {
				return console.error(err.message);
			}
			console.log('Connected to the in-memory SQlite database');
		});
		
		
		db.all(query, [], (err, rows) => {
			if (err) {
				throw err;
			}
			results = rows;
		}
	}
});

server.listen(port,hostname,() =>{
	console.log('server running at http://${hostname}:{port}/');
	//console.log(filename);
});


*/