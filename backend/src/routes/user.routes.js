import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { successResponse } from "../utils/formatters.js";

const router = Router();

// Retrieve user profile and settings
router.get("/profile", authenticate, (req, res) => {
  return successResponse(
    res,
    {
      user: req.user.toSafeObject(),
      meta: {
        pan: "ABCDE1234F",
        dpId: "IN300124",
        boId: "1208160012345678",
        bankName: "HDFC Bank Ltd",
        bankAccount: "•••• •••• 4892",
        ifsc: "HDFC0001024"
      }
    },
    "User profile retrieved."
  );
});

export default router;
