const Template = require("../models/Template");
const User = require("../models/User");

module.exports = {
  cardsDashboard: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      const template = await Template.find({userId: req.user.id});

         if (!user) {
        return res.status(404).json({
          hasError: true,
          msg: ["User not found"],
          data: null,
        });
      }

         if (!template) {
        return res.status(404).json({
          hasError: true,
          msg: ["Template not found"],
          data: null,
        });
      }

      const cards = [
        {
            title: 'Domains',
            count: user.domains
        },
        {
            title: 'Emails',
            count: user.emails
        },
        {
            title: 'Templates',
            count: template.length
        },
        {
            title: 'Sends',
            count: user.sendEmails
        }
    ]
      res.status(200).json({
        hasError: false,
        msg: ["cards fetched successfully"],
        data: cards,
      });
    } catch (error) {
      next(error);
    }
  }
};