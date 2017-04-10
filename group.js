var groupModule = (function(data){
  var module = {};

  var currentCohort;

  var shuffle = function (arr) {
    var randomNum, valueAtCurrIdx;
    for (var currIdx = arr.length; currIdx !== 0; currIdx--) {
      randomNum = Math.floor(Math.random() * currIdx);
      valueAtCurrIdx = arr[currIdx - 1];
      arr[currIdx - 1] = arr[randomNum];
      arr[randomNum] = valueAtCurrIdx;
    }
    return arr;
  };

  var clearGroups = function() {
    var div = document.getElementById('groups');
    while (div.firstChild) {
      div.removeChild(div.firstChild);
    }
  }

  var addIncompleteGroupToOtherGroups = function(groupArr, size) {
    if (groupArr[groupArr.length - 1].length < size) {
      var incompleteGroup = groupArr.pop();
      for (var q = 0 ; q < incompleteGroup.length ; q++) {
        groupArr[q].push(incompleteGroup[q]);
      }
    }
    return groupArr;
  }


  var appendGroupsToDom = function(groupArr,size) {
    var div = document.getElementById('groups');
    var preservePartialGroups = document.getElementById('preserve-partial').checked;
    if (!preservePartialGroups) {
      groupArr = addIncompleteGroupToOtherGroups(groupArr, size);      
    }
    groupArr.forEach(function(g, i){
      var groupDiv = document.createElement('div');
      var names = '';
      g.forEach(function(n, idx){
        if (idx > 0) names += " |==| ";
        names += n;
      });
      groupDiv.textContent = `Group ${i + 1}: ${names}`;
      div.appendChild(groupDiv);
    });
  }

  var buildGroups = function(size) {
    var numShuffles = Math.floor((Math.random() * 1000) /10);
    var groups = [];
    while (numShuffles > 0) {
      shuffle(currentCohort);
      numShuffles--;
    };

    for (var i = 0 ; i < currentCohort.length ; i += size) {
      groups.push(currentCohort.slice(i, i+size));
    }
    appendGroupsToDom(groups,size);
    return groups;
  };

  var addError = function(err) {
    var error = document.getElementById('error');
    var msg = document.createElement('div');
    msg.textContent = err;
    msg.className += " error";
    error.appendChild(msg);
  };

  var checkForErrors = function() {
    var error = document.getElementById('error');
    if(error.children.length > 0) {
      while (error.firstChild) {
        error.removeChild(error.firstChild);
      }
    }
  };

  var createGroupCallback = function(e) {
    e.preventDefault();
    clearGroups();
    checkForErrors()
    var size = document.getElementById('group-size').value;
    size = Math.abs(parseInt(size));
    if (isNaN(size)) {
      addError("Only enter numbers");
      return;
    }
    if (size > currentCohort.length) {
      addError(`Enter a group size less than the number of students (${currentCohort.length})`);
      return;
    }
    
    buildGroups(size);
  };

  var createGroupListener = function() {
    var btn = document.getElementById('create-btn');
    btn.addEventListener('click', createGroupCallback)
  };

  var showGroupBuilderForm = function() {
    var div = document.getElementById('options-form');
    div.className = "show";
  };

  var removeSelectedClass = function() {
    var selected = document.getElementsByClassName('selected');
    for (var i = 0 ; i < selected.length ; i++) {
      var el = selected[i];
      var classes = el.className;
      var classArr = classes.split(' ');
      classArr.forEach(function(c,i,a) {
        if (c === 'selected') {
          a.splice(i,1);
        }
      });
      el.className = classArr.join(' ');
    }
  }

  var cohortSelectionCallback = function(e) {
    removeSelectedClass();
    clearGroups();
    e.target.className += ' selected';
    currentCohort = data[e.target.textContent.toLowerCase()];
    showGroupBuilderForm();
  };

  var buildCohortSelector = function() {
    var div = document.getElementById('cohorts');
    for (let c in data) {
      var cohort = document.createElement('div');
      cohort.textContent = c.toUpperCase();
      cohort.className += " cohort-button";
      cohort.addEventListener('click', cohortSelectionCallback);
      div.appendChild(cohort);
    }
  };

  module.run = function() {
    buildCohortSelector();
    createGroupListener();
  };

  return module;
})(data);
