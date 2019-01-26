'use strict'

var http = require('http');
var url = require('url');
var fs = require('fs');
var secretInfo;

http.createServer(function (request, response) {
	console.log('Received request for ' + request.url + " via " + request.method);
	let pathname = url.parse(request.url).pathname;
	if (request.method === 'GET') {
		handleGET(pathname, response);
	}
	else if (request.method === 'POST') {
		handlePOST(request, response, pathname)
	}
}).listen(8080);

// For GET requests prepend ./content/ then grab and read out file. 
// If file not found, read 404 page
// TODO: The way I handle reading encoding and writing content-type back is super hacky
// This should be improved in the future, but for a base project.. it works.
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
			if (pathname.endsWith(".css")) {
				response.writeHead(200, {'Content-Type': 'text/css'})
			}
			else {
				response.writeHead(200, {'Content-Type': 'text/html'});
			}
			response.end(contents);
		}
	});
}

// We only handle on post request: temps
// This will return a JSON object of all the temps at the assumed location
function handlePOST(request, response, command) {
	if (command === '/temps') {
		request.on('data', () => {});
		request.on('end', () => {
			response.writeHead(200, {'Content-Type': 'application/json'});
			getTemps((data) => {
				response.end(JSON.stringify(data));
			});
		});
	}
	else {
		response.writeHead(404, {'Content-Type': 'text/html'});
		response.end('Unknown POST request');
	}
}

// Attempt to read 404.html in content folder
// If error occurs, insult the user, even though it's probably my fault ;)
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

// Call OpenWeatherMap API to grab current weather data
function getTemps(callback) {
	getSecretInfo((info) => {
		let url = 'http://api.openweathermap.org/data/2.5/weather' + info;
		http.get(url, (response) => {
			  let data = '';
			response.on('data', (chunk) => {
				data += chunk;
			});
			response.on('end', () => {
				let json = JSON.parse(data);
				let temps = getAllTempsFromK(json.main.temp);
				callback(temps);
			});
		}).on("error", (error) => {
			  console.log("Error: " + error.message);
		});
	});
}

// Do conversions from kelvin to all other scales of temperatures
function getAllTempsFromK(k) {
	let c = k - 273.15;
	let f = k * 1.8 - 459.67
	let r = k * 1.8;
	let d = (373.15 - k) * 1.5
	let n = (k - 273.15) * .33;
	let re = (k - 273.15) * .8;
	let ro = (k - 273.15) * .525 + 7.5;
	return {
		'Kelvin' : k.toFixed(2),
		'Celcius': c.toFixed(2),
		'Fahrenheit': f.toFixed(2),
		'Rankine': r.toFixed(2),
		'Delisle': d.toFixed(2),
		'Newton': n.toFixed(2),
		'Réaumur': re.toFixed(2),
		'Rømer': ro.toFixed(2)
	};
}

// secretInfo includes API key and lat/long location. Get your own!
function getSecretInfo(callback) {
	if (secretInfo) {
		callback(secretInfo);
	}

	fs.readFile('./secretInfo', 'utf8', function(err, contents) {
		if (err) {
			console.log(err);
		}
		else {
			secretInfo = contents;
			callback(secretInfo);
		}
	});
}