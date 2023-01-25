import * as Sentry from "@sentry/node";

import { AnyWASocket, Contact } from "@adiwajshing/baileys";
import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import { Store } from "../../libs/store";
import createOrUpdateBaileysService from "../BaileysServices/CreateOrUpdateBaileysService";

type Session = AnyWASocket & {
  id?: number;
  store?: Store;
};

interface IContact {
  contacts: Contact[];
}

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  const io = getIO();
  const sessionName = whatsapp.name;

  try {
    wbot.ev.on("contacts.upsert", async (contacts: Contact[]) => {
      createOrUpdateBaileysService({
        whatsappId: whatsapp.id,
        contacts
      });
    });
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};

export default wbotMonitor;
