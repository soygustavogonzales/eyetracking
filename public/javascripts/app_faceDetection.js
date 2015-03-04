window.onload = function () {
				var width = 580;
				var height = 440;
				var cGaze = new camgaze.Camgaze(width, height, "mainCanvas");
				var faceDetector = new camgaze.CVUtil.HaarDetector(
					camgaze.cascades.frontalface,
					width,
					height
				);
				var drawer = new camgaze.drawing.ImageDrawer();

				var frameOp = function (image_data, video) {
					var faceRects = faceDetector.detectObjects(
						video,
						1.1,
						1
					);

					faceRects.forEach(
						function (face) {
							image_data = drawer.drawRectangle(
								image_data,
								face,
								face.width,
								face.height,
								3,
								"red"
							);
						}
					);
					return image_data;
				};
				cGaze.setFrameOperator(frameOp);
}