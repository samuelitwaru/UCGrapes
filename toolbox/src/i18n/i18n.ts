import { I18n } from "i18n-js";

export const i18n = new I18n({
    en: {
      hello: "Hi!",
      inbox: {
        zero: "You have no messages",
        one: "You have one message",
        other: "You have %{count} messages",
      },
    },
  
    nl: {
      hello: "Ola!",
      inbox: {
        zero: "Você não tem mensagens",
        one: "Você tem uma mensagem",
        other: "Você tem %{count} mensagens",
      },
    },
  });