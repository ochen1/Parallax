// Make a static server
var http = require("http");
var fs = require("fs");
var path = require("path");
var mime = require("mime");
var url = require("url");
var port = process.argv[2] || 3000;

var server = http
	.createServer(function (req, res) {
		var pathname = url.parse(req.url).pathname;
		var filepath = path.join(process.cwd(), pathname);
		fs.stat(filepath, function (err, stats) {
			if (err) {
				res.writeHead(404, { "Content-Type": "text/plain" });
				res.write("404 Not Found");
				res.end();
			} else if (stats.isFile()) {
				var mimeType = mime.getType(filepath);
				res.writeHead(200, { "Content-Type": mimeType });
				var fileStream = fs.createReadStream(filepath);
				fileStream.pipe(res);
			} else {
				res.writeHead(500, { "Content-Type": "text/plain" });
				res.write("500 Internal Server Error");
				res.end();
			}
		});
	})
	.listen(port);
console.log("Server running at http://localhost:" + port);
