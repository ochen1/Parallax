function downloadcanvas(e) {
	var id = e.target.id.replace("download", "");
	var canvas = document.querySelectorAll(".out")[id];
	var link = document.createElement("a");
	link.download = "output" + id + ".png";
	link.href = canvas.toDataURL("image/png");
	link.click();
}

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

image.src = "https://localhost/image.jpg";
depth.src = "https://localhost/depth.png";

function generatesliders() {
	// Clear all elements in #sliders
	var sliders = document.querySelector("#sliders");
	while (sliders.firstChild) {
		sliders.removeChild(sliders.firstChild);
	}
	// Clear all elements in #outputs
	var outputs = document.querySelector("#outputs");
	while (outputs.firstChild) {
		outputs.removeChild(outputs.firstChild);
	}
	// Clear all elements in #downloads
	var downloads = document.querySelector("#downloads");
	while (downloads.firstChild) {
		downloads.removeChild(downloads.firstChild);
	}
	// Create as many sliders as the value of numoutputs
	var numoutputs = document.querySelector("#numoutputs").value;
	for (var i = 0; i < numoutputs; i++) {
		// Create a new slider
		var slider = document.createElement("input");
		slider.type = "range";
		slider.min = "0";
		slider.max = "255";
		slider.value = "0";
		slider.className = "in";
		document.querySelector("#sliders").appendChild(slider);
		// Create a new canvas
		var canvas = document.createElement("canvas");
		canvas.className = "out";
		document.querySelector("#outputs").appendChild(canvas);
	}
	// Add a button to split the images
	var button = document.createElement("input");
	button.type = "button";
	button.value = "Split Images";
	button.onclick = splitimages;
	document.querySelector("#sliders").appendChild(button);
}

function splitimages() {
	if (document.querySelector("#numoutputs").value == 0) {
		return;
	}
	var imageData = imagectx.getImageData(0, 0, imagectx.canvas.width, imagectx.canvas.height).data;
	var depthData = depthctx.getImageData(0, 0, depthctx.canvas.width, depthctx.canvas.height).data;
	// Create an array avgs containing the values of all elements in class .in
	var avgs = [];
	document.querySelectorAll(".in").forEach((node) => {
		avgs.push(255 - Number(node.value));
	});
	var ctxs = [];
	document.querySelectorAll(".out").forEach((node) => {
		ctxs.push(node.getContext("2d"));
	});
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
		// datas[minidx].data[i] = imageData[i].length == 4 ? imageData[i] : [...imageData[i], 255];
		datas[minidx].data[i] = imageData[i];
	}
	var downloads = document.querySelector("#downloads");
	while (downloads.firstChild) {
		downloads.removeChild(downloads.firstChild);
	}
	for (var i in ctxs) {
		ctxs[i].putImageData(datas[i], 0, 0);
		// Remove all download buttons
		// Create a new download button
		var download = document.createElement("button");
		download.innerHTML = "Download";
		download.className = "download";
		download.id = "download" + i;
		download.addEventListener("click", downloadcanvas);
		document.querySelector("#downloads").appendChild(download);
	}
}
