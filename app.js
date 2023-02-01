require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require('cors');

// Load Model
const User = require("./model/user");
const Project = require("./model/project");
const Task = require("./model/task");

// Load Middleware
const auth = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

// Handle Register POST
app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { name, email, password } = req.body;

    // Validate user input
    if (!(email && password && name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      name: name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, name: user.name, email: email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "7d",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json({token: token});
  } catch (err) {
    console.log(err);
  }
});

// Handle Login POST
app.post("/login", async (req, res) => {
  console.log(req.body)
  try {
    // Get user input
    const { email, password } = req.body;
    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, name: user.name, email: email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "7d",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json({token: token});
    }
    else {
      res.status(400).send("Invalid Credentials");
    }

  } catch (err) {
    console.log(err);
  }
});

// Return User Detail
app.get("/welcome", auth, (req, res) => {
  res.json(req.user)
});


// List Project
app.get('/project', auth, (req, res) => {
  Project.find().populate({
    path: 'manager',
    model: User,
    select: {first_name:1, last_name: 1}
  }).populate({
    path: 'member',
    model: User,
    select: {first_name:1, last_name: 1}
  }).exec().then((result) => {
    res.json(result)
  })
})

// Create Project
app.post('/project', auth, (req, res) => {
  const {name, manager} = req.body
  proj = new Project({
    name: name,
    manager: manager
  }).save((err, result) => {
    if (!err) {
      res.json({status: 'success', message: 'Project Has Been Added!'})
    }
    else {
        res.json({status: 'fail', message: 'Project Has Not Been Added!'})
    }
  })
})

// Delete Project
app.delete('/project/:id', auth, (req, res) => {
  Project.findByIdAndDelete(req.params.id, (err, result) => {
    if(!err) {
      res.json({status: "success", message: "Project has been removed!"})
  }
  else {
      res.json({status: "fail", message: "Project has fail to be removed!"})
  }
  })
})

// Add Member to Project
app.post('/member', auth, async (req,res) => {
  const {project, member} = req.body

  if(!(project && member)) {
    res.json({status: 'fail', message: 'Please Fill In All The Details'})
  }
  else {
    find = await Project.find({_id:project, member: member}, (err,result) => {
      return result;
    })

    if(find == '' || find == '[]' || find == undefined) {
      Project.findByIdAndUpdate(project, { $push: { member: member } }, (err,result) => {
        if (!err) {
          res.json({status: 'success', message: 'Member Has Been Added!'})
        }
        else {
            res.json({status: 'fail', message: 'Member Has Not Been Added!'})
        }
      })
    } else {
      res.json({status: 'fail', message: 'Member already existed in the project!'})
    }

  }
})

// Delete Member From Project
app.delete('/member/:member/:project', auth, (req, res) => {
  const {project, member} = req.params

  console.log(req.params)
  Project.updateOne({_id: project}, { $pull: {member: member}  }, { safe: true }, (err,result) => {
    if(!err) {
      console.log(result)
      res.json({status: "success", message: "Member has been removed!"})
    }
    else {
      console.log(err)
      res.json({status: "fail", message: "Member has fail to be removed!"})
    }
  })

})

// List Task
app.get('/task', auth, (req, res) => {
  Task.find().populate({
    path: 'project',
    model: Project,
    select: {name:1}
  }).exec().then((result) => {
    res.json(result)
  })
})

// Add Task to Project
app.post('/task', async (req,res) => {
  const {name, detail, project} = req.body
  task = new Task({
    name: name,
    detail: detail,
    project: project
  }).save((err, result) => {
    if (!err) {
      res.json({status: 'success', message: 'Task Has Been Added!'})
    }
    else {
      console.log(err)
        res.json({status: 'fail', message: 'Task Has Not Been Added!'})
    }
  })
})




// This should be the last route else any after it won't work
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

module.exports = app;
