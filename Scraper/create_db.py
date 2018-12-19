import sqlite3

conn = sqlite3.connect('classes.db')
c = conn.cursor()

c.execute('''CREATE TABLE departments (
    subject text,
    full_name text,
    PRIMARY KEY (subject)
    )''')

c.execute('''CREATE TABLE courses (
    subject text,
    course_number text,
    credits integer,
    name text,
    description text
    )''')

c.execute('''CREATE TABLE sections (
    crn integer,
    subject text,
    course_number text,
    section_number text,
    building text,
    room text,
    professors text,
    times text,
    capacity integer,
    registered text,
    PRIMARY KEY (crn)
    )''')

c.execute('''CREATE TABLE people (
    university_id integer,
    position text,
    first_name text,
    last_name text,
    registered_courses,
    PRIMARY KEY (university_id)
    )''')

conn.commit()
conn.close()
