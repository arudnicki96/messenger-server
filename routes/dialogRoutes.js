const dialogController = require("./../controllers/dialogController");
const authController = require("./../controllers/authController");
const messageController = require("./../controllers/messageController");
const express = require("express");
const router = express();

router.route("/getUserDialogs/:id").get(dialogController.getUserDialogs);

router.route("/").post(authController.protect, dialogController.createDialog);
router.route("/:id").get(messageController.getAllDialogMessages);
router.route("/messages").post(messageController.createMessage);

module.exports = router;
