// This is the wrapper for custom tests, called upon web components ready state
function runCustomTests() {
  // Place any setup steps like variable declaration and initialization here

  var range = document.getElementById('range');

  // This is the placeholder suite to place custom tests in
  // Use testCase(options) for a more convenient setup of the test cases
  suite('Navigation', function() {

    test('navigation from from to to', function(done) {
      var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
          fromEntries = Polymer.dom(fields[0].root).querySelectorAll('px-datetime-entry'),
          fromTimeCells = Polymer.dom(fromEntries[1].root).querySelectorAll('px-datetime-entry-cell');
      var spy = sinon.spy(range, '_focusFirstToEntry');

      fireKeyboardEvent(fromTimeCells[fromTimeCells.length - 1], 'ArrowRight');

      setTimeout(function() {
        assert.isTrue(spy.called);

        //unwrap spy
        range._focusFirstToEntry.restore();
        done();
      },100);
    });

    test('navigation from from to to doesnt trigger next-field from the outside', function(done) {
      var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
          fromEntries = Polymer.dom(fields[0].root).querySelectorAll('px-datetime-entry'),
          fromTimeCells = Polymer.dom(fromEntries[1].root).querySelectorAll('px-datetime-entry-cell');

      var listener = function() {
        range.removeEventListener('px-next-field', listener);
        assert.isTrue(false);
        done();
      };
      range.addEventListener('px-next-field', listener);

      fireKeyboardEvent(fromTimeCells[fromTimeCells.length - 1], 'ArrowRight');

      setTimeout(function() {
        range.removeEventListener('px-next-field', listener);
        done();
      }, 200);
    });

    test('navigation from to to from', function(done) {
      var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
          toEntries = Polymer.dom(fields[1].root).querySelectorAll('px-datetime-entry'),
          todateCells = Polymer.dom(toEntries[0].root).querySelectorAll('px-datetime-entry-cell');
      var spy = sinon.spy(range, '_focusLastFromEntry');

      fireKeyboardEvent(todateCells[0], 'ArrowLeft');

      setTimeout(function() {
        assert.isTrue(spy.called);

        //unwrap spy
        range._focusLastFromEntry.restore();
        done();
      },100);
    });

    test('navigation from to to from doesnt trigger previous-field from the outside', function(done) {
      var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
          toEntries = Polymer.dom(fields[1].root).querySelectorAll('px-datetime-entry'),
          todateCells = Polymer.dom(toEntries[0].root).querySelectorAll('px-datetime-entry-cell');

      var listener = function() {
        range.removeEventListener('px-previous-field', listener);
        assert.isTrue(false);
        done();
      };
      range.addEventListener('px-previous-field', listener);

      fireKeyboardEvent(todateCells[0], 'ArrowLeft');

      setTimeout(function() {
        range.removeEventListener('px-previous-field', listener);
        done();
      }, 200);
    });
  });

  suite('submit without buttons', function() {

    suiteSetup(function(done) {
      //make sure we focus 'to' field as nex tests work on 'to'
      var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
          fromEntries = Polymer.dom(fields[0].root).querySelectorAll('px-datetime-entry'),
          fromTimeCells = Polymer.dom(fromEntries[1].root).querySelectorAll('px-datetime-entry-cell');

      fireKeyboardEvent(fromTimeCells[fromTimeCells.length - 1], 'ArrowRight');
      setTimeout(function() {
        done();
      },100);
    });

    test('event is not fired when changing invalid value', function(done) {
      var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
          toEntries = Polymer.dom(fields[1].root).querySelectorAll('px-datetime-entry'),
          todateCells = Polymer.dom(toEntries[0].root).querySelectorAll('px-datetime-entry-cell'),
          i=0;

      var listener = function(evt) {
        i++;

        //make sure string has been kept in sync
        assert.equal(range.fromMoment.toISOString(), range.range.from);
        assert.equal(range.toMoment.toISOString(), range.range.to);
      };

      range.addEventListener('px-datetime-range-submitted', listener);

      //invalid month, should not trigger event
      fireKeyboardEvent(todateCells[1], '9');
      fireKeyboardEvent(todateCells[1], '9');

      setTimeout(function() {
        assert.equal(i, 0);
        assert.isFalse(range.isValid);
        assert.isTrue(range._isRangeValid);
        range.removeEventListener('px-datetime-range-submitted', listener);
        done();
      }, 100);
    });

    test('event is fired when changing valid value', function(done) {
      var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
          toEntries = Polymer.dom(fields[1].root).querySelectorAll('px-datetime-entry'),
          todateCells = Polymer.dom(toEntries[0].root).querySelectorAll('px-datetime-entry-cell'),
          i = 0;

      var listener = function(evt) {
        i++;
        //make sure string has been kept in sync
        assert.equal(range.fromMoment.toISOString(), range.range.from);
        assert.equal(range.toMoment.toISOString(), range.range.to);
      };

      range.addEventListener('px-datetime-range-submitted', listener);

      //valid month, should trigger event
      fireKeyboardEvent(todateCells[1], '1');
      fireKeyboardEvent(todateCells[1], '2');

      setTimeout(function() {
        assert.equal(i, 1);
        assert.isTrue(range.isValid);
        assert.isTrue(range._isRangeValid);
        range.removeEventListener('px-datetime-range-submitted', listener);
        done();
      }, 100);
    });

    test('datetime kept in sync when changing moment', function() {

      range.fromMoment = Px.moment.tz(moment("2013-04-07T00:00:00.000Z"), range.timeZone);
      assert.equal(range.fromMoment.toISOString(), range.range.from);
      range.toMoment = Px.moment.tz(moment("2014-04-07T00:00:00.000Z"), range.timeZone);
      assert.equal(range.toMoment.toISOString(), range.range.to);
    });

    test('moment kept in sync when changing datetime', function() {

      range.range = {
        from:"2012-04-07T00:00:00.000Z",
        to:"2016-04-07T00:00:00.000Z"
      };

      assert.equal(range.fromMoment.toISOString(), range.range.from);
      assert.equal(range.toMoment.toISOString(), range.range.to);
    });
  });

  suite('submit with buttons', function() {

    setup(function() {
      range.showButtons = true;
    });

    test('event is not fired when changing valid value + buttons', function(done) {
      var i = 0;

      var listener = function(evt) {
        i++;
        //make sure string has been kept in sync
        assert.isTrue(false);
      };

      range.addEventListener('px-datetime-range-submitted', listener);

      //do a change
      range.fromMoment = range.fromMoment.clone().subtract(1, 'month');

      setTimeout(function() {
        assert.equal(i, 0);
        range.removeEventListener('px-datetime-range-submitted', listener);
        done();
      }, 100);
    });

    test('event is fired when pressing enter', function() {
      var i = 0;

      var listener = function(evt) {
        i++;
        //make sure string has been kept in sync
        assert.equal(range.fromMoment.toISOString(), range.range.from);
        assert.equal(range.toMoment.toISOString(), range.range.to);
      };

      range.addEventListener('px-datetime-range-submitted', listener);

      //do a change
      range.fromMoment = range.fromMoment.clone().subtract(1, 'month');

      fireKeyboardEvent(range, 'Enter');

      assert.equal(i, 1);
      range.removeEventListener('px-datetime-submitted', listener);
    });

    test('event is fired when clicking apply', function() {
      var datetimeButtons = Polymer.dom(range.root).querySelectorAll('px-datetime-buttons'),
          buttons = Polymer.dom(datetimeButtons).node[0].querySelectorAll('button'),//??,
          i = 0;

      var listener = function(evt) {
        i++;
        //make sure string has been kept in sync
        assert.equal(range.fromMoment.toISOString(), range.range.from);
        assert.equal(range.toMoment.toISOString(), range.range.to);
      };

      range.addEventListener('px-datetime-range-submitted', listener);

      //do a change
      range.fromMoment = range.fromMoment.clone().subtract(1, 'month');

      buttons[1].click();

      assert.equal(i, 1);
      range.removeEventListener('px-datetime-submitted', listener);
    });

    test('moment is rolledback when clicking cancel', function() {
      var datetimeButtons = Polymer.dom(range.root).querySelectorAll('px-datetime-buttons'),
          buttons = Polymer.dom(datetimeButtons).node[0].querySelectorAll('button'),//??,
          prevFromMoment = range.fromMoment.clone(),
          i = 0;

      //do a change
      range.fromMoment = range.fromMoment.clone().subtract(1, 'month');

      assert.notEqual(range.fromMoment.toISOString(), prevFromMoment.toISOString());

      buttons[0].click();

      assert.equal(range.fromMoment.toISOString(), prevFromMoment.toISOString());
    });

    test('moment is rolledback when pressing esc', function() {
      var datetimeButtons = Polymer.dom(range.root).querySelectorAll('px-datetime-buttons'),
          buttons = Polymer.dom(datetimeButtons).node[0].querySelectorAll('button'),//??,
          prevFromMoment = range.fromMoment.clone();
      //do a change
      range.fromMoment = range.fromMoment.clone().subtract(1, 'month');

      assert.notEqual(range.fromMoment.toISOString(), prevFromMoment.toISOString());

      fireKeyboardEvent(range, 'Esc');

      assert.equal(range.fromMoment.toISOString(), prevFromMoment.toISOString());
    });

    test('datetime doesnt change with buttons', function() {
      var datetimeButtons = Polymer.dom(range.root).querySelectorAll('px-datetime-buttons'),
          buttons = Polymer.dom(datetimeButtons).node[0].querySelectorAll('button'),//??,
          prevRangeFrom = range.range.from,
          prevFromMoment = range.fromMoment.clone();

      //do a change
      range.fromMoment = range.fromMoment.clone().subtract(1, 'month');

      //moment should have changed
      assert.notEqual(range.fromMoment.toISOString(), prevFromMoment.toISOString());

      //but not datetime
      assert.equal(range.range.from, prevRangeFrom);
    });
   });


  suite('validation', function() {
    test('range wont allow range to be reversed', function(){
      var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
          toEntries = Polymer.dom(fields[1].root).querySelectorAll('px-datetime-entry'),
          todateCells = Polymer.dom(toEntries[0].root).querySelectorAll('px-datetime-entry-cell'),
          i=0;

      var listener = function(evt) {
        i++;
      };

      range.addEventListener('px-datetime-range-submitted', listener);

      //to date should be after before date
      fireKeyboardEvent(todateCells[0], '1');
      fireKeyboardEvent(todateCells[0], '2');
      fireKeyboardEvent(todateCells[0], '2');
      fireKeyboardEvent(todateCells[0], '2');

      setTimeout(function() {
        assert.equal(i, 0);
        assert.isFalse(range.isValid);
        assert.isFalse(range._isRangeValid);
        range.removeEventListener('px-datetime-range-submitted', listener);
        done();
      }, 100);
    });
  });
};

function fireKeyboardEvent(elem, key){
  var evt = new CustomEvent('keydown',{detail:{'key':key,'keyIdentifier':key}});
   elem.dispatchEvent(evt);
}
