const createTask = document.getElementById("createTask");
const taskList = document.getElementById("taskList");
const taskDescription = document.getElementById("taskDescription");
const pic = document.getElementById("pic");
document.addEventListener("DOMContentLoaded", function () {
  readAllTask();
});
function readAllTask() {
  fetch("/readTask", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (res.status == 200) {
      res.json().then((data) => {
        data.forEach((task) => {
          list(task);
        });
      });
    } else if (res.status == 401) {
      alert("Unauthorized");
    } else {
      alert("Something went wrong");
    }
  });
}
function readTask(data) {
  list(data);
}
function list(data) {
  const creatItem = document.createElement("li");
  const checkbox = document.createElement("input");
  const button = document.createElement("button");
  const img = document.createElement("img");
  creatItem.style = "display:flex;justify-content:space-between;";
  checkbox.type = "checkbox";
  checkbox.className = "task-status";
  creatItem.className = "list-group-item";
  creatItem.appendChild(checkbox);
  creatItem.innerHTML = data.taskDescription;
  taskList.appendChild(creatItem);
  img.src = data.pic;
  img.style.width = "30px";
  creatItem.appendChild(img);
  creatItem.appendChild(checkbox);
  button.className = "delete-task";
  button.innerHTML = "❌";
  creatItem.appendChild(button);
  if (data.isCompleted) {
    checkbox.checked = true;
    creatItem.style.textDecoration = "line-through";
  } else {
    checkbox.checked = false;
    creatItem.style.textDecoration = "none";
  }
  checkbox.addEventListener("click", function () {
    if (this.checked) {
      creatItem.style.textDecoration = "line-through";
      data.isCompleted = true;
      fetch("/updateTask", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => {
        if (res.ok) {
          res.json().then((data) => {});
        } else if (res.status == 401) {
          alert("Unauthorized");
        } else {
          alert("Something went wrong");
        }
      });
    } else {
      data.isCompleted = false;
      creatItem.style.textDecoration = "none";
      fetch("/updateTask", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => {
        if (res.ok) {
          res.json().then((data) => {});
        } else if (res.status == 401) {
          alert("Unauthorized");
        } else {
          alert("Something went wrong");
        }
      });
    }
  });
  button.addEventListener("click", function () {
    fetch("/deleteTask", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => {
      if (res.ok) {
        creatItem.remove();
      } else if (res.status == 401) {
        alert("Unauthorized");
      } else {
        alert("Something went wrong");
      }
    });
  });
}
