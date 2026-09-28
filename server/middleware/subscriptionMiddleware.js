const Subscription = require("../models/Subscription");

const subscriptionMiddleware = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.userId,
      status: "active",
      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: "An active subscription is required",
      });
    }

    req.subscription = subscription;

    next();
  } catch (error) {
    console.error("Subscription middleware request failed.");

    return res.status(500).json({
      success: false,
      message: "Unable to verify subscription status",
    });
  }
};

module.exports = subscriptionMiddleware;

