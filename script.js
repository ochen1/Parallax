function feather(data, width, height) {
	// Pad the data array with 0s on all sides
	var padded = new Uint8ClampedArray(data.length / 4 + 2 * height + 2 * width + 4);
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			padded[(i + 1) * (width + 2) + j + 1] = data[(i * width + j) * 4 + 3];
		}
	}
	// Create the output array
	output = Array(data.length / 4);
	// Convolute the image using a sobel filter
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			output[i * width + j] =
				Math.abs(
					padded[i * (width + 2) + j] -
						padded[i * (width + 2) + j + 2] +
						2 * padded[(i + 1) * (width + 2) + j] -
						2 * padded[(i + 1) * (width + 2) + j + 2] +
						padded[(i + 2) * (width + 2) + j] -
						padded[(i + 2) * (width + 2) + j + 2]
				) +
				Math.abs(
					padded[i * (width + 2) + j] +
						2 * padded[i * (width + 2) + j + 1] +
						padded[i * (width + 2) + j + 2] -
						padded[(i + 2) * (width + 2) + j] -
						2 * padded[(i + 2) * (width + 2) + j + 1] -
						padded[(i + 2) * (width + 2) + j + 2]
				);
			// Threshold the result
			output[i * width + j] = output[i * width + j] ? 255 : 0;
		}
	}
	// Generate a gaussian blur filter
	var filter = Array(Number(document.querySelector("#filter").value) * 2 + 1);
	var filtersize = Number(document.querySelector("#filter").value);
	var filtersum = 0;
	for (var i = 0; i < filter.length / 2; i++) {
		filter[i] = i + 1;
		filter[filter.length - i - 1] = filter[i];
	}
	for (var i = 0; i < filter.length; i++) {
		filtersum += filter[i];
	}
	filtersum *= filtersize + 1;
	// Pad the output array with 0s on all sides
	padded = new Uint8ClampedArray(output.length + (filter.length - 1) * (height + width + 1));
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			padded[(i + filtersize) * (width + 2 * filtersize) + j + filtersize] = output[i * width + j];
		}
	}
	// Convolute the image using the filter
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			var sum = 0;
			for (var k = 0; k < filter.length; k++) {
				for (var l = 0; l < filter.length; l++) {
					sum += padded[(i + k) * (width + 2 * filtersize) + (j + l)] * filter[k] * filter[l];
				}
			}
			output[i * width + j] = sum / filtersum;
		}
	}
	var debugcanvas = document.querySelector("#debug");
	debugcanvas.width = width;
	debugcanvas.height = height;
	var debugctx = debugcanvas.getContext("2d");
	var debugoutput = debugctx.createImageData(width, height);
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			debugoutput.data[(i * width + j) * 4 + 0] = 255 / (output[i * width + j] ? output[i * width + j] : 1);
			debugoutput.data[(i * width + j) * 4 + 1] = 255 / (output[i * width + j] ? output[i * width + j] : 1);
			debugoutput.data[(i * width + j) * 4 + 2] = 255 / (output[i * width + j] ? output[i * width + j] : 1);
			debugoutput.data[(i * width + j) * 4 + 3] = 255;
		}
	}
	debugctx.putImageData(debugoutput, 0, 0);
	// Multiply the alpha values of the input by the reciprocal of the output
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			data[(i * width + j) * 4 + 3] /= output[i * width + j] ? output[i * width + j] : 1;
		}
	}
}

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

image.src = "/image.jpg";
depth.src = "/depth.png";

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
	var canvas = document.createElement("canvas");
	canvas.className = "out";
	canvas.id = "debug";
	document.querySelector("#outputs").appendChild(canvas);
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
		datas[i] = ctxs[i].getImageData(0, 0, ctxs[i].canvas.width, ctxs[i].canvas.height);
	}
	for (var i of datas) {
		for (var j = 0; j < i.data.length; j += 4) {
			i.data[j] = imageData[j];
			i.data[j + 1] = imageData[j + 1];
			i.data[j + 2] = imageData[j + 2];
			i.data[j + 3] = 0;
		}
	}
	for (var i = 0; i < imageData.length; i += 4) {
		var mindiff = Number.MAX_VALUE;
		var minidx = 0;
		for (var j = 0; j < avgs.length; j++) {
			var diff = Math.abs(depthData[i] - avgs[j]);
			if (diff < mindiff) {
				mindiff = diff;
				minidx = j;
			}
		}
		datas[minidx].data[i + 3] = 255;
	}
	for (var i in datas) {
		if (i == datas.length - 1) break;
		feather(datas[i].data, depth.width, depth.height);
	}
	var downloads = document.querySelector("#downloads");
	while (downloads.firstChild) {
		downloads.removeChild(downloads.firstChild);
	}
	for (var i in ctxs) {
		if (i == ctxs.length - 1) break;
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
