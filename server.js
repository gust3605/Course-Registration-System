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

//UPLOAD 
app.get('/filter_subj', (req, res) => {
	console.log("app filter called");	
	var subj = req.query['field1'];
	var name = req.query['field2'];
	var num  = req.query['field3'];

		if(num !== "") {
				db.all('SELECT * FROM sections WHERE course_number=?',num,function(err,rows){
					if (err){
						return console.log(err.message);
					}
					else{
						res.send(rows);
						return console.log("Data sent");
					}
				});						
		}
		else if(name !== "") {
				db.all('SELECT * FROM sections WHERE course_name=?',name,function(err,rows){
					if (err){
						return console.log(err.message);
					}
					else{
						res.send(rows);
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
						res.send(rows);
					}
				});				
			}
			else {
				
				db.all('SELECT * FROM sections WHERE subject=?',subj,function(err,rows){
					if (err){
						return console.log(err.message);
					}
					else{
						res.send(rows);
					}
				});
		}
	}
});

app.post('/expander:c_numb', function(req, res) {
	console.log("more details on course");
	var crn = req.params.c_numb;
	
	db.all('SELECT sections.crn, sections.times, courses.description FROM sections INNER JOIN courses WHERE course_number=?',crn, function(err,rows) {
		if(err) {
			return console.log(err.message);
		} else {
			res.send(rows);
		}
	});
});

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
		//passwd = md5(passwd);

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
						gotoregister(res, id, status);
					}
					else{
						console.log(passwd +' does not match passwd: '+ JSON.stringify(rows));
						back2Login(res, 'bad Password');
					}
				}
			}
		});//res.end();
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

//gotoregister will write a h5 block containing the logged in users id which will be hidden with css
//tag will be read by clientside js so the client knows the active users id.
function gotoregister(res, university_id, status){
	fs.readFile(path.join(public_dir, 'registration.html'), (err, data)=>{
		if(err){
			res.writeHead(404, {'Content-Type':'text/plain'});
			res.write('Page not Found');
			res.end();
		}
		else{

			var idtag = '<h5 id = "userID">'+university_id+'</h5>';
			var statusTag = '<h5 id = "userStatus">'+status+'</h5>';
			var mime_type = mime.lookup('registration.html?'+university_id) || 'text/html';
			res.writeHead(200,{'Content-Type': mime_type});
			res.write(idtag);
			res.write(statusTag);
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










