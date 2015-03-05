	window.onload = function () {
				var width = 400;
				var height = 300;
				var cGaze = new camgaze.Camgaze(width, height, "mainCanvas");
				var drawer = new camgaze.drawing.ImageDrawer();

				var frameOp = function (image_data, video) {
					var grayImg = camgaze.CVUtil.toGrayscale(image_data);
					var binaryImg = camgaze.CVUtil.grayScaleInRange(
						grayImg,
						10, 26
					);
					var blobs = camgaze.CVUtil.getConnectedComponents(binaryImg, 5);
					blobs.forEach(
						function (blob) {
							image_data = drawer.drawFill(
								image_data,
								blob.getContour(),
								[255, 0, 0] // red
							);
						}
					);

					var averagePos = blobs.map(
						function (blob) {
							return blob.getCentroid();
						}
					).reduce(
						function (previousPoint, currentPoint) {
							return previousPoint.add(
								currentPoint
							);
						}
					).div(blobs.length);

					$("#blobNumber").html(blobs.length);
					$("#blobPos").html(
						"( " + 
						averagePos.x.toFixed(0) + 
						", " +
						averagePos.y.toFixed(0) + 
						" )"
					);

					return image_data;
				};
				cGaze.setFrameOperator(frameOp);
}