var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');
var sqlite3 = require('sqlite3').verbose();
const express = require('express');
var multiparty = require('multiparty');
var util = require('util');
var mime = require('mime-types');

//just a simple server that runs locally
const hostname = '127.0.1';
const port = 3000;



var public_dir = path.join(__dirname, "public");
let db = new sqlite3.Database('classes.db');


const app = express();
var router = express.Router();
app.use(express.static(public_dir));
//app.use(bodyParser.urlencoded({  //   body-parser to
 //   extended: true               //   parse data
//}));                             //
//app.use(bodyParser.json());      //


///this ap get needs to be changed
app.get('/', (res,req) => {
	fs.readFile(path.join(public_dir, 'index.html'), (err,data)=>{
		if (err){
			res.writeHead(404, {'Content-Type':'text/plain'});
			res.write(data);
			res.end();
		}
		else{
			var mime_type = mime.lookup('index.html') || 'text/plain';
			res.writeHead(200, {'Content-Type': mime_type});
			res.write(data);
			res.end();
		}
	})
});

/*
======================================
	hey guys so i was doing some looking and since we cant	
	use a form for the search box we can use some javascript 
	on the search page to send an ajax request
=====================================
	
*/

app.post('/data', function(req, res) {
    //var a = parseFloat(req.body.num1);
	//var b = parseFloat(req.body.num2);
	console.log("Sending");
	var sum = 100;

	db.all('SELECT * FROM sections WHERE subject=?',"CHEM",function(err,rows){
		if (err){
			return console.log(err.message);
		}
		else{
			console.log(rows);
			res.send(rows);
		}
	});	
});

app.post('/class_reg', function(req, res) {
	console.log("Class registering");
	form.parse(req,function(err,fields,files){
		res.writeHead(200, {'Content-Type' : 'text/plain'});
		
	});
});

//Upload
app.post('/filter_subj', (req, res) => {
	console.log("app filter called");	
	var subj = '';
	
	var form = new multiparty.Form();
	form.parse(req,function(err,fields,files){
		res.writeHead(200, {'Content-Type' : 'text/plain'});
		var response = fields;
		var subj = response.subject[0];
		var name = response.c_name[0];
		var num = response.c_num[0];
		
		if(num !== "") {
				db.all('SELECT * FROM sections WHERE course_number=?',function(err,rows){
					if (err){
						return console.log(err.message);
					}
					else{

					}
				});						
		}
		else if(name !== "") {
				db.all('SELECT * FROM sections WHERE course_name=?',function(err,rows){
					if (err){
						return console.log(err.message);
					}
					else{

					}
				});						
		}
		else {
			if(subj === 'ALL') {
				db.all('SELECT * FROM sections',function(err,rows){
					if (err){
						return console.log(err.message);
					}
					else{

					}
				});				
			}
			else {
				
				db.all('SELECT * FROM sections WHERE subject=?',subj,function(err,rows){
					if (err){
						return console.log(err.message);
					}
					else{
						//res.end(JSON.stringify(rows));
						//$('class_table').html(rows);
						return console.log(rows);
					}
				});
			}
		}
	});
});
//end upload

//login
app.post('/login',function(req,res){
	console.log("app post login called");
	var id = '';
	var passwd = '';
	var status = '';

	var form = new multiparty.Form();
	form.parse(req,function(err,fields,files){
		
		var response = fields;
		var id = response.ID[0];
		var status = response.Status[0];
		var passwd = response.Password[0];
		db.all('SELECT *FROM people WHERE university_id=?',id,function(err,rows){
			if(err){
				return console.log(err.message);
			}
			else{
				if(rows.length == 0){
					console.log("username does not exist create new username");
					back2Login(res , 'username does not exist create new username');
					
				}//if no username is found
				else{
					if(passwd == rows[0].password){
						console.log('login successful');
						//login successful redirect to search page
						gotoregister(res);
					}
					else{
						console.log(passwd +' does not match passwd: '+ JSON.stringify(rows));
						back2Login(res, 'bad Password');
					}
				}
			}

			
		});
		//res.end();
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
		
		//res.writeHead(200, {'Content-Type': 'text/plain'});
		

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
			back2Login(res, 'person successfully registered into server');
			console.log('person successfully registered into server');
		})
		res.end();

	});

	
});


app.listen(3000, ()=>console.log('server listening on port '+port));

//function that redirects a user back to the login page
//after registration of a failed login
//also displays message describing reason for being sent back -- might want to remove/change


function back2Login(res ,message){
	fs.readFile(path.join(public_dir, 'index.html'), (err, data)=>{
		if(err){
			res.writeHead(404, {'Content-Type':'text/plain'});
			res.write('Page not Found');
			res.end();
		}
		else{
			var mime_type = mime.lookup('index.html') || 'text/html';
			res.writeHead(200,{'Content-Type': mime_type});
			res.write(message);
			res.write(data);
			res.end();
		}
	})
}



function gotoregister(res){
	fs.readFile(path.join(public_dir, 'registration.html'), (err, data)=>{
		if(err){
			res.writeHead(404, {'Content-Type':'text/plain'});
			res.write('Page not Found');
			res.end();
		}
		else{
			var mime_type = mime.lookup('index.html') || 'text/html';
			res.writeHead(200,{'Content-Type': mime_type});
			res.write(data);
			res.end();
		}
	})
}




function gotoabout(res){
	fs.readFile(path.join(public_dir, 'aboutme.html'), (err, data)=>{
		if(err){
			res.writeHead(404, {'Content-Type':'text/plain'});
			res.write('Page not Found');
			res.end();
		}
		else{
			var mime_type = mime.lookup('index.html') || 'text/html';
			res.writeHead(200,{'Content-Type': mime_type});
			res.write(data);
			res.end();
		}
	})
}

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
