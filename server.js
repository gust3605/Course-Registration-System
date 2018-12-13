

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

			var idtag = '<h6 id = "userID">'+university_id+'</h6>';
			//var statusTag = '<h5 id = "userStatus"> <span style = "display:none;>'+status+'</span></h5>';
			var statusTag = '<h6 id = "userStatus"> '+status+'</h6>';
			var mime_type = mime.lookup('registration.html?'+university_id) || 'text/html';
			res.writeHead(200,{'Content-Type': mime_type});
			res.write(idtag);
			res.write(statusTag);
			res.write(data);
			res.end();
			//testing register student
			registerStudent();
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

//function that when passed a new crn and list of old classes checks for time conflicts
function timeConflict(id, newCrn){

	console.log("timeConflict called");
	var currSections='';
	var checkCrn;
	var newtime = '';
	var temptime = '';

	db.all("SELECT sections WHERE crn == ?",crn,(err,rows)=>{
		if (err) {
			console.log('timeconflict query1 error');
			return console.log(err.message);
		}
		else{
			newtime = rows[0].times;
			console.log('new time: '+ newtime);
		}
	});//db get newtime

	db.all("SELECT people WHERE university_id == ?", id,(err,rows)=>{
		if(err){
			console.log("timeconflict query2 error");
			return console.log(err.message);
		}
		else{
			currSections = rows[0].registered_courses.split(',');
			console.log(currSections);


			//if there are no current sections
			if(currSections.length == 0){
				return false;
			}

			else{

				//if there are sections that the student has already signed up for 
				// need to loop through the registered sections and query the db for each one to get its time
				for (var i = 0; i < currSections.length; i++){
					checkCrn = currSections[i]

					db.all("SELECT sections WHERE crn = ?", checkCrn,(err,rows)=>{
						if (err){
							console.log('timeConflict loop db call error');
							return console.log(err.message);
						}
						else{
							temptime = rows[0].times;
							if(temptime == newtime){
								return true;
							}
						}
					});//loop db call
				}
				//if no matching times are detected than false is returned
				return false;
			}

		}

	});
	return false;
}


//function that checks if course if full returns true if so 
function sectionfull(crn){
	console.log('section full called for crn: '+crn);
	var section;
	var capacity;
	var registered;
	db.all("SELECT sections WHERE crn == ?",crn,(err,rows)=>{
		if(err){
			console.log("sectionfull query error");
			return console.log(err.message);
		}
		else{
			section = rows[0]
			console.log(section);
			capacity = section.ca
			pacity;
			registered = section.registered;

			if(capacity < registered){
				console.log("capacity: " + capacity + "is less than registered: "+ registered);
				return false;
			}
			else{
				console.log('class is at or above capacity');
				return true;
			}
		}
	});
}//section full

//function that checks if a particular student id is already registered in class
function isregistered(id,crn){
	//
	var courses;
	db.all("SELECT people.registered_courses FROM people WHERE university_id == ?", id, (err,rows) =>{
		if (err) {
			console.log("isregistered query error");
			return console.log(err.message);
		}
		else{
			courses = rows[0].registered_courses.split(',');
			for (var i = 0; i < courses.length; i++) {
				if(courses[i] == crn){
					//student is registered for course return true
					return true;
				}
			}
			//student is not registered in course
			return false;
		}
	}); //db all



}
//function used to register students into a section given id and 
//currently set up to use dummy vars for testing 
function registerStudent(){
	console.log('register student called');
	var id = 4;
	var crn = 20003;
	var regCourses = '';
	var students = '';

	if (isregistered(id, crn)){
		//student is already registered dont do anything
		console.log("student is already registered for course");
	}

	else if(sectionfull(crn)){
		//if section if full prevent student from registering
		console.log("section is full");
	}

	else if(timeConflict(id, crn)){
		console.log("timeconflict detected");
	}

	else{

		console.log('register student started');
		db.all("SELECT people.registered_courses FROM people WHERE university_id == ?", id, (err,rows) =>{
			if (err) {
				console.log("register student error occured 1st query");
				return console.log(err.message);
			}
			else{
				// need to check if class is full check to see if class is full
				//registering inserting course crn into users courses field
				console.log('people registered courses row:');
				console.log(rows[0].registered_courses);

				regCourses = rows[0].registered_courses;
				
				//adding selected class into the registered courses
				regCourses = regCourses + "," + crn;
				db.run('UPDATE people SET registered_courses = "'+regCourses+'" WHERE university_id == ?', id,(err,rows) =>{
					if (err) {
						return console.log(err.message);
					}
					else{
						console.log('course successfully registered to student');
					}
				});//db updating registered corses

			}
		});//db insert course into student

		console.log('register student into class started')
		db.all("SELECT sections.registered FROM sections WHERE crn == ?", crn, (err,rows) =>{
			if(err){
				return console.log(err.message);
			}
			else{
				students = rows[0].registered;
				console.log('students registered for sections:');
				console.log(students);

				students = students +","+ id;
				db.run('UPDATE sections SET registered = "'+students+'"WHERE crn == ?', crn, (err,rows)=>{
					if (err) {
						return console.log(err.message);
					}
					else{
						console.log("student successfully added to class");
					}
				});
			}

		});//db insert student into course

	}//else--NO CONFLICTS

	
	/*currently using dummy variables until the table is completed
	after it is we need to get the crn of the row. */

}// register student


