# Web interface application

This web interface application is a web server built using JavaScript with Node. As of now, the application is only intended to be run and accessed locally, as the running server is hosted on http://localhost:3000/ and provides no authentication or security measures needed for online hosting.

## Installation

To be able to run this application, several programs need to be downloaded and installed on the system.

1. Install a MySQL server ([MAMP](https://www.mamp.info/en/downloads/) was used during development)
2. Install [Node](https://nodejs.org/en/) (which includes the package manager [NPM](https://www.npmjs.com/))
3. Extract the "src.zip" file included in the submission files

When that is installed, open up your command line of choice and navigate to the directory of the unpacked application. This path might be something like "C:\Users\USERNAME\Downloads\src\express_app" if you are on Windows.
Running the following command in this directory will install all packages needed for the applicaiton to function.

```
npm install
```

## Execution

To start the application, one of the following two commands can be run.

```
npm start
```

```
npm start db_name
```

The first command will start the application on using the database name "webadmin"´, while the second one will start the application on the database of whichever name you switched the "db_name" string to.

Note that when starting the application on an empty database or using a databse name that does not exist, the application will first create the database, add 4 tables, and then populate these tables with data from the files ending with ".csv". It is therefor very important to provide a name of a database that does not currently contain tables of the names Orders, Users, Songs, and Albums which already have data in them. And obviously, if these files are deleted before starting the app, they cannot be read.
