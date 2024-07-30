const Notification = require("../models/Notification");


const socketConnection = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on("checkout", async (data) => {
      try {
        console.log(`User with userId: ${data.userId} has placed an order`);

        // Assuming Notification model is properly imported
        const notification = new Notification({
          message: `User with userId: ${data.userId} has placed an order`,
        });
        await notification.save();

        io.emit("orderPlaced", { message: notification.message });
      } catch (error) {
        console.error("Error saving notification:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

const getInitialNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });

    const allNotifications = notifications;
    const activeNotifications = notifications.filter(notification => notification.status === "active");
    const inactiveNotifications = notifications.filter(notification => !notification.status !== "active");
    const paymentCompletedNotifications = notifications.filter(notification => notification.paymentStatus === "completed");
    const paymentPendingNotifications = notifications.filter(notification => notification.paymentStatus === "pending");
    const paymentCompletedActiveNotifications = activeNotifications.filter(notification => notification.paymentStatus === "completed");
    const paymentCompletedInactiveNotifications = inactiveNotifications.filter(notification => notification.paymentStatus === "completed");
    const paymentPendingActiveNotifications = activeNotifications.filter(notification => notification.paymentStatus === "pending");
    const paymentPendingInactiveNotifications = inactiveNotifications.filter(notification => notification.paymentStatus === "pending");

    res.json({
      allNotifications,
      activeNotifications,
      inactiveNotifications,
      paymentCompletedNotifications,
      paymentPendingNotifications,
      paymentCompletedActiveNotifications,
      paymentCompletedInactiveNotifications,
      paymentPendingActiveNotifications,
      paymentPendingInactiveNotifications,
    });
  } catch (error) {
    console.error("Error fetching initial notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const updateNotificationStatus = async (req, res) => {
  try {
    const notifications = await Notification.findById(req.params.id);
    if (!notifications) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    notifications.status =
      notifications.status === "active" ? "inactive" : "active";

    await notifications.save();

    res.status(200).json({
      success: true,
      message: "Notification status updated successfully",
      data: notifications,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

module.exports = {
  getInitialNotifications,
  updateNotificationStatus,
  socketConnection,
};
