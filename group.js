var groupModule = (function(data){
  var module = {};

  var currentCohort;

  var activityButtonCallback = function(e) {
    e.preventDefault();
    var id = e.target.getAttribute('data-id');
    currentCohort.forEach(function(student, idx, arr) {
      if (student.id == id) {
        arr[idx].active = !arr[idx].active;
      }
    })
    if (e.target.textContent === 'Active') {
      e.target.textContent = 'Inactive';
      e.target.className = 'inactive';
    } else {
      e.target.textContent = 'Active';
      e.target.className = 'active';
    }
    console.log(currentCohort);
  }

  var buildActivityTable = function() {
    var container = document.getElementById('groups');
    var div = document.createElement('div');
    currentCohort
      .sort(function(a,b) {
        return a.name > b.name;
      })
      .forEach(function(student, idx, arr) {
        var row = document.createElement('div');
        var btn = document.createElement('button');
        if (student.active) {
          btn.className = 'active';
          btn.textContent = 'Active';
        } else {
          btn.className = 'inactive';
          btn.textContent = 'Inactive';
        }
        btn.setAttribute('data-id', student.id);
        btn.addEventListener('click', activityButtonCallback);
        row.appendChild(btn);
        var nameSpan = document.createElement('span');
        nameSpan.textContent = student.name;
        row.appendChild(nameSpan);
        div.appendChild(row);
      })
    container.appendChild(div);
  }

  var convertCohortToObjects = function(cohort) {
    return cohort.map(function(x, idx) {
      return {
        id : idx,
        name : x,
        active : true
      };
    })
  }

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
        names += n.name;
      });
      groupDiv.textContent = `Group ${i + 1}: ${names}`;
      div.appendChild(groupDiv);
    });
  }

  var buildGroups = function(size) {
    var activeStudents = currentCohort.filter(function(student) {
      return student.active;
    })
    var numShuffles = Math.floor((Math.random() * 100) /10);
    var groups = [];
    while (numShuffles > 0) {
      shuffle(activeStudents);
      numShuffles--;
    };

    for (var i = 0 ; i < activeStudents.length ; i += size) {
      groups.push(activeStudents.slice(i, i+size));
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

    timeout(size, 25, 0);
  };

  function timeout(groupSize, time, iteration) {
    if (iteration < 30) {
      setTimeout(function() {
        clearGroups();
        buildGroups(groupSize);
        timeout(groupSize,time,++iteration);
      }, time)
    }
    clearGroups();
    buildGroups(groupSize);
  }

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
    currentCohort = convertCohortToObjects(data[e.target.textContent.toLowerCase()]);
    showGroupBuilderForm();
    buildActivityTable();
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
