document.addEventListener("DOMContentLoaded", () => {
  // Prevent the user from choosing a past date
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("task-date").setAttribute("min", today);

  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const warningMessage = document.getElementById("task-warning");

  const to_do = document.getElementById("to-do");
  const progress = document.getElementById("progress");
  const done = document.getElementById("done");

  let selected = null; // Currently dragged task

  // Load tasks from localStorage
  const loadTasksFromStorage = () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach((task) => {
      createTaskFromData(task);
    });
  };

  // Save a task to localStorage
  const saveTaskToStorage = (taskObj) => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(taskObj);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  // Handle task submission from the input field
  const addTask = (event) => {
    event.preventDefault();

    const taskText = taskInput.value.trim();
    if (!taskText) {
      warningMessage.textContent = "Please enter a task name or description.";
      warningMessage.style.display = "block";
      return;
    }

    const date = document.getElementById("task-date").value;
    const priority = parseInt(document.getElementById("task-priority").value);

    const taskObj = {
      id: Date.now().toString(), // Unique ID for the task
      name: taskText,
      date,
      priority,
      status: "to-do",
    };

    createTaskFromData(taskObj);
    saveTaskToStorage(taskObj);

    taskInput.value = "";
    document.getElementById("task-date").value = "";

    [to_do, progress, done].forEach((container) => {
      sortTasksByDateAndPriority(container.querySelector(".list"));
    });
  };

  // Create task from data
  const createTaskFromData = ({ id, name, date, priority, status }) => {
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("list-item");
    taskDiv.setAttribute("draggable", "true");
    taskDiv.setAttribute("data-id", id);
    taskDiv.setAttribute("data-date", date);
    taskDiv.setAttribute("data-priority", priority);
    taskDiv.innerHTML = `
        <div class="task-title">
          <span>${name}</span>
          <div class="task-actions">
            <button class="edit-btn">✏️</button>
            <button class="delete-btn">🗑️</button>
          </div>
        </div>
        <div class="meta">
            <small>${date}</small>
            <span>${"🩷".repeat(priority)}</span>
        </div>
        `;

    // Drag event
    taskDiv.addEventListener("dragstart", (e) => {
      selected = taskDiv;
    });

    // Delete task
    deleteTask(taskDiv);

    // Edit task
    editTask(taskDiv);

    const container =
      status === "progress" ? progress : status === "done" ? done : to_do;

    container.querySelector(".list").appendChild(taskDiv);
    updateTaskColor(taskDiv, status);

    [to_do, progress, done].forEach((container) => {
      sortTasksByDateAndPriority(container.querySelector(".list"));
    });
  };

  // Add event listeners for adding tasks
  addTaskBtn.addEventListener("click", addTask);

  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTask(e);
    }
  });

  taskInput.addEventListener("input", () => {
    warningMessage.style.display = "none";
  });

  // Handle drag and drop between columns
  [to_do, progress, done].forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    container.addEventListener("drop", (e) => {
      if (selected) {
        container.querySelector(".list")?.appendChild(selected) ||
          container.appendChild(selected);
        updateTaskColor(selected, container.id);

        const listContainer = container.querySelector(".list") || container;
        sortTasksByDateAndPriority(listContainer);

        updateStorage();

        selected = null;
      }
    });
  });

  // Update task background color based on its column
  function updateTaskColor(taskDiv, columnId) {
    taskDiv.classList.remove("todo-color", "progress-color", "done-color");
    if (columnId === "to-do") taskDiv.classList.add("todo-color");
    else if (columnId === "progress") taskDiv.classList.add("progress-color");
    else if (columnId === "done") taskDiv.classList.add("done-color");
  }

  function sortTasksByDateAndPriority(container) {
    const tasks = Array.from(container.querySelectorAll(".list-item"));
    tasks.sort((a, b) => {
      const dateA = new Date(a.getAttribute("data-date") || "9999-12-31");
      const dateB = new Date(b.getAttribute("data-date") || "9999-12-31");
      const priorityA = parseInt(a.getAttribute("data-priority"));
      const priorityB = parseInt(b.getAttribute("data-priority"));

      // Closest date first, then highest priority
      if (dateA - dateB !== 0) return dateA - dateB;
      return priorityB - priorityA;
    });

    tasks.forEach((task) => container.appendChild(task));
  }

  let taskToDelete = null;

  // Add delete behavior to a task
  function deleteTask(taskDiv) {
    taskDiv.querySelector(".delete-btn").addEventListener("click", () => {
      taskToDelete = taskDiv;
      document.getElementById("delete-popup").classList.remove("hidden");
    });
  }

  // Confirm delete button
  document.getElementById("confirm-delete").addEventListener("click", () => {
    if (taskToDelete) {
      taskToDelete.remove();
      taskToDelete = null;
      updateStorage();
    }
    document.getElementById("delete-popup").classList.add("hidden");
  });

  // Cancel delete button
  document.getElementById("cancel-delete").addEventListener("click", () => {
    taskToDelete = null;
    document.getElementById("delete-popup").classList.add("hidden");
  });

  let taskToEdit = null;

  // Add edit behavior to a task
  function editTask(taskDiv) {
    taskDiv.querySelector(".edit-btn").addEventListener("click", () => {
      taskToEdit = taskDiv;

      // Get current values
      const taskName = taskDiv.querySelector(".task-title span").innerText;
      const date = taskDiv.getAttribute("data-date") || "";
      const priority = taskDiv.getAttribute("data-priority");

      // Populate edit popup with current values
      document.getElementById("edit-task-name").value = taskName;
      document.getElementById("edit-task-date").value = date;
      document.getElementById("edit-task-priority").value = priority;

      document.getElementById("edit-popup").classList.remove("hidden");
    });
  }

  // Confirm task edit
  document.getElementById("confirm-edit").addEventListener("click", () => {
    if (taskToEdit) {
      const newName = document.getElementById("edit-task-name").value.trim();
      const newDate = document.getElementById("edit-task-date").value;
      const newPriority = parseInt(
        document.getElementById("edit-task-priority").value
      );

      if (!newName) {
        alert("Task name cannot be empty.");
        return;
      }

      taskToEdit.querySelector(".task-title span").innerText = newName;
      taskToEdit.querySelector(".meta small").innerText = newDate;
      taskToEdit.querySelector(".meta span").innerText = "🩷".repeat(
        newPriority
      );

      taskToEdit.setAttribute("data-date", newDate);
      taskToEdit.setAttribute("data-priority", newPriority);

      const parentList = taskToEdit?.parentElement;
      taskToEdit = null;
      document.getElementById("edit-popup").classList.add("hidden");

      // Reorder tasks if necessary
      if (parentList?.classList.contains("list")) {
        sortTasksByDateAndPriority(parentList);
      }

      updateStorage();
    }
  });

  // Cancel edit button
  document.getElementById("cancel-edit").addEventListener("click", () => {
    taskToEdit = null;
    document.getElementById("edit-popup").classList.add("hidden");
  });

  // Update all tasks in localStorage based on current DOM state
  function updateStorage() {
    const allTasks = [];

    [to_do, progress, done].forEach((container) => {
      const status = container.id;
      const tasks = container.querySelectorAll(".list-item");
      tasks.forEach((task) => {
        allTasks.push({
          id: task.getAttribute("data-id"),
          name: task.querySelector(".task-title span").innerText,
          date: task.getAttribute("data-date"),
          priority: parseInt(task.getAttribute("data-priority")),
          status,
        });
      });
    });

    localStorage.setItem("tasks", JSON.stringify(allTasks));
  }

  // Initialize task board
  loadTasksFromStorage();
});
