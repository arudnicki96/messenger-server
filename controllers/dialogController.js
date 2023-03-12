const User = require("../models/userModel");
const Dialog = require("../models/dialogModel");
const Message = require("../models/messageModel");

exports.createDialog = async (req, res, next) => {
  const { user_1, user_2, text } = req.body;

  const firstUser = await User.findById(user_1);
  const secondUser = await User.findById(user_2);

  const isAlreadyConversation =
    firstUser.dialogs.filter((item) => item.userId === user_2).length > 0 ||
    secondUser.dialogs.filter((item) => item.userId === user_1).length > 0;

  if (isAlreadyConversation) {
    return res.status(400).json({
      status: "failed",
      message: "Dialog cant be created, cause there is already existing one",
    });
  }

  const newConversation = await Dialog.create({ user_1, user_2 });
  const AddToConversation1st = firstUser.addConversation(
    user_2,
    newConversation._id
  );
  const AddToConversation2nd = secondUser.addConversation(
    user_1,
    newConversation._id
  );

  await firstUser.save({ validateBeforeSave: false });
  await secondUser.save({ validateBeforeSave: false });

  const firstMessage = await Message.create({
    createdBy: user_1,
    dialogId: newConversation._id,
    text: text,
    createdAt: new Date().getTime(),
  });

  res.status(200).json({ dialogue: newConversation });
};

exports.getDialogById = async (req, res, next) => {
  try {
    const dialog = await Dialog.findById(req.params.id);
    res.status(200).json({ dialog });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Dialogue with following id was not found" });
  }
};
exports.getUserDialogs = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const dialogs = user.dialogs;

    const userCurrentConversationItemsData = await Promise.all(
      dialogs.map(async (item) => {
        let user = await User.findById(item.userId, {
          username: 1,
          _id: 1,
        });
        let dialog = await Dialog.findById(item.conversationId, {
          _id: 1,
        });
        let lastMessage = await Message.find({
          dialogId: item.conversationId,
        })
          .sort({ createdAt: -1 })
          .limit(1);

        return { user, dialog, lastMessage: lastMessage[0] };
      })
    );
    userCurrentConversationItemsData.sort(
      (a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt
    );

    return res.status(200).json({
      dialogues: userCurrentConversationItemsData,
    });
  } catch (err) {
    res.status(400).json({ message: "OOPS.SOME TIN WEN WONG" });
  }
};
