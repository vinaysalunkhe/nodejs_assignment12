const express = require("express");
const fs = require("fs");
const app = express();
var session = require("express-session");
const multer = require("multer");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "vinu",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.static("views"));
app.use(express.static("uploads"));
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: multerStorage });
app.get("/", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  } else {
    res.render("home", { email: req.session.email });
  }
});
app.get("/index", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  data = readData();
  if (data) {
    data = JSON.parse(data);
  }
  res.render("index", { email: req.session.email, data: data });
});
app.get("/about", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.render("about", { email: req.session.email });
});
app.get("/contact", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.render("contact", { email: req.session.email });
});
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  fs.readFile("./users.json", "utf-8", (err, data) => {
    if (err) {
      res.send(err);
    } else {
      if (data == "") {
        res.render("login", { error: "signup first" });
        return;
      }
      try {
        data = JSON.parse(data);
        flag = 0;
        data.forEach((user) => {
          if (user.email == email && user.password == password) {
            req.session.isLoggedIn = true;
            req.session.email = email;
            flag = 1;
            return;
          }
        });
        if (flag == 0) {
          res.render("login", { error: "invalid email or password" });
        } else {
          res.redirect("/index");
        }
      } catch (err) {
        res.send(err);
      }
    }
  });
});
app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});
app.post("/signup", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  fs.readFile("./users.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      if (data == "") {
        data = "[]";
      }
      try {
        data = JSON.parse(data);
        flag = 0;
        data.forEach((user) => {
          if (user.email == email) {
            flag = 1;
            return;
          }
        });
        if (flag == 1) {
          res.render("signup", { error: "email already exists" });
          return;
        } else {
          data.push({ email: email, password: password });
        }
        fs.writeFile("./users.json", JSON.stringify(data), (err) => {
          if (err) {
            res.send(err);
          } else {
            res.redirect("/login");
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  });
});
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
app.get("/readTask", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  fs.readFile("./tasks.txt", "utf-8", (err, data) => {
    if (err) {
      res.send(err);
    } else {
      if (data == "") {
        res.send("noting to show");
      }
      try {
        data = JSON.parse(data);
        res.send(data);
      } catch (err) {
        console.log(err);
      }
    }
  });
});
app.post("/writeTask", upload.single("pic"), (req, res) => {
  if (!req.session.isLoggedIn) {
    res.status(401).send("Unauthorized");
    return;
  }
  task = req.body;
  task.pic = req.file.originalname;
  task.isCompleted = false;
  task.id = Date.now();
  fs.readFile("./tasks.txt", "utf-8", (err, data) => {
    if (err) {
      res.send(err);
    } else {
      if (data == "") {
        data = "[]";
      }

      try {
        data = JSON.parse(data);
        data.push(task);
        fs.writeFile("./tasks.txt", JSON.stringify(data), (err) => {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/index");
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  });
});

app.delete("/deleteTask", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  task = req.body;
  fs.readFile("./tasks.txt", "utf-8", (err, data) => {
    if (err) {
      res.send(err);
    } else {
      if (data == "") {
        res.send("noting to show");
      }
      try {
        data = JSON.parse(data);
        data = data.filter((task) => {
          return task.id != req.body.id;
        });
        fs.writeFile("./tasks.txt", JSON.stringify(data), (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("File written successfully\n");
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  });
  res.send("Task deleted successfully");
});

app.put("/updateTask", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.status(401).send("Unauthorized");
    return;
  }
  task = req.body;
  fs.readFile("./tasks.txt", "utf-8", (err, data) => {
    if (err) {
      res.send(err);
    } else {
      if (data == "") {
        res.send("noting to show");
      }
      try {
        data = JSON.parse(data);
        data.forEach((element) => {
          if (element.id == task.id) {
            element.isCompleted = task.isCompleted;
            return;
          }
        });
        fs.writeFile("./tasks.txt", JSON.stringify(data), (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("File written successfully\n");
          }
        });
        res.send(data);
      } catch (err) {
        console.log(err);
      }
    }
  });
});
app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

function readData() {
  data = fs.readFileSync("./data.json", "utf-8");
  return data;
}
