import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import * as Sentry from "@sentry/node";
import { isNil, isNull, head } from "lodash";

import {
  AnyWASocket,
  downloadContentFromMessage,
  extractMessageContent,
  getContentType,
  jidNormalizedUser,
  MediaType,
  MessageUpsertType,
  proto,
  WALegacySocket,
  WAMessage,
  WAMessageUpdate,
  WASocket
} from "@adiwajshing/baileys";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";

import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { debounce } from "../../helpers/Debounce";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import formatBody from "../../helpers/Mustache";
import { Store } from "../../libs/store";
import TicketTraking from "../../models/TicketTraking";
import UserRating from "../../models/UserRating";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import moment from "moment";
import Queue from "../../models/Queue";
import QueueOption from "../../models/QueueOption";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import VerifyCurrentSchedule from "../CompanyService/VerifyCurrentSchedule";
import Campaign from "../../models/Campaign";
import CampaignShipping from "../../models/CampaignShipping";
import { Op } from "sequelize";
import { campaignQueue, parseToMilliseconds, randomValue } from "../../queues";
import User from "../../models/User";
import Setting from "../../models/Setting";

type Session = AnyWASocket & {
  id?: number;
  store?: Store;
};

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

interface IMe {
  name: string;
  id: string;
}

const writeFileAsync = promisify(writeFile);

const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
  return getContentType(msg.message);
};

export const getBodyMessage = (msg: proto.IWebMessageInfo): string | null => {
  return (
    msg.message?.conversation ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.buttonsResponseMessage?.selectedButtonId ||
    msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    msg.message?.templateButtonReplyMessage?.selectedId ||
    msg.message?.buttonsResponseMessage?.selectedButtonId ||
    msg.message?.listResponseMessage?.title
  );
};

export const getQuotedMessage = (msg: proto.IWebMessageInfo): any => {
  const body =
    msg.message.imageMessage.contextInfo ||
    msg.message.videoMessage.contextInfo ||
    msg.message.extendedTextMessage.contextInfo ||
    msg.message.buttonsResponseMessage.contextInfo ||
    msg.message.listResponseMessage.contextInfo ||
    msg.message.templateButtonReplyMessage.contextInfo ||
    msg.message.buttonsResponseMessage?.contextInfo ||
    msg.message.listResponseMessage?.contextInfo;
  // testar isso

  return extractMessageContent(body[Object.keys(body).values().next().value]);
};

export const getQuotedMessageId = (msg: proto.IWebMessageInfo) => {
  const body = extractMessageContent(msg.message)[
    Object.keys(msg?.message).values().next().value
  ];

  return body?.contextInfo?.stanzaId;
};

const getMeSocket = (wbot: Session): IMe => {
  return wbot.type === "legacy"
    ? {
        id: jidNormalizedUser((wbot as WALegacySocket).state.legacy.user.id),
        name: (wbot as WALegacySocket).state.legacy.user.name
      }
    : {
        id: jidNormalizedUser((wbot as WASocket).user.id),
        name: (wbot as WASocket).user.name
      };
};

const getSenderMessage = (
  msg: proto.IWebMessageInfo,
  wbot: Session
): string => {
  const me = getMeSocket(wbot);
  if (msg.key.fromMe) return me.id;

  const senderId =
    msg.participant || msg.key.participant || msg.key.remoteJid || undefined;

  return senderId && jidNormalizedUser(senderId);
};

const getContactMessage = async (msg: proto.IWebMessageInfo, wbot: Session) => {
  if (wbot.type === "legacy") {
    return wbot.store.contacts[msg.key.participant || msg.key.remoteJid] as IMe;
  }

  const isGroup = msg.key.remoteJid.includes("g.us");
  const rawNumber = msg.key.remoteJid.replace(/\D/g, "");
  return isGroup
    ? {
        id: getSenderMessage(msg, wbot),
        name: msg.pushName
      }
    : {
        id: msg.key.remoteJid,
        name: msg.key.fromMe ? rawNumber : msg.pushName
      };
};

