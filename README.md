# DriveSafe

DriveSafe is an application that promotes driver safety by empowering drivers to make better choices through a combination of accident data and safety information. 

It was developed during the Spring 2020 semester at the University of Florida as part of a software engineering class. The project's direction was dictated by a third par

## Screenshots

<img src="https://raw.githubusercontent.com/CameronWhiteCS/DriveSafe/master/screenshots/map.png" width="750">

<img src="https://raw.githubusercontent.com/CameronWhiteCS/DriveSafe/master/screenshots/quiz_editor.png" width="750">

## Main Features

* User-submitted accident reports and accident map
* Administrator-defined driver safety quizzes
* Configurable permissions system to allow non-technical users to control who can do what with ease
* City rivalries that allow for relative city safety to be determined

## Deployment instructions

DriveSafe is built using PHP and can be easily deployed using the Apache web server. Automated deployment is not currently available, but will be rolled out in a future release. In the interim, please follow the instructions below. 

Some basic configuration values such as MySQL usernames and passwords must be modified, but everything else should work as-is. 

### Step 1: Build the client using NPM

Using terminal or command prompt on windows, change into the client directory of the repository and run the following commands:

```
npm install
npm run-script build
```

This will compile the DriveSafe client and place its contents inside the /client/build directory.

### Step 2: Run the SQL Initialization Scripts

Edit the top portion of the /server/sql/database.sql file and change the MySQL database username and password from 'dbuser' and the default password to anything of your chosing. By default, the name of the database is 'app', but this can modified as well. 

The following lines are the only ones that need to be changed:

```sql
DROP USER IF EXISTS 'dbuser'@'localhost';
CREATE USER IF NOT EXISTS 'dbuser'@'localhost' IDENTIFIED BY 'cmmAyskQwmAI1fQ7vJM7';

DROP DATABASE IF EXISTS app;
CREATE DATABASE IF NOT EXISTS app;
USE app;
```
From there, save the MySQL initialization script and then run it as the root user.

**Note**: For DriveSafe to work, ONLY_FULL_GROUP_MODE must be disabled. That can be accomplished by running the following command as the root user:

```sql
SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
```

### Step 3: Import City Data

After creating the database, remain logged in as the root user. From there, make sure the DriveSafe database is selected as the current database. Finally, execute the populate_cities.sql script to import the city data needed for accident reporting. All data will be inserted into the 'cities' table of the currently seected database.

### Step 4: Modify DataManager.php

Modify /server/www/php/DataManager.php and edit the MySQL login credentials to match those set up during step #2.

### Step 5: Copy the client and server into an Apache configuration

Set up a website using Apache2. From there, copy **all** of the contents of the "build" folder produced during step #1 into the root directory of the website. 

Next, copy all of the contents from the /server/www/php folder into the root directory of the website. 
