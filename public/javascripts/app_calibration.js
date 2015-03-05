
			window.onload = function () {
				var bolita1 = $('.bolita1')
				var bolita2 = $('.bolita2')
				var height = 480;
				var width = height*(1.3333333333);

				var cGaze = new camgaze.Camgaze(
					width, 
					height, 
					"mainCanvas"
				);
				var faceDetector = new camgaze.CVUtil.HaarDetector(
					camgaze.cascades.frontalface,
					width,
					height
				);
				var eyeTracker = new camgaze.EyeTracker(width, height);
				var eyeFilter = new camgaze.EyeFilter();
				var drawer = new camgaze.drawing.ImageDrawer();

				var frameOp = function (image_data, video) {
				var trackingData = eyeTracker.track(image_data, video);
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
					var gazeList = eyeFilter.getFilteredGaze(trackingData);

                    // new HAAR.Detector(haarcascade_frontalface_alt, Parallel)
                    //                     .image(image_data) // use the image
                    //                     .interval(30) // set detection interval for asynchronous detection (if not parallel)
                    //                     .complete(function(){  // onComplete callback
                    //                         console.log(this.Selection, this.objects);
                    //                         alert(l+" Objects found");
                    //                     })
                    //                     .detect(1, 1.25, 0.1, 1, true); // go

					if (trackingData.eyeList.length > 0) {
						gazeList.forEach(
							function (eye) {
								//console.log([eye.eyeData.getHaarRectangle().x,eye.eyeData.getHaarRectangle().y].join(":"));
								//console.log([eye.centroid.unfiltered.x,eye.centroid.unfiltered.y].join(":"));
								//console.log(eye.gazeVector);
								bolita1.css({
									top: eye.centroid.unfiltered.y+'px',
									left: eye.centroid.unfiltered.x+'px'
								});
								bolita2.css({
									top: eye.eyeData.getHaarRectangle().y+'px',
									left: eye.eyeData.getHaarRectangle().x+'px'
								});
        image_data = drawer.drawRectangle(
            image_data,
            eye.eyeData.getHaarRectangle(),
            eye.eyeData.getHaarRectangle().width,
            eye.eyeData.getHaarRectangle().height,
            5,
            "yellow"
        );

								// draws the gaze
								image_data = drawer.drawLine(
									image_data,
									eye.centroid.unfiltered,
									eye.centroid.unfiltered.add(eye.gazeVector),
									5,
									"green" 
								);

								// draws the pupil
								image_data = drawer.drawCircle(
									image_data,
									eye.centroid.unfiltered,
									5,  // radius
									-1, // line width (filled)
									"red"
								);
							}
						);
					}
					return image_data;
				};
				cGaze.setFrameOperator(frameOp);
			} 
		