const downloadMedia = async (msg: proto.IWebMessageInfo) => {
  const mineType =
    msg.message?.imageMessage ||
    msg.message?.audioMessage ||
    msg.message?.videoMessage ||
    msg.message?.stickerMessage ||
    msg.message?.documentMessage;

  const messageType = mineType.mimetype
    .split("/")[0]
    .replace("application", "document")
    ? (mineType.mimetype
        .split("/")[0]
        .replace("application", "document") as MediaType)
    : (mineType.mimetype.split("/")[0] as MediaType);

  const stream = await downloadContentFromMessage(
    msg.message.audioMessage ||
      msg.message.videoMessage ||
      msg.message.documentMessage ||
      msg.message.imageMessage ||
      msg.message.stickerMessage ||
      msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage,
    messageType
  );

  let buffer = Buffer.from([]);

  // eslint-disable-next-line no-restricted-syntax
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  if (!buffer) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  let filename = msg.message?.documentMessage?.fileName || "";

  if (!filename) {
    const ext = mineType.mimetype.split("/")[1].split(";")[0];
    filename = `${new Date().getTime()}.${ext}`;
  }

  const media = {
    data: buffer,
    mimetype: mineType.mimetype,
    filename
  };

  return media;
};

const verifyContact = async (
  msgContact: IMe,
  wbot: Session,
  companyId: number
): Promise<Contact> => {
  let profilePicUrl: string;
  try {
    profilePicUrl = await wbot.profilePictureUrl(msgContact.id);
  } catch (e) {
    Sentry.captureException(e);
    profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  }

  const contactData = {
    name: msgContact.name || msgContact.id.replace(/\D/g, ""),
    number: msgContact.id,
    profilePicUrl,
    isGroup: msgContact.id.includes("g.us"),
    companyId
  };

  const contact = CreateOrUpdateContactService(contactData);

  return contact;
};

const verifyQuotedMessage = async (
  msg: proto.IWebMessageInfo
): Promise<Message | null> => {
  if (!msg) return null;
  const quoted = getQuotedMessageId(msg);

  if (!quoted) return null;

  const quotedMsg = await Message.findOne({
    where: { id: quoted }
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};

const verifyMediaMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);

  const media = await downloadMedia(msg);

  if (!media) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${new Date().getTime()}.${ext}`;
  }

  try {
    await writeFileAsync(
      join(__dirname, "..", "..", "..", "public", media.filename),
      media.data,
      "base64"
    );
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }

  const body = getBodyMessage(msg);
  const messageData = {
    id: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body: body ? body : media.filename,
    fromMe: msg.key.fromMe,
    read: msg.key.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0],
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg)
  };

  await ticket.update({
    lastMessage: body || media.filename
  });

  const newMessage = await CreateMessageService({
    messageData,
    companyId: ticket.companyId
  });

  if (!msg.key.fromMe && ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" }
      ]
    });

    io.to("closed").emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });

    io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });
  }

  return newMessage;
};

export const verifyMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket
) => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const body = getBodyMessage(msg);

  const messageData = {
    id: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : ticket.contact.id,
    body,
    fromMe: msg.key.fromMe,
    mediaType: getTypeMessage(msg),
    read: msg.key.fromMe,
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg)
  };

  await ticket.update({
    lastMessage: body
  });

  await CreateMessageService({ messageData, companyId: ticket.companyId });

  if (!msg.key.fromMe && ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" }
      ]
    });

    io.to("closed").emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });

    io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });
  }
};

const isValidMsg = (msg: proto.IWebMessageInfo): boolean => {
  if (msg.key.remoteJid === "status@broadcast") return false;
  const msgType = getTypeMessage(msg);
  const ifType =
    msgType === "conversation" ||
    msgType === "extendedTextMessage" ||
    msgType === "audioMessage" ||
    msgType === "videoMessage" ||
    msgType === "imageMessage" ||
    msgType === "documentMessage" ||
    msgType === "stickerMessage";

  return !!ifType;
};

const verifyQueue = async (
  wbot: Session,
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
) => {
  const { queues, greetingMessage } = await ShowWhatsAppService(
    wbot.id!,
    ticket.companyId
  );

  if (queues.length === 1) {
    const firstQueue = head(queues);
    let chatbot = false;
    if (firstQueue?.options) {
      chatbot = firstQueue.options.length > 0;
    }
    await UpdateTicketService({
      ticketData: { queueId: firstQueue?.id, chatbot },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });

    return;
  }

  const selectedOption =
    msg.message?.conversation ||
    (msg.message?.extendedTextMessage?.text as string);

  const choosenQueue = queues[+selectedOption - 1];

  if (choosenQueue) {
    let chatbot = false;
    if (choosenQueue?.options) {
      chatbot = choosenQueue.options.length > 0;
    }
    await UpdateTicketService({
      ticketData: { queueId: choosenQueue.id, chatbot },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });

    if (choosenQueue.options.length == 0) {
      const body = `\u200e${choosenQueue.greetingMessage}`;

      const sentMessage = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: body
        }
      );
      await verifyMessage(sentMessage, ticket);
    }
  } else {
    let options = "";

    queues.forEach((queue, index) => {
      options += `*${index + 1}* - ${queue.name}\n`;
    });

    const body = formatBody(
      `\u200e${greetingMessage}\n${options}`,
      ticket.contact
    );

    const debouncedSentMessage = debounce(
      async () => {
        const sentMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${
            ticket.isGroup ? "g.us" : "s.whatsapp.net"
          }`,
          {
            text: body
          }
        );
        verifyMessage(sentMessage, ticket);
      },
      3000,
      ticket.id
    );

    debouncedSentMessage();
  }
};

