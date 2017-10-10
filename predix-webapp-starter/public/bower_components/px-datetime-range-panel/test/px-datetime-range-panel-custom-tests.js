// This is the wrapper for custom tests, called upon web components ready state
function runCustomTests() {
  // Place any setup steps like variable declaration and initialization here
  var rangePanel = document.getElementById('range_panel'),
      fromCal = Polymer.dom(rangePanel.root).querySelectorAll('px-calendar-picker')[0],
      toCal = Polymer.dom(rangePanel.root).querySelectorAll('px-calendar-picker')[1];


  // This is the placeholder suite to place custom tests in
  // Use testCase(options) for a more convenient setup of the test casess
  suite('Calendars base dates', function() {

    //reset from base dates for every tests
    setup(function(done) {

      rangePanel.fromBaseDate = rangePanel._convertISOtoMoment("2016-06-01T20:00:00Z");
      rangePanel.toBaseDate = rangePanel._convertISOtoMoment("2016-07-11T22:00:00Z");

      flush(function() {
        done();
      });
    });

    test('by default month follow', function() {
      assert.equal(rangePanel.toBaseDate.diff(rangePanel.fromBaseDate, 'month'), 1);
    });

    test('middle arrows not shown when month consecutive', function() {
      var fromCalendar = Polymer.dom(rangePanel.root).querySelector('#from');
      var toCalendar = Polymer.dom(rangePanel.root).querySelector('#to');
      assert.isFalse(fromCalendar.hidePreviousButton);
      assert.isTrue(fromCalendar.hideNextButton);
      assert.isTrue(toCalendar.hidePreviousButton);
      assert.isFalse(toCalendar.hideNextButton);
    });

    test('all arrows shown when month not consecutive', function(done) {

      rangePanel.toBaseDate = rangePanel._convertISOtoMoment("2016-08-11T22:00:00Z");

      flush(function() {
        var fromCalendar = Polymer.dom(rangePanel.root).querySelector('#from');
        var toCalendar = Polymer.dom(rangePanel.root).querySelector('#to');
        assert.isFalse(fromCalendar.hidePreviousButton);
        assert.isFalse(fromCalendar.hideNextButton);
        assert.isFalse(toCalendar.hidePreviousButton);
        assert.isFalse(toCalendar.hideNextButton);
        done();
      });
    });

    test('"to" calendar cant be same as "from" calendar', function(done) {

      rangePanel.toBaseDate = rangePanel._convertISOtoMoment("2016-06-11T22:00:00Z");

      flush(function() {
        assert.isFalse(rangePanel.toBaseDate.isSame(rangePanel.fromBaseDate, 'month'));
        done();
      });
    });

    test('"to" calendar cant be before "from" calendar', function(done) {

      rangePanel.toBaseDate = rangePanel._convertISOtoMoment("2016-04-11T22:00:00Z");

      flush(function() {
        assert.isFalse(rangePanel.toBaseDate.isBefore(rangePanel.fromBaseDate, 'month'));
        done();
      });
    });

    test('"from" calendar cant be same as "to" calendar', function(done) {

      rangePanel.fromBaseDate = rangePanel._convertISOtoMoment("2016-07-11T22:00:00Z");

      flush(function() {
        assert.isFalse(rangePanel.toBaseDate.isSame(rangePanel.fromBaseDate, 'month'));
        done();
      });
    });

    test('"from" calendar cant be after "to" calendar', function(done) {

      rangePanel.fromBaseDate = rangePanel._convertISOtoMoment("2016-09-11T22:00:00Z");

      flush(function() {
        assert.isFalse(rangePanel.fromBaseDate.isAfter(rangePanel.toBaseDate, 'month'));
        done();
      });
    });

  });

  suite('select dates on calendars', function() {

    //reset from base dates for every tests
    suiteSetup(function(done) {

      rangePanel.fromBaseDate = rangePanel._convertISOtoMoment("2016-06-02T00:00:00Z");
      rangePanel.toBaseDate = rangePanel._convertISOtoMoment("2016-07-11T00:00:00Z");

      flush(function() {
        done();
      });
    });

    setup(function(done) {
      //remove all selection
      fromCal.fromMoment = null;
      fromCal.toMoment = null;
      toCal.fromMoment = null;
      toCal.toMoment = null;

      flush(function() {
        done();
      });
    });

    test('range is fully on from calendar', function(done) {

      //we don't want to dive into the implementation details of calendar and cells.
      //simulate selection by firing events ourselves
      var firstSelection = rangePanel._convertISOtoMoment("2016-06-03T20:00:00Z"),
          secondSelection = rangePanel._convertISOtoMoment("2016-06-17T22:00:00Z"),
          prevFrom = rangePanel.fromMoment,
          prevTo = rangePanel.toMoment;

      //simulate first selection on from cal
      fromCal._selectDate(firstSelection);
      flush(function() {
        //propagate event that first selection happened
        fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

        //simulate second selection
        fromCal._selectDate(secondSelection);
        flush(function() {
          //propagate second selection
          fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

          //moment range should have been set
          assert.isTrue(firstSelection.isSame(rangePanel.fromMoment, 'day'));
          assert.isTrue(secondSelection.isSame(rangePanel.toMoment, 'day'));

          //both calendars should have their moment synchronized
          assert.isTrue(fromCal.fromMoment.isSame(rangePanel.fromMoment));
          assert.isTrue(toCal.fromMoment.isSame(rangePanel.fromMoment));
          assert.isTrue(fromCal.toMoment.isSame(rangePanel.toMoment));
          assert.isTrue(toCal.toMoment.isSame(rangePanel.toMoment));

          done();
        });
      });
    });

    test('range is fully on from calendar, reversed', function(done) {

      //we don't want to dive into the implementation details of calendar and cells.
      //simulate selection by firing events ourselves
      var firstSelection = rangePanel._convertISOtoMoment("2016-06-03T20:00:00Z"),
          secondSelection = rangePanel._convertISOtoMoment("2016-06-17T22:00:00Z"),
          prevFrom = rangePanel.fromMoment,
          prevTo = rangePanel.toMoment;

      //simulate first selection on from cal
      fromCal._selectDate(secondSelection);
      flush(function() {
        //propagate event that first selection happened
        fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

        //simulate second selection
        fromCal._selectDate(firstSelection);
        flush(function() {
          //propagate second selection
          fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

          //moment range should have been set
          assert.isTrue(firstSelection.isSame(rangePanel.fromMoment, 'day'));
          assert.isTrue(secondSelection.isSame(rangePanel.toMoment, 'day'));

          //both calendars should have their moment synchronized
          //from calendar would usually deal with swappingdates, doesn't happen here since
          //we've forced simulated selection
          assert.isTrue(fromCal.fromMoment.isSame(rangePanel.fromMoment, 'day'));
          assert.isTrue(toCal.fromMoment.isSame(rangePanel.fromMoment, 'day'));
          assert.isTrue(fromCal.toMoment.isSame(rangePanel.toMoment, 'day'));
          assert.isTrue(toCal.toMoment.isSame(rangePanel.toMoment, 'day'));

          done();
        });
      });
    });

    test('time should be preserved when changing dates', function(done) {
      //we don't want to dive into the implementation details of calendar and cells.
      //simulate selection by firing events ourselves
      var firstSelection = rangePanel._convertISOtoMoment("2016-06-03T20:00:00Z"),
          secondSelection = rangePanel._convertISOtoMoment("2016-06-17T22:00:00Z"),
          prevFrom = rangePanel.fromMoment,
          prevTo = rangePanel.toMoment;

      //make sure the time are different
      firstSelection.minute(prevFrom.minute() + 20);
      secondSelection.minute(prevTo.minute() + 20);

      //simulate first selection on from cal
      fromCal._selectDate(firstSelection);
      flush(function() {
        //propagate event that first selection happened
        fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

        //simulate second selection
        fromCal._selectDate(secondSelection);
        flush(function() {
          //propagate second selection
          fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

          //time should have been preserved
          assert.equal(prevFrom.hour(), rangePanel.fromMoment.hour());
          assert.equal(prevFrom.minute(), rangePanel.fromMoment.minute());
          assert.equal(prevFrom.second(), rangePanel.fromMoment.second());
          assert.equal(prevFrom.millisecond(), rangePanel.fromMoment.millisecond());

          done();
        });
      });
    });

    test('range is fully on to calendar', function(done) {

      //we don't want to dive into the implementation details of calendar and cells.
      //simulate selection by firing events ourselves
      var firstSelection = rangePanel._convertISOtoMoment("2016-07-03T00:00:00Z"),
          secondSelection = rangePanel._convertISOtoMoment("2016-07-17T00:00:00Z");

      //simulate first selection on to cal
      toCal._selectDate(firstSelection);
      flush(function() {
        //propagate event that first selection happened
        toCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

        //simulate second selection
        toCal._selectDate(secondSelection);
        flush(function() {
          //propagate second selection
          toCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

          //moment range should have been set
          assert.isTrue(firstSelection.isSame(rangePanel.fromMoment, 'day'));
          assert.isTrue(secondSelection.isSame(rangePanel.toMoment, 'day'));

          //both calendars should have their moment synchronized
          assert.isTrue(fromCal.fromMoment.isSame(rangePanel.fromMoment));
          assert.isTrue(toCal.fromMoment.isSame(rangePanel.fromMoment));
          assert.isTrue(fromCal.toMoment.isSame(rangePanel.toMoment));
          assert.isTrue(toCal.toMoment.isSame(rangePanel.toMoment));

          done();
        });
      });
    });

    test('range is fully on to calendar, reversed', function(done) {

      //we don't want to dive into the implementation details of calendar and cells.
      //simulate selection by firing events ourselves
      var firstSelection = rangePanel._convertISOtoMoment("2016-07-03T00:00:00Z"),
          secondSelection = rangePanel._convertISOtoMoment("2016-07-17T00:00:00Z");

      //simulate first selection on to cal
      toCal._selectDate(secondSelection);
      flush(function() {
        //propagate event that first selection happened
        toCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

        //simulate second selection
        toCal._selectDate(firstSelection);
        flush(function() {
          //propagate second selection
          toCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

          //moment range should have been set
          assert.isTrue(firstSelection.isSame(rangePanel.fromMoment, 'day'));
          assert.isTrue(secondSelection.isSame(rangePanel.toMoment, 'day'));

          //both calendars should have their moment synchronized
          assert.isTrue(fromCal.fromMoment.isSame(rangePanel.fromMoment, 'day'));
          assert.isTrue(toCal.fromMoment.isSame(rangePanel.fromMoment, 'day'));
          assert.isTrue(fromCal.toMoment.isSame(rangePanel.toMoment, 'day'));
          assert.isTrue(toCal.toMoment.isSame(rangePanel.toMoment, 'day'));

          done();
        });
      });
    });


    test('first selection on from, second on to', function(done) {

      //we don't want to dive into the implementation details of calendar and cells.
      //simulate selection by firing events ourselves
      var firstSelection = rangePanel._convertISOtoMoment("2016-06-03T00:00:00Z"),
          secondSelection = rangePanel._convertISOtoMoment("2016-07-17T00:00:00Z");

      //simulate first selection on from cal
      fromCal._selectDate(firstSelection);
      flush(function() {
        //propagate event that first selection happened
        fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

        //simulate second selection
        toCal._selectDate(secondSelection);
        flush(function() {
          //propagate second selection
          toCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

          //moment range should have been set
          assert.isTrue(firstSelection.isSame(rangePanel.fromMoment, 'day'));
          assert.isTrue(secondSelection.isSame(rangePanel.toMoment, 'day'));

          //both calendars should have their moment synchronized
          assert.isTrue(fromCal.fromMoment.isSame(rangePanel.fromMoment));
          assert.isTrue(toCal.fromMoment.isSame(rangePanel.fromMoment));
          assert.isTrue(fromCal.toMoment.isSame(rangePanel.toMoment));
          assert.isTrue(toCal.toMoment.isSame(rangePanel.toMoment));

          done();
        });
      });
    });

    test('first selection on to, second on from', function(done) {

      //we don't want to dive into the implementation details of calendar and cells.
      //simulate selection by firing events ourselves
      var firstSelection = rangePanel._convertISOtoMoment("2016-07-03T00:00:00Z"),
          secondSelection = rangePanel._convertISOtoMoment("2016-06-17T00:00:00Z");

      //simulate first selection on from cal
      toCal._selectDate(firstSelection);
      flush(function() {
        //propagate event that first selection happened
        toCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

        //simulate second selection
        fromCal._selectDate(secondSelection);
        flush(function() {
          //propagate second selection
          fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

          //moment range should have been set
          assert.isTrue(secondSelection.isSame(rangePanel.fromMoment, 'day'));
          assert.isTrue(firstSelection.isSame(rangePanel.toMoment, 'day'));

          //both calendars should have their moment synchronized
          assert.isTrue(fromCal.fromMoment.isSame(rangePanel.fromMoment));
          assert.isTrue(toCal.fromMoment.isSame(rangePanel.fromMoment));
          assert.isTrue(fromCal.toMoment.isSame(rangePanel.toMoment));
          assert.isTrue(toCal.toMoment.isSame(rangePanel.toMoment));

          done();
        });
      });
    });
  })

  suite('select last month presets', function(done) {

    var now = moment.tz(moment(), rangePanel.timeZone),
        startOfMonth = now.clone().subtract(1, 'months').startOf('month'),
        endOfMonth = now.clone().subtract(1, 'months').endOf('month');
    suiteSetup(function(done) {

      //set old calendars
      rangePanel.fromBaseDate = rangePanel._convertISOtoMoment("2011-06-02T00:00:00Z");
      rangePanel.toBaseDate = rangePanel._convertISOtoMoment("2012-07-11T00:00:00Z");

      flush(function() {

        //now simulate 'last month' preset selection
        rangePanel.dispatchEvent(new CustomEvent('px-preset-selected',
                    { 'detail':  {
                      "displayText": "Last Month",
                      "startDateTime": startOfMonth,
                      "endDateTime": endOfMonth
                    }}));
        flush(function() {
          done();
        });
      });
    });

    test('shows appropriate calendars', function() {

      assert.isTrue(rangePanel.fromBaseDate.isSame(startOfMonth, 'month'));
      assert.isTrue(rangePanel.toBaseDate.isSame(endOfMonth.clone().add(1, 'month'), 'month'));
    });

    test('moments have been updated', function() {

      assert.isTrue(rangePanel.fromMoment.isSame(startOfMonth, 'day'));
      assert.isTrue(rangePanel.toMoment.isSame(endOfMonth, 'day'));
    });
  });

  suite('select this month presets with future dates blocked doesnt select the whole month', function(done) {

    var now = moment.tz(moment(), rangePanel.timeZone),
        startOfMonth = now.clone().startOf('month'),
        endOfMonth = now.clone().endOf('month');
    suiteSetup(function(done) {

      //set old calendars
      rangePanel.fromBaseDate = rangePanel._convertISOtoMoment("2011-06-02T00:00:00Z");
      rangePanel.toBaseDate = rangePanel._convertISOtoMoment("2012-07-11T00:00:00Z");

      rangePanel.blockFutureDates = true;

      flush(function() {

        //now simulate 'this month' preset selection
        rangePanel.dispatchEvent(new CustomEvent('px-preset-selected',
                    { 'detail':  {
                      "displayText": "This Month",
                      "startDateTime": startOfMonth,
                      "endDateTime": endOfMonth
                    }}));
        flush(function() {
          done();
        });
      });
    });

    test('shows appropriate calendars', function() {
      assert.isTrue(rangePanel.fromMoment.isSame(startOfMonth, 'day'));
      assert.isTrue(rangePanel.toMoment.isSame(now, 'day'));
    });
  });

  suite('select this month presets with future dates blocked doesnt select the whole month', function(done) {

    var now = moment.tz(moment(), rangePanel.timeZone),
        startOfMonth = now.clone().startOf('month'),
        endOfMonth = now.clone().endOf('month');
    suiteSetup(function(done) {

      //set old calendars
      rangePanel.fromBaseDate = rangePanel._convertISOtoMoment("2011-06-02T00:00:00Z");
      rangePanel.toBaseDate = rangePanel._convertISOtoMoment("2012-07-11T00:00:00Z");

      rangePanel.blockFutureDates = false;
      rangePanel.blockPastDates = true;

      flush(function() {

        //now simulate 'this month' preset selection
        rangePanel.dispatchEvent(new CustomEvent('px-preset-selected',
                    { 'detail':  {
                      "displayText": "This Month",
                      "startDateTime": startOfMonth,
                      "endDateTime": endOfMonth
                    }}));
        flush(function() {
          done();
        });
      });
    });

    test('shows appropriate calendars', function() {
      assert.isTrue(rangePanel.fromMoment.isSame(now, 'day'));
      assert.isTrue(rangePanel.toMoment.isSame(endOfMonth, 'day'));
    });
  });

  suite('select last 10 minutes presets', function(done) {

    var now = moment.tz(moment(), rangePanel.timeZone);
        startDateTime = now.clone().subtract(10, 'minutes'),
        endDateTime = now.clone();

    suiteSetup(function(done) {

      //set old calendars
      rangePanel.fromBaseDate = rangePanel._convertISOtoMoment("2011-06-02T00:00:00Z");
      rangePanel.toBaseDate = rangePanel._convertISOtoMoment("2012-07-11T00:00:00Z");

      flush(function() {

        //now simulate 'last month' preset selection
        rangePanel.dispatchEvent(new CustomEvent('px-preset-selected',
                    { 'detail':  {
                      "displayText": "Last Month",
                      "startDateTime": startDateTime,
                      "endDateTime": endDateTime
                    }}));
        flush(function() {
          done();
        });
      });
    });

    test('shows appropriate calendars', function() {

      assert.isTrue(rangePanel.fromBaseDate.isSame(startDateTime, 'month'));
      assert.isTrue(rangePanel.toBaseDate.isSame(endDateTime.clone().add(1, 'month'), 'month'));
    });

    test('moments have been updated', function() {

      assert.isTrue(rangePanel.fromMoment.isSame(startDateTime, 'second'));
      assert.isTrue(rangePanel.toMoment.isSame(endDateTime.startOf('second')), 'second');
    });
  });


  suite('select function presets', function(done) {

    var now = moment.tz(moment(), rangePanel.timeZone);
    var startDateTime = function() {now.clone().subtract(10, 'minutes');};
    var endDateTime = function() {return now.clone();};

    suiteSetup(function(done) {

      //set old calendars
      rangePanel.fromBaseDate = rangePanel._convertISOtoMoment("2011-06-02T00:00:00Z");
      rangePanel.toBaseDate = rangePanel._convertISOtoMoment("2012-07-11T00:00:00Z");

      flush(function() {

        //now simulate 'last month' preset selection
        rangePanel.dispatchEvent(new CustomEvent('px-preset-selected',
                    { 'detail':  {
                      "displayText": "Last Month",
                      "startDateTime": startDateTime,
                      "endDateTime": endDateTime
                    }}));
        flush(function() {
          done();
        });
      });
    });

    test('shows appropriate calendars', function() {

      assert.isTrue(rangePanel.fromBaseDate.isSame(startDateTime(), 'month'));
      assert.isTrue(rangePanel.toBaseDate.isSame(endDateTime().clone().add(1, 'month'), 'month'));
    });

    test('moments have been updated', function() {

      assert.isTrue(rangePanel.fromMoment.isSame(startDateTime(), 'second'));
      assert.isTrue(rangePanel.toMoment.isSame(endDateTime()), 'second')
    });
  });

};
