var http = require('http');
var url = require('url');
var fs = require('fs');

http.createServer(function (request, response) {
	console.log('Received request for ' + request.url + " via " + request.method);
	let pathname = url.parse(request.url).pathname;
	if (request.method === 'GET') {
		handleGET(pathname, response);
	}
	else if (request.method === 'POST') {
		handlePOST(pathname, response)
	}
}).listen(8080);

// For GET requests prepend ./content/ then grab and read out file. 
// If file not found, read 404 page
function handleGET(pathname, response) {
	// Reroute to index.html - Yes this is hacky, I know
	if (pathname === '/') pathname = 'index.html';
	if (pathname === '/index') pathname = 'index.html';

	fs.readFile('./content/' + pathname, 'utf8', function(err, contents) {
		if (err) {
			send404(response);
			console.log(err);
		}
		else {
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.end(contents);
		}
	});
}

// We only handle on post request: temps
// This will return a JSON object of all the temps at the assumed location
function handlePOST(command, response) {
	response.writeHead(200, {'Content-Type': 'application/json'});
	response.end({});
	// if (command === "temps") {
	// 	return {
	// 		"C": 123,
	// 		"F": 456,
	// 		"K": 789,
	// 		"5": "Y"
	// 	}
	// }
	// else {
	// 	return null;
	// }
}

// Attempt to read 404.html in content folder
// If error occurs, insult the user (even though it's probably my fault ;) )
function send404(response) {
	fs.readFile('./content/404.html', 'utf8', function(err, contents) {
		if (err) {
			response.writeHead(500, {'Content-Type': 'text/html'});
			response.end("Something weird happened. I blame you. It's all your fault.");
		}
		else {
			response.writeHead(404, {'Content-Type': 'text/html'});
			response.end(contents);
		}
	});
}