import contactUsService from "./contactus.service.js";
import { getLanguage, translate, getFieldName } from "#utils/localization.js";

const submitContactUsForm = async (req, res, next) => {
  try {
    const result = await contactUsService.sendContactUsEmail(req.body);

    if (result) {
      res
        .status(200)
        .json({ message: "Your message has been sent successfully!" });
    } else {
      const error = new Error(translate("CONTACT_US_ERROR", getLanguage(req)));
      error.code = "CONTACT_US_ERROR";
      error.status = 500;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export default {
  submitContactUsForm,
};