const verifyRating = (ticketTraking: TicketTraking) => {
  if (
    ticketTraking &&
    ticketTraking.finishedAt === null &&
    ticketTraking.userId !== null &&
    ticketTraking.ratingAt !== null
  ) {
    return true;
  }
  return false;
};

const handleRating = async (
  msg: WAMessage,
  ticket: Ticket,
  ticketTraking: TicketTraking
) => {
  const io = getIO();
  let rate: number | null = null;

  if (msg.message?.conversation) {
    rate = +msg.message?.conversation;
  }

  if (!Number.isNaN(rate) && Number.isInteger(rate) && !isNull(rate)) {
    const { complationMessage } = await ShowWhatsAppService(
      ticket.whatsappId,
      ticket.companyId
    );

    let finalRate = rate;

    if (rate < 1) {
      finalRate = 1;
    }
    if (rate > 3) {
      finalRate = 3;
    }

    await UserRating.create({
      ticketId: ticketTraking.ticketId,
      companyId: ticketTraking.companyId,
      userId: ticketTraking.userId,
      rate: finalRate
    });

    const body = `\u200e${complationMessage}`;
    await SendWhatsAppMessage({ body, ticket });

    await ticketTraking.update({
      finishedAt: moment().toDate(),
      rated: true
    });

    await ticket.update({
      queueId: null,
      userId: null,
      status: "closed"
    });

    io.to("open").emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });

    io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });
  }
};

