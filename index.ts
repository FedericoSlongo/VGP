import { MessageObject } from "@api/MessageEvents";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { definePluginSettings } from "@api/Settings";
import redirectMap from "./redirectMap";
import { twitterMirrors } from "./mirrors";

const settings = definePluginSettings({
  twitterMirror: {
    type: OptionType.SELECT,
    description: "Preferred Twitter/X mirror",
    default: Object.keys(twitterMirrors)[0],
    options: Object.entries(twitterMirrors).map(([domain, name]) => ({
      label: name,
      value: domain
    }))
  }
});

export default definePlugin({
  name: "ReEmbed",
  description: "Converts unsupported embeds to supported embeds and supports differents types of Twitter/X mirrors.",
  authors: [{ name: "The Cat", id: 502494485993881613 }],
  settings,

  onBeforeMessageSend(_, msg) {
    return this.replaceLinks(msg);
  },

  onBeforeMessageEdit(_, __, msg) {
    return this.replaceLinks(msg);
  },

  replaceLinks(msg: MessageObject) {
    if (!msg.content) return;

    const chosen = settings.store.twitterMirror;
    const mirrorDomain = twitterMirrors[chosen];

    msg.content = msg.content.replace(
      /https?:\/\/(?:www\.)?twitter\.com\/([^\s<.,:;"')\]\[|]+)/gi,
      (_match, path) => `https://${chosen}/${path}`
    );

    msg.content = msg.content.replace(
      /https?:\/\/(?:www\.)?([a-zA-Z0-9.-]+)\/([^\s<.,:;"')\]\[|]+)/gi,
      (match, domain, path) => {
        const newDomain = redirectMap[domain.toLowerCase()];
        if (!newDomain) return match;
        return `https://${newDomain}/${path}`;
      }
    );

    return msg;
  }
});
