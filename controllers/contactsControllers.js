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
    if (!contact) {
      throw HttpError(404);
    }
    res.status(200).send(contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  const { id } = req.params;
  try {
    const removedContact = await Contact.findOneAndDelete({
      _id: id,
      owner: req.user.id,
    });
    if (!removedContact) {
      throw HttpError(404);
    }
    res.status(200).send(removedContact);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  const { name, email, phone } = req.body;

  try {
    const newContact = await Contact.create({
      name,
      email,
      phone,
      owner: req.user.id,
    });
    return res.status(201).send(newContact);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  const { id } = req.params;
  const updateFields = req.body;

  if (!updateFields.name && !updateFields.email && !updateFields.phone) {
    throw HttpError(404);
  }

  const userData = updateContactSchema.validate(updateFields);
  if (userData.error) {
    throw HttpError(404);
  }

  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      updateFields,
      { new: true }
    );

    if (!updatedContact) {
      throw HttpError(404);
    }
    return res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

export const updateFavorite = async (req, res, next) => {
  const { id } = req.params;

  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      req.body,
      { new: true }
    );

    if (!updatedContact) {
      throw HttpError(404);
    }
    return res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};
