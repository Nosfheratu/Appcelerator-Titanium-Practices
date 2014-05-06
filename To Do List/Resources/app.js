var db = Ti.Database.open('todo.sqlite');

db.execute('CREATE TABLE IF NOT EXISTS TODO_ITEMS (ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT, IS_COMPLETE INTEGER)');

var win = Ti.UI.createWindow({
	backgroundColor: '#ffffff',
	title: 'To Do List'
});

var headerView = Ti.UI.createView({
	top: 0,
	height: '50dp',
	width: '100%',
	backgroundColor: '#447294',
	layout: 'horizontal'
});

var txtTaskName = Ti.UI.createTextField({
	left: 5,
	width: '75%',
	height: Ti.UI.FILL,
	hintText: 'Enter new task name...',
	borderColor: '#000000',
	backgroundColor: '#ffffff',
	borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED
});

headerView.add(txtTaskName);

var btnAdd = Ti.UI.createButton({
	backgroundImage: 'add_button.png',
	left: 15,
	height: '45dp',
	width: '45dp'
});

btnAdd.addEventListener('click', function(e) {
    addTask(txtTaskName.value);
});

txtTaskName.addEventListener('return', function() {
    btnAdd.fireEvent('click');
});

headerView.add(btnAdd);

win.add(headerView);

var taskView = Ti.UI.createView({
	top: '50dp',
	width: '100%',
	backgroundColor: '#eeeeee'
});

var taskList = Ti.UI.createTableView({
	width: Ti.UI.FILL,
	heght: Ti.UI.FILL,
	separatorColor: '#447294'
});

taskList.addEventListener('click', function(e) {
	var todoItem = e.rowData;
	
	var isComplete = (todoItem.hasCheck ? 0 : 1);
	
	db.execute('UPDATE TODO_ITEMS SET IS_COMPLETE=? WHERE ID=?', isComplete, todoItem.id);
	
	refreshTaskList();
});

taskView.add(taskList);
win.add(taskView);

var buttonBar = Ti.UI.createView({
	height: '50dp',
	width: '100%',
	backgroundColor: '#447294',
	bottom: 0
});

var basicSwitch;

if (!Ti.Android) {
	alert('android device');
	basicSwitch = Ti.UI.iOS.createTabbedBar({
		labels: ['All', 'Active'],
		left: 5,
		backgroundColor: buttonBar.backgroundColor,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		index: 0
	});
} else {
	basicSwitch = Ti.UI.createSwitch({
		value: true,
		left: 5,
		titleOn: 'All',
		titleOff: 'Active'
	});	
	
	basicSwitch.addEventListener('change', function(e) {
		toggleAllTasks(e.value === true);
	});
}

var btnClearComplete = Ti.UI.createButton({
	title: 'Clear Complete',
	right: '5'
});

btnClearComplete.addEventListener('click', function(e) {
	db.execute('DELETE FROM TODO_ITEMS WHERE IS_COMPLETE = 1;');
	refreshTaskList();
});

buttonBar.add(basicSwitch);
buttonBar.add(btnClearComplete);

win.add(buttonBar);

win.addEventListener('close', function() {
    db.close();
});

refreshTaskList();

win.open();

function addTask (task) {
  db.execute("INSERT INTO TODO_ITEMS (NAME, IS_COMPLETE) VALUES (?, 0)", task);
  
  txtTaskName.value = '';
  txtTaskName.blur();
  
  refreshTaskList();
}

function refreshTaskList() {
    var rows = db.execute('SELECT * FROM TODO_ITEMS');
    var data = [];
    
    while (rows.isValidRow()) {
        var isComplete = rows.fieldByName('IS_COMPLETE');
        
        data.push({
            title: '' + rows.fieldByName('NAME') + '',
            hasCheck: (isComplete === 1) ? true : false,
            id: rows.fieldByName('ID'),
            color: '#153450',
            className: 'task'
        });
        
        rows.next();
    };
    
    taskList.setData(data);
}

function toggleAllTasks(showAll) {
	if (showAll) {
		refreshTaskList();
	} else {
		var section = taskList.data[0];
		
		for (var i=0; i < section.rowCount; i++) {
			var row = section.rows[i];
			
			if (row.hasCheck) {
				taskList.deleteRow(i);
			}
		}
	}
}
