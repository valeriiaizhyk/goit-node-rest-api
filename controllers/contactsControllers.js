// import contactsService from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";
import { Contact } from "../models/contacts.js";
import user from "../models/user.js";

export const getAllContacts = async (req, res, next) => {
  console.log({ user: req.user });
  try {
    const contacts = await Contact.find({ owner: req.user.id });
    return res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  const { id } = req.params;
  try {
    const contact = await Contact.findOne({ _id: id, owner: req.user.id });
    if (contact === null) {
      return res.status(404).send({ message: "Contact not found" });
    }
    res.status(200).send(contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removedContact = await Contact.findByIdAndDelete(id);
    if (removedContact.id === id) {
      res.status(200).send(removedContact);
    }
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  const createContact = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    owner: req.body.id,
  };

  try {
    const newContact = await Contact.create(createContact);
    return res.status(201).send(newContact);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };

  const { id } = req.params;
  if (!data.name && !data.email && !data.phone) {
    return res
      .status(400)
      .json({ message: "Body must have at least one field" });
  }

  const userData = updateContactSchema.validate(data);
  if (userData.error) {
    return res.status(400).json({ message: userData.error.message });
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedContact) {
      throw HttpError(404);
    }
    return res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

export const updateFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedContact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedContact) {
      throw HttpError(404);
    }
    return res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};
