const Dialog = require("../models/dialogModel");
const Message = require("./../models/messageModel");

exports.createMessage = async (req, res, next) => {
  const newMessage = await Message.create({
    createdBy: req.body.createdBy,
    text: req.body.text,
    dialogId: req.body.dialogId,
    createdAt: req.body.createdAt,
  });

  const MessageDialog = await Dialog.findById(req.body.dialogId);

  const { user_1, user_2 } = MessageDialog;

  const sendTo = user_1 === req.body.createdBy ? user_2 : user_1;
  res
    .status(201)
    .json({ status: "success", message: { newMessage }, receipent: sendTo });
};

exports.getAllDialogMessages = async (req, res, next) => {
  const count = parseInt(req.params.count);
  const messages = await Message.find({ dialogId: req.params.id });
  res.status(200).json({ messages });
};
