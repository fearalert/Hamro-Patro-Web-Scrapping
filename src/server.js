const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((request, response) => {
  console.log('Request URL:', request.url);

  if (request.url === '/' || request.url === '/index.html') {
    serveStaticFile(response, '/index.html', 'text/html');
  } else if (request.url === '/styles.css') {
    serveStaticFile(response, '/styles.css', 'text/css');
  } else if (request.url === '/script.js') {
    serveStaticFile(response, '/script.js', 'text/javascript');
  } else if (request.url === '/data/data.json') {
    serveJSON(response, '/data/data.json', 'application/json');
  } else {
    serveNotFound(response);
  }
});

function serveStaticFile(response, filePath, contentType) {
  const fullPath = path.join(__dirname, filePath);
  
  fs.readFile(fullPath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        serveNotFound(response);
      } else {
        response.writeHead(500);
        response.end(`Server Error: ${error.code}`);
      }
    } else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
}

function serveJSON(response, filePath, contentType) {
  const fullPath = path.join(__dirname, filePath);
  
  fs.readFile(fullPath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        serveNotFound(response);
      } else {
        response.writeHead(500);
        response.end(`Server Error: ${error.code}`);
      }
    } else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
}

function serveNotFound(response) {
  const notFoundPath = path.join(__dirname, '/404.html');
  
  fs.readFile(notFoundPath, (error, content) => {
    if (error) {
      response.writeHead(500);
      response.end('Server Error');
    } else {
      response.writeHead(404, { 'Content-Type': 'text/html' });
      response.end(content, 'utf-8');
    }
  });
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
