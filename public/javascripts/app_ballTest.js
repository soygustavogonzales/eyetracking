var numberOfTestPoints = 10;
var distList = new Array();
var xDistList = new Array();
var yDistList = new Array();
var numGoodFrames = 0;
var startTime;
var endTime;
var endFrameCount;

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStatistics() {
    return {
        xMean : xDistList.mean(),
        yMean : yDistList.mean(),
        distMean : distList.mean(),
        distList : distList,
        xDistList : xDistList,
        yDistList : yDistList,
        samplingRate : (1000 * endFrameCount / (endTime - startTime)).toFixed(4)
    }
}

function startButtonClicked() {
    $("#startButton").remove();
	//alert("balls");
	// width and height of the canvas
	var height = document.height;
	var width = document.width;

	var cGaze = new camgaze.Camgaze(
		width, 
		height, 
		"mainCanvas",
		true
	);

	// height and width here refer to the video width and height
	var eyeTracker = new camgaze.EyeTracker(640, 480);
	var eyeFilter = new camgaze.EyeFilter();
	var eyeCalibrator = new camgaze.LinearCalibrator(
		0, width,
		0, height
	);

	var canvas = document.getElementById('mainCanvas');

	var drawer = new camgaze.drawing.CanvasDrawer(
		"mainCanvas",
		document.width,
		document.height
    );

    // counts the number of clicks the user does
    // onto the canvas
    var clickCounter = 0;

    // points shown to the user for calibration
	var calibrationPoints = [
		new camgaze.structures.Point(
			33, 
			40 
		),
		new camgaze.structures.Point(
			document.width - 50, 
			40
		),
		new camgaze.structures.Point(
			33, 
			document.height - 70
		),
		new camgaze.structures.Point(
			document.width - 50, 
			document.height - 70
		)
	];

    // raw looking data from the eye
    var gazeMetric;

    // point that is randomly drawn on the screen
    // to test the accuracy of the system
    var testPoint;

    // this is the point drawn on the screen
    var drawPoint;

    // the moving average reduces the amount of noise
    // in the mapped point
    var mappedMovingAverage;

    var xTempList = new Array();
    var yTempList = new Array();
    var distTempList = new Array();
    // controls the state of the tests
    setInterval(function (e) {
        if (clickCounter > 3) {
            distList.push(distTempList.mean());
            xDistList.push(xTempList.mean());
            yDistList.push(yTempList.mean());
            xTempList = new Array();
            yTempList = new Array();
            distTempList = new Array();
        }

        if (clickCounter == 3) {
            alert("Start the test");
            mappedMovingAverage = new camgaze.structures.MovingAveragePoints(
                new camgaze.structures.Point(0, 0),
                10
            );

            startTime = +new Date();
        }

        if (clickCounter == numberOfTestPoints + 3) {
            alert("You are done!");
            endTime = +new Date();
            endFrameCount = numGoodFrames;
        }

        testPoint = new camgaze.structures.Point(
            getRandomInt(20, width - 20),
            getRandomInt(20, height - 20)
        );
		clickCounter++;
	}, 7000);

    var frameOp = function (image_data, video, canvasDrawer) {
		canvasDrawer.clearAll()
		canvasDrawer.clearCanvas()
		var trackingData = eyeTracker.track(image_data, video);

        // Determines if a calibration point should be
        // shown on the screen
        if (clickCounter < 4) {
		    canvasDrawer.drawCircle(
			    calibrationPoints[clickCounter],
			    20,  // radius
			    -1, // line width (filled)
			    "green"
		    );
        }

        var gazeList;
        var avgLookingPoint;
        if (trackingData.eyeList.length == 2) {
            gazeList = eyeFilter.getFilteredGaze(trackingData);
		    avgLookingPoint = eyeFilter.getAverageLookingPoint(
			    trackingData
		    );

            // Gaze Metric
		    gazeMetric = new camgaze.structures.Point(
			    parseInt(
				    (document.width / 2).toFixed(0)
			    ) - 3 * avgLookingPoint.x,
			    parseInt(
				    (document.height / 2).toFixed(0)
			    ) + 3 * avgLookingPoint.y
            );
        }

        // determines where to draw the looking point
        switch (clickCounter) {
			case 0:
				drawPoint = eyeCalibrator.setTopLeft(
					gazeMetric
                );
				break;
			case 1:
				drawPoint = eyeCalibrator.setTopRight(
					gazeMetric
                );
				break;
			case 2:
				drawPoint = eyeCalibrator.setBottomLeft(
					gazeMetric
				);
				break;
			case 3:
				drawPoint = eyeCalibrator.setBottomRight(
					gazeMetric
                );
                break;
            default:
				drawPoint = eyeCalibrator.getMappedPoint(
					gazeMetric
                );

                drawPoint = mappedMovingAverage.compound(drawPoint);

                //console.log(drawPoint);
        }

        // keep the drawn point within the screen
        if (drawPoint.x > width) {
            drawPoint.x = width;
        }

        if (drawPoint.y > height) {
            drawPoint.y = height;
        }

        if (drawPoint.x < 0) {
            drawPoint.x = 0;
        }

        if (drawPoint.y < 0) {
            drawPoint.y = 0;
        }

        if (clickCounter > 3) {
            distTempList.push(testPoint.distTo(drawPoint));
            xTempList.push(Math.abs(testPoint.x - drawPoint.x));
            yTempList.push(Math.abs(testPoint.y - drawPoint.y));
        }

        /*
		canvasDrawer.drawCircle(
			drawPoint,
			10,
			-1,
			"blue"
            );
        */

        if (
            clickCounter < numberOfTestPoints + 4 &&
            clickCounter > 3
        ) {
            canvasDrawer.drawCircle(
                testPoint,
                50,
                -1,
                "black"
            );
        }

        if (trackingData.eyeList.length == 2) {
            numGoodFrames++;
			gazeList.forEach(
				function (eye) {
					canvasDrawer.drawCircle(
						eye.centroid.unfiltered,
						5,  // radius
						-1, // line width (filled)
						"red"
					);
				}
			);
		}
		canvasDrawer.drawAll(false);
    };

    // sets the operation at each interation
	cGaze.setFrameOperator(frameOp);
}