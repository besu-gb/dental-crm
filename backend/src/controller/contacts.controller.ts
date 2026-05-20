import { Request, Response } from "express";
import { Contact } from "../models/Contact";

export async function getAllContacts(req: Request, res: Response) {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching contacts",
    });
  }
}

export async function getContactById(req: Request, res: Response) {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({
        success: false,
        message: "Contact not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching contact",
    });
  }
}

export async function deleteContactById(req: Request, res: Response) {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      res.status(404).json({
        success: false,
        message: "Contact not found.",
      });

      return;
    }

    res.json({
      success: true,
      message: "Contact deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting contact",
    });
  }
}
