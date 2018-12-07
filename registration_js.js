var class_list = new Vue({
	el: '#class_table',
	data: {
		results: []
	},
	query_db(filter_by) {
		var query ='SELECT *
					FROM courses
					WHERE
					';
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