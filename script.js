document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("list");
  const warningMessage = document.getElementById("task-warning");

  const to_do = document.getElementById("to-do");
  const progress = document.getElementById("progress");
  const done = document.getElementById("done");

  let selected = null;

  // Add task in to do list
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

    const taskDiv = document.createElement("div");
    taskDiv.classList.add("list-item");
    taskDiv.setAttribute("draggable", "true");
    taskDiv.setAttribute("data-date", date);
    taskDiv.setAttribute("data-priority", priority);
    taskDiv.innerHTML = `
        <div class="task-title">
          <span>${taskText}</span>
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

    taskList.appendChild(taskDiv);
    taskInput.value = "";
    document.getElementById("task-date").value = "";

    sortTasksByDateAndPriority(taskList);
  };

  addTaskBtn.addEventListener("click", addTask);

  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTask(e);
    }
  });

  taskInput.addEventListener("input", () => {
    warningMessage.style.display = "none";
  });

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

        selected = null;
      }
    });
  });

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

  function deleteTask(taskDiv) {
    taskDiv.querySelector(".delete-btn").addEventListener("click", () => {
      taskToDelete = taskDiv;
      document.getElementById("delete-popup").classList.remove("hidden");
    });
  }

  // Confirm and cancel buttons
  document.getElementById("confirm-delete").addEventListener("click", () => {
    if (taskToDelete) {
      taskToDelete.remove();
      taskToDelete = null;
    }
    document.getElementById("delete-popup").classList.add("hidden");
  });

  document.getElementById("cancel-delete").addEventListener("click", () => {
    taskToDelete = null;
    document.getElementById("delete-popup").classList.add("hidden");
  });
});
