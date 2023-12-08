# Installation for Local Usage
**Disclaimer:** Running our application requires specific environment variables that only the developers have access to. Unfortunately, we cannot publish this information as it contains the team's sensitive information. 

1. To start hosting our app locally, use the following command in your desired location:  
```git clone git@github.com:richieej/CS130-Project.git```

2. Download the binary distribution of the Fuseki server [here](https://jena.apache.org/download/). 

3. Start the fuseki server by navigating to the top level folder of the download and running `./fuseki-server`.  
This starts the server on port 3030. 

4. Open terminal and navigate to the top level folder of our application, then to the `server` folder. Make sure you have Node.js and npm. Then, install the version of npm that we used by running:  
```npm install```

5. Then, run the following command to start the server:  
```node server```  
This starts the server in your browser on port 8080. 

6. Navigate to the `client` folder and run `npm install` there as well. 

7. Then, run the following command to start the web application:  
```npm start```  
This opens the website in your browser on port 3000.

# Testing
- To run our frontend unit tests, navigate to the `client` folder and run: `npm test`
- To run our unit tests for the backend, navigate to the `server` folder and run: `npm test`

# User Manual
[User Manual](UserManual.md)