document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("list");
  const warningMessage = document.getElementById("task-warning");

  let selected = null;

  // Add task in to do list
  const addTask = (event) => {
    event.preventDefault();

    const taskText = taskInput.value.trim();
    if (!taskText) {
      warningMessage.textContent = "Please enter a task name.";
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
        <span>${taskText}</span>
        <div class="meta">
            <small>${date}</small>
            <span>${"🩷".repeat(priority)}</span>
        </div>
        `;

    taskDiv.addEventListener("dragstart", (e) => {
      selected = taskDiv;
    });

    taskList.appendChild(taskDiv);
    taskInput.value = "";
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
});
