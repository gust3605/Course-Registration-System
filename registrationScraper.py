#BeautifulSoup must be installed on the local machine in order to run this script
#sudo apt-get install python-bs4
#note: This is python 2.7
import urllib2
from HTMLParser import HTMLParser
from htmlentitydefs import name2codepoint
from bs4 import BeautifulSoup
import re
import sqlite3
#Parser class

def Scraper():
    #spring of 2019
    x = 0

    conn = sqlite3.connect('classes.db')
    c = conn.cursor()

    subjects = ["ACCT","ACSC","ACST","AERO","AMBA","ARAB","ARHS","ARTH","BCHM","BCOM","BETH","BIOL","BLAW","BUSN","CATH","CHDC","CHEM","CHIN","CIED","CISC","CJUS","CLAS","COAC","COJO","COMM","CPSY","CSIS","CSMA","CTED","DRSW","DSCI","DVDM","DVDT","DVHS","DVLS","DVMT","DVPH","DVPM","DVPT","DVSP","DVSS","DVST","ECMP","ECON","EDCE","EDLD","EDUA","EDUC","EGED","ENGL","ENGR","ENTR","ENVR","ESCI","ETLS","EXSC","FAST","FILM","FINC","FREN","GBEC","GENG","GEOG","GEOL","GERM","GIFT","GMUS","GRED","GREK","GRPE","GRSW","GSPA","HIST","HLTH","HONR","HRDO","IBUS","IDSC","IDSW","IDTH","INAC","INCH","INEC","INEG","INFC","INFR","INGR","INHR","INID","INIM","INJP","INLW","INMC","INMG","INMK","INOP","INPS","INRS","INSP","INST","INTR","IRGA","ITAL","JAPN","JOUR","JPST","LATN","LAWS","LEAD","LGST","LHDT","MATH","MBAC","MBEC","MBEN","MBEX","MBFC","MBFR","MBFS","MBGC","MBGM","MBHC","MBHR","MBIF","MBIM","MBIS","MBLW","MBMG","MBMK","MBNP","MBOP","MBQM","MBSK","MBSP","MBST","MBUN","MBVE","MFGS","MGMP","MGMT","MKTG","MMUS","MSQS","MSRA","MUSC","MUSN","MUSP","MUSR","MUSW","NSCI","ODOC","OPMT","PHED","PHIL","PHYS","PLLD","POLS","PSYC","PUBH","QMCS","READ","REAL","RECE","REDP","RUSS","SABC","SABD","SACS","SAED","SAIM","SAIN","SALS","SAMB","SASE","SASW","SEAM","SEIS","SMEE","SOCI","SOWK","SPAN","SPED","SPGT","SPUG","STAT","STEM","TEGR","THEO","THTR","WMST"]
    for subject in subjects:
        response = urllib2.urlopen("https://classes.aws.stthomas.edu/index.htm?year=2019&term=20&schoolCode=ALL&levelCode=ALL&selectedSubjects="+subject)
        html = response.read()
        f = open('response.txt', 'w') #OPEN FILE WHEN USING
        err = open('error.txt', 'w')#Error out file
        #parser.feed(html)
        soup = BeautifulSoup(html, 'html.parser')
        #soup = soup.prettify().encode('utf-8')
        courses = soup.find_all('div', class_="course")
        for item in courses:
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

                ##IMPORT INTO DATABASE HERE##
                c.execute("INSERT INTO sections VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (courseNumb, subject, courseNumber, courseSect, courseLoca, courseRoom, courseInst, courseTime, courseCapa, courseRegi))

                present = None
                present = c.execute("SELECT * FROM courses WHERE course_number=?", courseNumb)
                if(present == None):
                    c.execute("INSERT INTO sections VALUES (?, ?, ?, ?, ?)", (subject, courseNumb, coureCred, courseName, courseInfo))

                conn.commit()
                ##END DATABASE##

                #Simple prints for error checking
                #print courseNumber #This is NOT the CRN
                #print courseName #Course name
                #print courseTime #Crouse time
                #print courseInst #Course instructor
                #print courseLoca #Location
                #print courseCapa #Course capacity
                #print courseRegi #Amt currently registered
                #print courseCred #Total credits of course
                #print courseNumb #This is CRN
                #print courseInfo #Description

                #f.write("%s\n" % courseNumber)
                #f.write("%s\n" % courseName)
                #f.write("%s\n" % courseTime)
                #f.write("%s\n" % courseInst)
                #f.write("%s\n" % courseLoca)
                #f.write("%s\n" % courseCapa)
                #f.write("%s\n" % courseRegi)
                #f.write("%s\n" % courseCred)
                #f.write("%s\n" % courseNumb)
                #f.write("%s\n" % courseInfo)
                #print x
                #x = x + 1
            except:
                #Remove this error file when complete
                err.write("%s\n" % item)
                print("Error with course "+courseName)
            #break
        #f.write(courses)
    conn.close()
Scraper()
