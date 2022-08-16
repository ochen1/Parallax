var threshold = 180; // Threshold value
var imagectx = document.querySelector("#imagecanvas").getContext("2d");
var depthctx = document.querySelector("#depthcanvas").getContext("2d");

var image = new Image();
var depth = new Image();

image.onload = function () {
	var w = (imagectx.canvas.width = image.width);
	var h = (imagectx.canvas.height = image.height);

	imagectx.drawImage(image, 0, 0, w, h); // Set image to Canvas context
};

depth.onload = function () {
	var w = (depthctx.canvas.width = depth.width);
	var h = (depthctx.canvas.height = depth.height);

	depthctx.drawImage(depth, 0, 0, w, h); // Set image to Canvas context
};

image.src = "http://localhost:1234/image.jpg";
depth.src = "http://localhost:1234/depth.png";

function splitimages() {
	var imageData = imagectx.getImageData(0, 0, imagectx.canvas.width, imagectx.canvas.height).data;
	var depthData = depthctx.getImageData(0, 0, depthctx.canvas.width, depthctx.canvas.height).data;
	var avgs = [
		Number(document.querySelector("#in1").value),
		Number(document.querySelector("#in2").value),
		Number(document.querySelector("#in3").value),
		Number(document.querySelector("#in4").value),
	];
	var ctxs = [
		document.querySelector("#out1").getContext("2d"),
		document.querySelector("#out2").getContext("2d"),
		document.querySelector("#out3").getContext("2d"),
		document.querySelector("#out4").getContext("2d"),
	];
	var datas = [];
	for (var i in ctxs) {
		ctxs[i].canvas.width = depth.width;
		ctxs[i].canvas.height = depth.height;
		ctxs[i].fillStyle = "black";
		ctxs[i].fillRect(0, 0, depth.width, depth.height);
		datas[i] = ctxs[i].getImageData(0, 0, ctxs[i].canvas.width, ctxs[i].canvas.height);
	}
	for (var i = 0; i < imageData.length; i++) {
		var mindiff = Number.MAX_VALUE;
		var minidx = 0;
		for (var j = 0; j < avgs.length; j++) {
			var diff = Math.abs(depthData[i] - avgs[j]);
			if (diff < mindiff) {
				mindiff = diff;
				minidx = j;
			}
		}
		datas[minidx].data[i] = imageData[i];
	}
	for (var i in ctxs) {
		ctxs[i].putImageData(datas[i], 0, 0);
	}
}
