let controller = {

	captureFormFields: () => {
		$('body').on("click", ".button-add", () => {
			event.preventDefault();

			trainName = $('#train-name').val().trim();
			trainDestination = $('#train-destination').val().trim();
			trainDeparture = $('#train-departure').val().trim();
			trainFrequency = $('#train-frequency').val().trim();

			controller.nextArrival();
			controller.minutesAway();

			$('.form-control').val("");

			model.pushNewTrain();

		});
	},


	nextArrival: () => {
		var trainDepartureCoverted = moment(trainDeparture, "hh:mm").subtract(1, 'years');
		var currentTime = moment();
		var diffTime = moment().diff(moment(trainDepartureCoverted), "minutes");
		var timeRemainder = diffTime % trainFrequency;
		var timeInMinutesTillTrain = trainFrequency - timeRemainder;
		nextTrain = moment().add(timeInMinutesTillTrain, 'minutes');
		nextTrain = moment(nextTrain).format('hh:mm A');
	},

	minutesAway: () => {
		var trainDepartureCoverted = moment(trainDeparture, "hh:mm").subtract(1, 'years');
		var currentTime = moment();
		var diffTime = moment().diff(moment(trainDepartureCoverted), "minutes");
		var timeRemainder = diffTime % trainFrequency;
		minutesAway = trainFrequency - timeRemainder;
		minutesAway = moment().startOf('day').add(minutesAway, 'minutes').format('HH:mm');
		return moment(minutesAway).format('HH:mm');
	},
	convertFrequency: () => {
		trainFrequency = moment().startOf('day').add(trainFrequency, 'minutes').format('mm');
	}

};

var config = {
    apiKey: "AIzaSyCCcxkDFj_vMduAR12fEIsfOzAYoS-zGRc",
    authDomain: "train-schedule-cc7ee.firebaseapp.com",
    databaseURL: "https://train-schedule-cc7ee.firebaseio.com",
    projectId: "train-schedule-cc7ee",
    storageBucket: "",
    messagingSenderId: "605795105040"
};
firebase.initializeApp(config);

var database = firebase.database();

var trainName;
var trainDestination;
var trainDeparture;
var minutesAway;
var trainFrequency;
var trainTiming;
var currentTime = moment();
console.log('CURRENT TIME: ' + moment(currentTime).format('hh:mm:ss A'));


var model = {

	pushNewTrain: () => {


		database.ref().push({

			trainDeparture: trainDeparture,
			trainDestination: trainDestination,
			trainFrequency: trainFrequency,
			trainName: trainName,
			dateAdded: firebase.database.ServerValue.TIMESTAMP

		});

		model.pullChildFromDatabase();

	},

	pullChildFromDatabase: () => {

		var filter = database.ref().orderByChild("dateAdded").limitToLast(1)

		filter.once("child_added", function (childSnapshot) {

			trainName = childSnapshot.val().trainNumber
			trainDestination = childSnapshot.val().trainDestination
			trainDeparture = childSnapshot.val().trainDeparture
			trainFrequency = childSnapshot.val().trainFrequency


			view.updateTrainScheduleTable();
		});

	},

	initialDatabasePull: () => {

		database.ref().on("value", function (snapshot) {
			var trains = snapshot.val();


			$('#train-schedule-body').empty();

			for (var index in trains) {
				trainName = trains[index].trainName
				trainDestination = trains[index].trainDestination
				trainDeparture = trains[index].trainDeparture
				trainFrequency = trains[index].trainFrequency

				controller.nextArrival();
				controller.minutesAway();
				view.updateTrainScheduleTable();
			};

		}, function (errorObject) {
			console.log("Errors handled: " + errorObject.code);

		});
	}

}

$(document).ready(function () {

	controller.captureFormFields();
	model.initialDatabasePull();
	setInterval(function () { model.initialDatabasePull() }, 60000);
	view.updateCurrentTime();
	setInterval(function () { view.updateCurrentTime() }, 1000);

});

var view = {


	updateTrainScheduleTable: () => {

		controller.convertFrequency();

		$('#train-schedule-body').append(
			'<tr>' +
			'<th scope="row">' + trainName + '</th>' +
			'<td>' + trainDestination + '</td>' +
			'<td>' + trainFrequency + '</td>' +
			'<td>' + nextTrain + '</td>' +
			'<td>' + minutesAway + '</td>' +
			'</tr>'
		);
	},
	updateCurrentTime: () => {
		$('.currentTime').text(moment().format('hh:mm:ss A'))
	}
};