import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";

type HeaderParams = {
  x_token: string;
};

const tokenAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { x_token: token } = req.headers as HeaderParams;
    const whatsapp = await Whatsapp.findOne({ where: { token } });
    if (whatsapp) {
      req.params = {
        whatsappId: whatsapp.id.toString()
      }
    } else {
      throw new Error();
    }
  } catch (err) {
    throw new AppError(
      "Acesso não permitido",
      401
    );
  }

  return next();
};

export default tokenAuth;
