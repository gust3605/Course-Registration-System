#BeautifulSoup must be installed on the local machine in order to run this script
#sudo apt-get install python-bs4
#note: This is python 2.7
import urllib2
from bs4 import BeautifulSoup
import re
import sqlite3

def Scraper():
    #spring of 2019
    
    #Connects to SQL database
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
    #END database

    #Loop get requests on each subject
    subjects = ["ACCT","ACSC","ACST","AERO","AMBA","ARAB","ARHS","ARTH","BCHM","BCOM","BETH","BIOL","BLAW","BUSN","CATH","CHDC","CHEM","CHIN","CIED","CISC","CJUS","CLAS","COAC","COJO","COMM","CPSY","CSIS","CSMA","CTED","DRSW","DSCI","DVDM","DVDT","DVHS","DVLS","DVMT","DVPH","DVPM","DVPT","DVSP","DVSS","DVST","ECMP","ECON","EDCE","EDLD","EDUA","EDUC","EGED","ENGL","ENGR","ENTR","ENVR","ESCI","ETLS","EXSC","FAST","FILM","FINC","FREN","GBEC","GENG","GEOG","GEOL","GERM","GIFT","GMUS","GRED","GREK","GRPE","GRSW","GSPA","HIST","HLTH","HONR","HRDO","IBUS","IDSC","IDSW","IDTH","INAC","INCH","INEC","INEG","INFC","INFR","INGR","INHR","INID","INIM","INJP","INLW","INMC","INMG","INMK","INOP","INPS","INRS","INSP","INST","INTR","IRGA","ITAL","JAPN","JOUR","JPST","LATN","LAWS","LEAD","LGST","LHDT","MATH","MBAC","MBEC","MBEN","MBEX","MBFC","MBFR","MBFS","MBGC","MBGM","MBHC","MBHR","MBIF","MBIM","MBIS","MBLW","MBMG","MBMK","MBNP","MBOP","MBQM","MBSK","MBSP","MBST","MBUN","MBVE","MFGS","MGMP","MGMT","MKTG","MMUS","MSQS","MSRA","MUSC","MUSN","MUSP","MUSR","MUSW","NSCI","ODOC","OPMT","PHED","PHIL","PHYS","PLLD","POLS","PSYC","PUBH","QMCS","READ","REAL","RECE","REDP","RUSS","SABC","SABD","SACS","SAED","SAIM","SAIN","SALS","SAMB","SASE","SASW","SEAM","SEIS","SMEE","SOCI","SOWK","SPAN","SPED","SPGT","SPUG","STAT","STEM","TEGR","THEO","THTR","WMST"]
    for subject in subjects:
        response = urllib2.urlopen("https://classes.aws.stthomas.edu/index.htm?year=2019&term=20&schoolCode=ALL&levelCode=ALL&selectedSubjects="+subject)
        f = open('response.txt', 'w') #Testing output file
        err = open('error.txt', 'w')#Error out file
        html = response.read()
        soup = BeautifulSoup(html, 'html.parser') #Parse raw data into html
        courses = soup.find_all('div', class_="course") #Locate the course sections: ret=list
        for item in courses:
            #Exceptions could be replaced with 'if' statements
            try:
                courseNumber = item.find('span', class_='courseOpen').get_text() #This is NOT ID number
                courseName = item.find('div', class_='columns small-6 medium-4 large-4').get_text()
            except:
                try:
                    courseNumber = item.find('span', class_='courseClosed').get_text() #This is NOT ID number
                    courseName = item.find('div', class_='columns small-6 medium-4 large-4').get_text()
                except:
                    #err.write("%s\n" % item)
                    #print "Error with course "+courseName
                    courseNumber = item.find('span', class_='courseWaitlist').get_text() #This is NOT ID number
                    courseName = item.find('div', class_='columns small-6 medium-4 large-4').get_text()
            try:
                courseName = " ".join(courseName.split())#This removes excess spaces
                courseTime = item.find('div', class_='columns small-6 medium-3 large-2').get_text()          
                courseTime = " ".join(courseTime.split())#This removes excess spaces
                courseInst = item.find('div', class_='columns small-3 medium-2 large-2').get_text()
                courseInst = " ".join(courseInst.split())#This removes excess spaces
                courseLoca = item.find('span', class_='locationHover').get_text()
                courseLoca = " ".join(courseLoca.split())#This removes excess spaces
                courseCapa = item.find('div', class_='columns small-2').get_text()
                courseCapa = " ".join(courseCapa.split())#This removes excess spaces
                courseRegi = item.find_all('div', class_='columns small-3')#.get_text()
                courseRegi = " ".join(courseRegi[1].get_text().split())#This removes excess spaces
                courseInfo = item.find('p', class_='courseInfo').get_text()
                courseInfo = " ".join(courseInfo.split())#This removes excess spaces
                courseFied = item.find_all('p', class_='courseInfoHighlight')#.get_text()
                courseNumb = " ".join(courseFied[0].get_text().split())#This removes excess spaces
                courseCred = " ".join(courseFied[4].get_text().split())#This removes excess spaces
                courseSect = 0
                courseRoom = 0
            except:
                #Remove this error file when complete
                err.write("%s\n" % item)
                print "Error with course "+courseName
                continue

            ##IMPORT INTO DATABASE HERE##
            c.execute("INSERT INTO sections VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (int(courseNumb[5:]), subject, courseNumber, courseSect, courseLoca, 
                                                                                    courseRoom, courseInst, courseTime, int(courseCapa[6:]), courseRegi,))
            #Incorrect number of bindings supplied. The current statement uses 1, and there are 10 supplied.
            c.execute("SELECT * FROM courses WHERE course_number=?", courseNumb)
            present = c.fetchone()

            if present is None:
                c.execute("INSERT INTO sections VALUES (?, ?, ?, ?, ?)", (subject, courseNumb, courseCred, courseName, courseInfo,))
            conn.commit()
            ##END DATABASE##

    conn.close()
Scraper()
