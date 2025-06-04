const Task = require("../models/Task")
const User = require("../models/User")
const fs = require("fs")
const path = require("path")

exports.getTasks = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit

    // Build query
    const query = {}

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status
    }

    // Filter by priority
    if (req.query.priority) {
      query.priority = req.query.priority
    }

    // Filter by due date
    if (req.query.dueDate) {
      const date = new Date(req.query.dueDate)
      date.setHours(0, 0, 0, 0)
      const nextDay = new Date(date)
      nextDay.setDate(date.getDate() + 1)

      query.dueDate = {
        $gte: date,
        $lt: nextDay,
      }
    }

    // Filter by assigned user
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo
    }

    // If not admin, only show tasks assigned to or created by the user
    if (req.user.role !== "admin") {
      query.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }]
    }

    // Count total tasks matching query
    const total = await Task.countDocuments(query)

    // Get tasks
    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)

    res.status(200).json({
      success: true,
      count: tasks.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      tasks,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    if (
      req.user.role !== "admin" &&
      task.assignedTo._id.toString() !== req.user.id &&
      task.createdBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this task",
      })
    }

    res.status(200).json({
      success: true,
      data: task,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body

    const user = await User.findById(assignedTo)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Assigned user not found",
      })
    }

    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user.id,
    })

    if (req.files && req.files.length > 0) {
      task.documents = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }))
    }

    await task.save()

    await task.populate("assignedTo", "name email")
    await task.populate("createdBy", "name email")

    res.status(201).json({
      success: true,
      data: task,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    if (req.user.role !== "admin" && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      })
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body

    if (title) task.title = title
    if (description) task.description = description
    if (status) task.status = status
    if (priority) task.priority = priority
    if (dueDate) task.dueDate = dueDate
    if (assignedTo) task.assignedTo = assignedTo

    if (req.files && req.files.length > 0) {
      const newDocuments = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }))

      task.documents = [...task.documents, ...newDocuments]
    }

    await task.save()

    await task.populate("assignedTo", "name email")
    await task.populate("createdBy", "name email")

    res.status(200).json({
      success: true,
      data: task,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    if (req.user.role !== "admin" && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      })
    }

    if (task.documents && task.documents.length > 0) {
      task.documents.forEach((doc) => {
        const filePath = path.join(__dirname, "..", doc.path)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      })
    }

    await task.remove()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

// @desc    Download document
// @route   GET /api/tasks/:id/documents/:documentId
// @access  Private
exports.downloadDocument = async (req, res) => {
  try {
    console.log(`Download request for taskId: ${req.params.id}, documentId: ${req.params.documentId}`)
    
    const task = await Task.findById(req.params.id)

    if (!task) {
      console.log("Task not found")
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    if (
      req.user.role !== "admin" &&
      task.assignedTo.toString() !== req.user.id &&
      task.createdBy.toString() !== req.user.id
    ) {
      console.log("Not authorized to access this task")
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this task",
      })
    }

    const document = task.documents.id(req.params.documentId)
    console.log("Document from DB:", JSON.stringify(document))

    if (!document) {
      console.log("Document not found")
      return res.status(404).json({
        success: false,
        message: "Document not found",
      })
    }

    let filename
    if (document.path && document.path.includes('/')) {
      filename = document.path.split('/').pop()
    } else if (document.path && document.path.includes('\\')) {
      filename = document.path.split('\\').pop()
    } else {
      filename = document.filename
    }

    console.log(`Extracted filename: ${filename}`)

    const possiblePaths = [
      path.resolve(__dirname, "..", document.path),
      path.join(__dirname, "..", document.path),
      path.join(__dirname, "..", "uploads", filename),
      path.resolve(__dirname, "..", "uploads", filename),
      document.path,
      path.join(process.cwd(), document.path),
      path.join(process.cwd(), "backend", "uploads", filename)
    ]

    let filePath = null;
    
    // Find the first path that exists
    for (const potentialPath of possiblePaths) {
      console.log(`Checking path: ${potentialPath}`);
      if (fs.existsSync(potentialPath)) {
        filePath = potentialPath;
        console.log(`Using file path: ${filePath}`);
        break;
      }
    }

    if (!filePath) {
      console.log("File not found in any of the attempted paths");
      return res.status(404).json({
        success: false,
        message: "File not found on server - tried multiple paths"
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.mimetype || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    
    // Read and pipe the file directly to the response
    console.log("Streaming file to client...");
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error reading file stream"
        });
      }
    });
    
    fileStream.pipe(res);
  } catch (err) {
    console.error("Error in downloadDocument:", err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
