const fs = require('fs');
const path = require('path');
const dbConnection = require('./database/db_connection.js');
const queryString = require('querystring');



const homeRouterHandler = (request, response) => {
  const htmlPath = path.join(__dirname, "../Public/index.html");
  const html = fs.readFile ( htmlPath, (error, html) => {
  if (error) {
    response.writeHead (500, {"content-type": "text/plain"});
    response.end("Server Error!");
    return;
  }
    response.writeHead(200, {"content-type": "text/html"});
    response.end(html);
  });
}


const publicHandler = (request, response) => {
  const filePath = path.join(__dirname,"..", request.url)
  const extension = request.url.split(".")[1]
  const contentTypeMapping = {
    js: "application/js",
    css: "text/css",
    html: "text/html"
  };

  fs.readFile ( filePath, (error, file) => {
    if (error) {
      response.writeHead (500, {"content-type": "text/html"});
      response.end("<h1> Server Error! </h1>");
      return;
    }
    response.writeHead(200, {"content-type": contentTypeMapping[extension]});
    response.end(file);
  });


}

const onLoad = (request, response) =>{
  //get data from the database
  dbConnection.query('SELECT * FROM tododb', (err, result) => {
    if (err) {
      console.log("Error HERE IN THE DATABASE!!!")
      console.log(err);
    } else {
        // console.log(result);
        response.writeHead(200, {"content-type":"application/json"})
        response.end(JSON.stringify(result.rows));
    }
  });
};

const addHandler = (request, response) => {
  let collectedData = '';
  request.on('data', chunk => {
    collectedData += chunk;
  });

  request.on('end', () => {
    console.log(collectedData);
    var descriptionObj = queryString.parse(collectedData);
    console.log({descriptionObj})
    var values = [descriptionObj.description];
    dbConnection.query(
      `INSERT INTO tododb (description) VALUES (${values[0]})`,
      values,
      (err, res) => {
        if (err) return cb(err);
        cb(null, res);
      }
    );
    // console.log("DESCRIPTION: " ,description);
    // postData(description, err => {
    //   if (err) return serverError(err, response);
    //   homeHandler(response);
    // });
  });

};


const errorhandler = (request, response) => {
  response.writeHead(404, {"content-type":"text/plain"})
  response.end("Sorry! Server Error!")
};

 const handlers = {
  homeRouterHandler,
  publicHandler,
  onLoad,
  errorhandler,
  addHandler
  // deleteHandler,
  // updateHandler
}

module.exports = handlers;
