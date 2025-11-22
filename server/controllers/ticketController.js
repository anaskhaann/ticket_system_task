const Ticket = require("../models/Ticket");
const User = require("../models/User");

// @desc    Get tickets
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
  let tickets;
  if (req.user.role === "admin") {
    tickets = await Ticket.find()
      .populate("user", "name email")
      .populate("lastUpdatedBy", "name email")
      .sort({ createdAt: -1 });
  } else {
    tickets = await Ticket.find({ user: req.user._id })
      .populate("lastUpdatedBy", "name email")
      .sort({ createdAt: -1 });
  }
  res.status(200).json(tickets);
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate("user", "name email")
    .populate("lastUpdatedBy", "name email");

  if (!ticket) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }

  if (ticket.user._id.toString() !== req.user.id && req.user.role !== "admin") {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  res.status(200).json(ticket);
};

// @desc    Create new ticket
// @route   POST /api/tickets

// @access  Private
const createTicket = async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!title || !description || !category) {
    res.status(400).json({ message: "Please add all fields" });
    return;
  }

  const attachments = req.files
    ? req.files.map((file) => ({
        filename: file.originalname,
        path: file.path,
      }))
    : [];

  const ticket = await Ticket.create({
    title,
    description,
    category,
    priority: priority || "Medium",
    user: req.user.id,
    status: "Open",
    attachments,
  });

  res.status(201).json(ticket);
};

// Update ticket
// PUT /api/tickets/:id
// Private
const updateTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }

  if (ticket.user.toString() !== req.user.id && req.user.role !== "admin") {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { ...req.body, lastUpdatedBy: req.user.id },
    { new: true }
  )
    .populate("user", "name email")
    .populate("lastUpdatedBy", "name email");

  res.status(200).json(updatedTicket);
};

// Delete ticket
// DELETE /api/tickets/:id
// Private
const deleteTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }

  if (ticket.user.toString() !== req.user.id && req.user.role !== "admin") {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  await ticket.deleteOne();

  res.status(200).json({ id: req.params.id });
};

// Add response to ticket
// POST /api/tickets/:id/responses
// Private
const addResponse = async (req, res) => {
  const { message } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }

  const response = {
    user: req.user.id,
    message,
    createdAt: Date.now(),
  };

  ticket.responses.push(response);
  ticket.lastUpdatedBy = req.user.id;

  await ticket.save();

  res.status(200).json(ticket);
};

module.exports = {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  addResponse,
};
