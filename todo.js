document.addEventListener("DOMContentLoaded", function () {
    const taskList = document.getElementById("task-list");
    const taskInput = document.getElementById("task-input");
    const dueDateInput = document.getElementById("due-date");
    const categorySelect = document.getElementById("category-select");
    const prioritySelect = document.getElementById("priority-select");
    const addTaskBtn = document.getElementById("add-task-btn");
    const showUncompletedBtn = document.getElementById("show-uncompleted-btn");
    const showCompletedBtn = document.getElementById("show-completed-btn");
    const sortByDueDateBtn = document.getElementById("sort-by-due-date");
    const sortByPriorityBtn = document.getElementById("sort-by-priority");
    const sortByCategoryBtn = document.getElementById("sort-by-category");
    const searchBar = document.getElementById("searchBar");
    
    let tasks = [];

    function loadTasksFromLocalStorage() {
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            renderTasks();
        }
    }

    function createTaskItem(taskData) {
        const taskItem = document.createElement("li");
        taskItem.className = "task-item";

        const taskInfo = document.createElement("div");
        taskInfo.className = "task-info";

        const taskTitle = createElementWithText("span", "task-title", taskData.title);
        taskTitle.style.marginRight = "15px";

        const categoryDisplay = createElementWithText("span", "category" + taskData.category, taskData.category);
        categoryDisplay.style.marginRight = "15px";

        const dueDateDisplay = createElementWithText("span", "due-date", taskData.dueDate);
        dueDateDisplay.style.marginRight = "15px";

        const priorityDisplay = createElementWithText("span", "priority" + taskData.priority, taskData.priority);

        const statusCheckbox = document.createElement("input");
        statusCheckbox.type = "checkbox";
        statusCheckbox.checked = taskData.completed;
        statusCheckbox.addEventListener("change", function () {
            toggleTaskStatus(taskItem);
        });

        const editButton = createButton("Edit", "edit-btn", function () {
            editTask(taskItem, taskData);
        });

        const deleteButton = createButton("Delete", "delete-btn", function () {
            deleteTask(taskItem, taskData.id);
        });

        taskInfo.append(taskTitle, categoryDisplay, dueDateDisplay, priorityDisplay);
        taskItem.append(statusCheckbox, taskInfo, editButton, deleteButton);

        if (taskData.completed) {
            taskItem.classList.add("completed");
        }

        return taskItem;
    }
    function saveTasksToLocalStorage() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
    

    function createElementWithText(elementType, className, text) {
        const element = document.createElement(elementType);
        element.className = className;
        element.textContent = text;
        return element;
    }

    function createButton(text, className, onClick) {
        const button = document.createElement("button");
        button.textContent = text;
        button.className = className;
        button.addEventListener("click", onClick);
        return button;
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        const category = categorySelect.value;
        const priority = prioritySelect.value;
        const currentDate = new Date();
        const selectedDate = new Date(dueDate);

        if (taskText !== "" && selectedDate >= currentDate) {
            const taskData = {
                id: Date.now(),
                title: taskText,
                dueDate: dueDate,
                category: category,
                priority: priority,
                completed: false,
            };

        tasks.push(taskData);
        saveTasksToLocalStorage();

        const taskItem = createTaskItem(taskData);
        taskItem.dataset.taskId = taskData.id;
        taskList.appendChild(taskItem);

        clearInputFields();
    } else if (selectedDate < currentDate) {
        // Display an error message or provide feedback to the user
        alert("Due date cannot be in the past!");
    }
}

    function editTask(taskItem, taskData) {
        taskInput.value = taskData.title;
        categorySelect.value = taskData.category;

        addTaskBtn.textContent = "Update Task";
        addTaskBtn.removeEventListener("click", addTask);
        addTaskBtn.addEventListener("click", function () {
            updateTask(taskItem, taskData.id);
        });
    }

    loadTasksFromLocalStorage();

    function updateTask(taskItem, taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex !== -1) {
            tasks[taskIndex].title = taskInput.value.trim();
            tasks[taskIndex].category = categorySelect.value;

            saveTasksToLocalStorage();
            clearInputFields();
            renderTasks();
        }

        addTaskBtn.textContent = "Add Task";
        addTaskBtn.removeEventListener("click", updateTask);
        addTaskBtn.addEventListener("click", addTask);
    }
    sortByDueDateBtn.addEventListener("click", function () {
        tasks.sort(compareDueDates);
        renderTasks();
    });

    
    function compareDueDates(taskA, taskB) {
        const dateA = new Date(taskA.dueDate);
        const dateB = new Date(taskB.dueDate);
        return dateA - dateB;
    }
    sortByPriorityBtn.addEventListener("click", function () {
        tasks.sort(comparePriorities);
        renderTasks();
    });
    function comparePriorities(taskA, taskB) {
        const priorityOrder = {
            low: 1,
            medium: 2,
            high: 3,
        };
    
        const priorityA = priorityOrder[taskA.priority];
        const priorityB = priorityOrder[taskB.priority];
    
        return priorityA - priorityB;
    }

    function searchTasks(query) {
        console.log(query);
        const filteredTasks = tasks.filter(task => 
            task.title.toLowerCase().includes(query) ||
            task.category.toLowerCase().includes(query) ||
            task.dueDate.toLowerCase().includes(query) ||
            task.priority.toLowerCase().includes(query)
        );
    
        taskList.innerHTML = "";
    
        filteredTasks.forEach(taskData => {
            const taskItem = createTaskItem(taskData);
            taskItem.dataset.taskId = taskData.id;
            taskList.appendChild(taskItem);
        });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    sortByCategoryBtn.addEventListener("click", function () {
        tasks.sort(compareCategories);
        renderTasks();
    });

    searchBar.addEventListener("input", function () {
        const searchQuery = searchBar.value.trim().toLowerCase();
        searchTasks(searchQuery);
        saveTasksToLocalStorage();
    });

    function compareCategories(taskA, taskB) {
        const categoryA = taskA.category.toLowerCase();
        const categoryB = taskB.category.toLowerCase();
    
        if (categoryA < categoryB) {
            return -1;
        } else if (categoryA > categoryB) {
            return 1;
        } else {
            return 0;
        }
    }
    

    function deleteTask(taskItem, taskId) {
        taskList.removeChild(taskItem);
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasksToLocalStorage();
    }

    function toggleTaskStatus(taskItem) {
        taskItem.classList.toggle("completed");
        const taskId = parseInt(taskItem.dataset.taskId);
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasksToLocalStorage();
        }
    }

    function clearInputFields() {
        taskInput.value = "";
        categorySelect.value = "work";
    }

    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach(taskData => {
            const taskItem = createTaskItem(taskData);
            taskItem.dataset.taskId = taskData.id;
            taskList.appendChild(taskItem);
        });
    }
    

    addTaskBtn.addEventListener("click", addTask);
    sortByDueDateBtn.addEventListener("click", renderTasks);
    sortByPriorityBtn.addEventListener("click", renderTasks);
    sortByCategoryBtn.addEventListener("click", renderTasks);

    // searchBar.addEventListener("input", function () {
    //     filterTasks(searchBar.value.trim().toLowerCase());
    // });

    showUncompletedBtn.addEventListener("click", function () {
        filterTasks(false);
    });

    showCompletedBtn.addEventListener("click", function () {
        filterTasks(true);
    });

    function filterTasks(completed) {
        const filteredTasks = tasks.filter(task => task.completed === completed);
        taskList.innerHTML = "";

        filteredTasks.forEach(taskData => {
            const taskItem = createTaskItem(taskData);
            taskItem.dataset.taskId = taskData.id;
            taskList.appendChild(taskItem);
        });
    }

})

// searchButton.addEventListener("click", function () {
//     const searchQuery = searchBar.value.trim().toLowerCase();
//     searchTasks(searchQuery);
//     saveTasksToLocalStorage();
// });

// function searchTasks(query) {
//     console.log(query);
//     const filteredTasks = tasks.filter(task => 
//         task.title.toLowerCase().includes(query) ||
//         task.category.toLowerCase().includes(query) ||
//         task.dueDate.toLowerCase().includes(query) ||
//         task.priority.toLowerCase().includes(query)
//     );

//     taskList.innerHTML = "";

//     filteredTasks.forEach(taskData => {
//         const taskItem = createTaskItem(taskData);
//         taskItem.dataset.taskId = taskData.id;
//         taskList.appendChild(taskItem);
//     });
// localStorage.setItem("tasks", JSON.stringify(tasks));
// }