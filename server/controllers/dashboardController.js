// Ticket model
const Ticket = require("../models/Ticket");

// Get dashboard metrics
// GET /api/dashboard
// Private/Admin
const getDashboardMetrics = async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const totalTickets = await Ticket.countDocuments();
  const openTickets = await Ticket.countDocuments({ status: "Open" });
  const inProgressTickets = await Ticket.countDocuments({
    status: "In Progress",
  });
  const resolvedTickets = await Ticket.countDocuments({ status: "Resolved" });
  const closedTickets = await Ticket.countDocuments({ status: "Closed" });

  // Simple SLA breach logic: if status is not Resolved/Closed and resolutionDate < now
  const now = new Date();
  const breachedTickets = await Ticket.countDocuments({
    status: { $nin: ["Resolved", "Closed"] },
    resolutionDate: { $lt: now },
  });

  // Group by category
  const ticketsByCategory = await Ticket.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    breachedTickets,
    ticketsByCategory,
  });
};

module.exports = { getDashboardMetrics };