const handleChartbot = async (
  ticket: Ticket,
  msg: WAMessage,
  wbot: Session,
  dontReadTheFirstQuestion: boolean = false
) => {
  const queue = await Queue.findByPk(ticket.queueId, {
    include: [
      {
        model: QueueOption,
        as: "options",
        where: { parentId: null },
        order: [
          ["option", "ASC"],
          ["createdAt", "ASC"]
        ]
      }
    ]
  });

  const messageBody = getBodyMessage(msg);

  if (messageBody == "00") {
    // voltar para o menu inicial
    await ticket.update({ queueOptionId: null, chatbot: false, queueId: null });
    await verifyQueue(wbot, msg, ticket, ticket.contact);
    return;
  }

  if (!isNil(queue) && !isNil(ticket.queueOptionId) && messageBody == "#") {
    // falar com atendente
    await ticket.update({ queueOptionId: null, chatbot: false });
    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        text: "\u200eAguarde, você será atendido em instantes."
      }
    );

    verifyMessage(sentMessage, ticket);
    return;
  } else if (
    !isNil(queue) &&
    !isNil(ticket.queueOptionId) &&
    messageBody == "0"
  ) {
    // voltar para o menu anterior
    const option = await QueueOption.findByPk(ticket.queueOptionId);
    await ticket.update({ queueOptionId: option?.parentId });
  } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
    // escolheu uma opção
    const count = await QueueOption.count({
      where: { parentId: ticket.queueOptionId }
    });
    let option: any = {};
    if (count == 1) {
      option = await QueueOption.findOne({
        where: { parentId: ticket.queueOptionId }
      });
    } else {
      option = await QueueOption.findOne({
        where: {
          option: messageBody || "",
          parentId: ticket.queueOptionId
        }
      });
    }
    if (option) {
      await ticket.update({ queueOptionId: option?.id });
    }
  } else if (
    !isNil(queue) &&
    isNil(ticket.queueOptionId) &&
    !dontReadTheFirstQuestion
  ) {
    // não linha a primeira pergunta
    const option = queue?.options.find(o => o.option == messageBody);
    if (option) {
      await ticket.update({ queueOptionId: option?.id });
    }
  }

  await ticket.reload();

  if (!isNil(queue) && isNil(ticket.queueOptionId)) {
    let body = "";
    let options = "";
    const queueOptions = await QueueOption.findAll({
      where: { queueId: ticket.queueId, parentId: null },
      order: [
        ["option", "ASC"],
        ["createdAt", "ASC"]
      ]
    });

    if (queue.greetingMessage) {
      body = `${queue.greetingMessage}\n\n`;
    }

    queueOptions.forEach((option, i) => {
      if (queueOptions.length - 1 > i) {
        options += `*${option.option}* - ${option.title}\n`;
      } else {
        options += `*${option.option}* - ${option.title}`;
      }
    });

    if (options !== "") {
      body += options;
    }

    body += "\n\n*00* - *Menu inicial*";

    const debouncedSentMessage = debounce(
      async () => {
        const sentMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${
            ticket.isGroup ? "g.us" : "s.whatsapp.net"
          }`,
          {
            text: body
          }
        );
        verifyMessage(sentMessage, ticket);
      },
      3000,
      ticket.id
    );

    debouncedSentMessage();
  } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
    const currentOption = await QueueOption.findByPk(ticket.queueOptionId);
    const queueOptions = await QueueOption.findAll({
      where: { parentId: ticket.queueOptionId },
      order: [
        ["option", "ASC"],
        ["createdAt", "ASC"]
      ]
    });
    let body = "";
    let options = "";
    let initialMessage = "";
    let aditionalOptions = "\n";

    if (queueOptions.length > 1) {
      if (!isNil(currentOption?.message) && currentOption?.message !== "") {
        initialMessage = `${currentOption?.message}\n\n`;
        body += initialMessage;
      }

      if (queueOptions.length == 0) {
        aditionalOptions = `*#* - *Falar com o atendente*\n`;
      }

      queueOptions.forEach(option => {
        options += `*${option.option}* - ${option.title}\n`;
      });

      if (options !== "") {
        body += options;
      }

      aditionalOptions += "*0* - *Voltar*\n";
      aditionalOptions += "*00* - *Menu inicial*";

      body += aditionalOptions;
    } else {
      const firstOption = head(queueOptions);
      if (firstOption) {
        body = `${firstOption?.title}`;
        if (firstOption?.message) {
          body += `\n\n${firstOption.message}`;
        }
      } else {
        body = `*#* - *Falar com o atendente*\n\n`;
        body += `*0* - *Voltar*\n`;
        body += `*00* - *Menu inicial*`;
      }
    }

    const debouncedSentMessage = debounce(
      async () => {
        const sentMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${
            ticket.isGroup ? "g.us" : "s.whatsapp.net"
          }`,
          {
            text: body
          }
        );
        verifyMessage(sentMessage, ticket);
      },
      3000,
      ticket.id
    );

    debouncedSentMessage();
  }
};

const handleMessage = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  companyId: number
): Promise<void> => {
  if (!isValidMsg(msg)) {
    return;
  }

  try {
    let msgContact: IMe;
    let groupContact: Contact | undefined;
    const bodyMessage = getBodyMessage(msg);
    const msgType = getTypeMessage(msg);

    const hasMedia =
      msg.message?.audioMessage ||
      msg.message?.imageMessage ||
      msg.message?.videoMessage ||
      msg.message?.documentMessage ||
      msg.message.stickerMessage;

    if (msg.key.fromMe) {
      if (/\u200e/.test(bodyMessage)) return;

      if (
        !hasMedia &&
        msgType !== "conversation" &&
        msgType !== "extendedTextMessage" &&
        msgType !== "vcard"
      )
        return;
      msgContact = await getContactMessage(msg, wbot);
    } else {
      msgContact = await getContactMessage(msg, wbot);
    }

    const isGroup = msg.key.remoteJid?.endsWith("@g.us");

    if (isGroup) {
      const grupoMeta = await wbot.groupMetadata(msg.key.remoteJid, false);
      const msgGroupContact = {
        id: grupoMeta.id,
        name: grupoMeta.subject
      };
      groupContact = await verifyContact(msgGroupContact, wbot, companyId);
    }

    const whatsapp = await ShowWhatsAppService(wbot.id!, companyId);

    const count = wbot.store.chats.get(
      msg.key.remoteJid || msg.key.participant
    );

    const unreadMessages = msg.key.fromMe ? 0 : count?.unreadCount || 1;

    const contact = await verifyContact(msgContact, wbot, companyId);

    if (
      unreadMessages === 0 &&
      whatsapp.farewellMessage &&
      formatBody(whatsapp.farewellMessage, contact) === bodyMessage
    ) {
      return;
    }

    const ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      companyId,
      groupContact
    );

    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      whatsappId: whatsapp?.id
    });

    try {
      if (!msg.key.fromMe) {
        /**
         * Tratamento para avaliação do atendente
         */
        if (ticketTraking !== null && verifyRating(ticketTraking)) {
          handleRating(msg, ticket, ticketTraking);
          return;
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

    if (hasMedia) {
      await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(msg, ticket);
    }

    const currentSchedule = await VerifyCurrentSchedule(companyId);

    const scheduleType = await Setting.findOne({
      where: {
        companyId,
        key: "scheduleType"
      }
    });

    try {
      if (!msg.key.fromMe && scheduleType) {
        /**
         * Tratamento para envio de mensagem quando a empresa está fora do expediente
         */
        if (
          scheduleType.value === "company" &&
          !isNil(currentSchedule) &&
          (!currentSchedule || currentSchedule.inActivity === false)
        ) {
          const body = `${whatsapp.outOfHoursMessage}`;

          const debouncedSentMessage = debounce(
            async () => {
              await wbot.sendMessage(
                `${ticket.contact.number}@${
                  ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  text: body
                }
              );
            },
            3000,
            ticket.id
          );
          debouncedSentMessage();
          return;
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

    const dontReadTheFirstQuestion = ticket.queue === null;

    if (
      !ticket.queue &&
      !isGroup &&
      !msg.key.fromMe &&
      !ticket.userId &&
      whatsapp.queues.length >= 1
    ) {
      await verifyQueue(wbot, msg, ticket, ticket.contact);
    }

    await ticket.reload();

    try {
      if (!msg.key.fromMe && scheduleType && ticket.queueId !== null) {
        /**
         * Tratamento para envio de mensagem quando a fila está fora do expediente
         */
        const queue = await Queue.findByPk(ticket.queueId);

        const { schedules }: any = queue;
        const now = moment();
        const weekday = now.format("dddd").toLowerCase();
        let schedule = null;

        if (Array.isArray(schedules) && schedules.length > 0) {
          schedule = schedules.find(
            s =>
              s.weekdayEn === weekday &&
              s.startTime !== "" &&
              s.startTime !== null &&
              s.endTime !== "" &&
              s.endTime !== null
          );
        }

        if (
          scheduleType.value === "queue" &&
          queue.outOfHoursMessage !== null &&
          queue.outOfHoursMessage !== "" &&
          !isNil(schedule)
        ) {
          const startTime = moment(schedule.startTime, "HH:mm");
          const endTime = moment(schedule.endTime, "HH:mm");

          if (now.isBefore(startTime) || now.isAfter(endTime)) {
            const body = `${queue.outOfHoursMessage}`;
            const debouncedSentMessage = debounce(
              async () => {
                await wbot.sendMessage(
                  `${ticket.contact.number}@${
                    ticket.isGroup ? "g.us" : "s.whatsapp.net"
                  }`,
                  {
                    text: body
                  }
                );
              },
              3000,
              ticket.id
            );
            debouncedSentMessage();
            return;
          }
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

    if (whatsapp.queues.length == 1 && ticket.queue) {
      if (ticket.chatbot && !msg.key.fromMe) {
        await handleChartbot(ticket, msg, wbot);
      }
    }
    if (whatsapp.queues.length > 1 && ticket.queue) {
      if (ticket.chatbot && !msg.key.fromMe) {
        await handleChartbot(ticket, msg, wbot, dontReadTheFirstQuestion);
      }
    }

    if (isNull(ticket.queueId) && ticket.status !== "open" && !msg.key.fromMe) {
      const greetingMessage = whatsapp.greetingMessage || "";
      if (greetingMessage !== "") {
        await wbot.sendMessage(
          `${ticket.contact.number}@${
            ticket.isGroup ? "g.us" : "s.whatsapp.net"
          }`,
          {
            text: greetingMessage
          }
        );
      }
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling whatsapp message: Err: ${err}`);
  }
};

const handleMsgAck = async (
  msg: WAMessage,
  chat: number | null | undefined
) => {
  await new Promise(r => setTimeout(r, 500));
  const io = getIO();

  try {
    const messageToUpdate = await Message.findByPk(msg.key.id, {
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ]
    });

    if (!messageToUpdate) return;
    await messageToUpdate.update({ ack: chat });
    io.to(messageToUpdate.ticketId.toString()).emit(
      `company-${messageToUpdate.companyId}-appMessage`,
      {
        action: "update",
        message: messageToUpdate
      }
    );
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling message ack. Err: ${err}`);
  }
};

const verifyRecentCampaign = async (
  message: proto.IWebMessageInfo,
  companyId: number
) => {
  if (!message.key.fromMe) {
    const number = message.key.remoteJid.replace(/\D/g, "");
    const campaigns = await Campaign.findAll({
      where: { companyId, status: "EM_ANDAMENTO", confirmation: true }
    });
    if (campaigns) {
      const ids = campaigns.map(c => c.id);
      const campaignShipping = await CampaignShipping.findOne({
        where: { campaignId: { [Op.in]: ids }, number, confirmation: null }
      });

      if (campaignShipping) {
        await campaignShipping.update({
          confirmedAt: moment(),
          confirmation: true
        });
        await campaignQueue.add(
          "DispatchCampaign",
          {
            campaignShippingId: campaignShipping.id,
            campaignId: campaignShipping.campaignId
          },
          {
            delay: parseToMilliseconds(randomValue(0, 10))
          }
        );
      }
    }
  }
};

const verifyCampaignMessageAndCloseTicket = async (
  message: proto.IWebMessageInfo,
  companyId: number
) => {
  const io = getIO();
  const body = getBodyMessage(message);
  const isCampaign = /\u200c/.test(body);
  if (message.key.fromMe && isCampaign) {
    const messageRecord = await Message.findOne({
      where: { id: message.key.id!, companyId }
    });
    const ticket = await Ticket.findByPk(messageRecord.ticketId);
    await ticket.update({ status: "closed" });

    io.to("open").emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });

    io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });
  }
};

const wbotMessageListener = (wbot: Session, companyId: number): void => {
  wbot.ev.on("messages.upsert", async (messageUpsert: ImessageUpsert) => {
    if (!messageUpsert.messages) return;

    messageUpsert.messages.forEach(async (message: proto.IWebMessageInfo) => {
      const messageExists = await Message.count({
        where: { id: message.key.id!, companyId }
      });

      if (!messageExists) {
        await handleMessage(message, wbot, companyId);
        await verifyRecentCampaign(message, companyId);
        await verifyCampaignMessageAndCloseTicket(message, companyId);
      }
    });
  });

  wbot.ev.on("messages.update", (messageUpdate: WAMessageUpdate[]) => {
    if (messageUpdate.length === 0) return;
    messageUpdate.forEach(async (message: WAMessageUpdate) => {
      await handleMsgAck(message, message.update.status);
    });
  });
};

export { wbotMessageListener, handleMessage };
