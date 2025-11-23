const express = require("express");
const router = express.Router();
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  addResponse,
} = require("../controllers/ticketController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../config/multer");

// Tickets routes with max 5 img
router
  .route("/")
  .get(protect, getTickets)
  .post(protect, upload.array("images", 5), createTicket);
router
  .route("/:id")
  .get(protect, getTicket)
  .put(protect, updateTicket)
  .delete(protect, deleteTicket);

router.route("/:id/responses").post(protect, addResponse);

module.exports = router;
