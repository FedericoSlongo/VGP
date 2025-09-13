/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChatBarButton, ChatBarButtonFactory } from "@api/ChatButtons";
import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

import { buildModal } from "./modal";
import * as openpgp from "./openpgp.mjs";

const ChatBarIcon: ChatBarButtonFactory = ({ isMainChat }) => {
    if (!isMainChat) return null;

    return (
        <ChatBarButton
            tooltip="PGP/GPG Encrypt"
            onClick={() => buildModal()}

            buttonProps={{
                "aria-haspopup": "dialog",
            }}
        >
            <svg version="1.1"
                id="Capa_1"
                width="20"
                height="20"
                viewBox="0 0 47 47"
            >
                <g>
                    <path fill="currentColor" d="M123.5,0C10.522,0,0,10.522,0,23.5C0,36.479,10.522,47,23.5,47C36.479,47,47,36.479,47,23.5C47,10.522,36.479,0,23.5,0z
                    M30.07,34.686L30.07,34.686c0,2.53-2.941,4.58-6.573,4.58c-3.631,0-6.577-2.05-6.577-4.58c0-0.494,3.648-14.979,3.648-14.979
                    c-2.024-1.06-3.418-3.161-3.418-5.609c0-3.515,2.838-6.362,6.361-6.362c3.514,0,6.35,2.848,6.35,6.362
                    c0,2.448-1.391,4.55-3.416,5.609c0,0,3.598,14.455,3.611,14.88l0.022,0.099H30.07z"/>
                </g>
            </svg>
        </ChatBarButton>
    );
};

function formatKey(key: string): string {
    const start: string = key.match(/-----.*?-----/g)?.at(0)?.toString()!;
    const end: string = key.match(/-----.*?-----/g)?.pop()?.toString()!;

    return start + key.replace(start, "").replace(end, "").replaceAll(" ", "\n") + end;
}

// ./openpgpjs-6.2.2/
export async function encrypt(message: string, public_key_recipient: string): Promise<string> {
    const { encrypt, readKey } = openpgp;
    const private_key = await openpgp.readPrivateKey({ armoredKey: formatKey(settings.store.pgpPrivateKey) });
    const public_key = await readKey({ armoredKey: formatKey(settings.store.pgpPublicKey) });


    const pubKey_r = await readKey({ armoredKey: public_key_recipient });

    const encrypted = await encrypt({
        message: await openpgp.createMessage({ text: message }),
        encryptionKeys: [pubKey_r, public_key],
        signingKeys: [private_key]
    });

    return encrypted;
}


const settings = definePluginSettings({
    pgpPrivateKey: {
        type: OptionType.STRING,
        description: "Private PGP/GPG key",
        default: "",
    },
    pgpPublicKey: {
        type: OptionType.STRING,
        description: "Public PGP/GPG key",
        default: "",
    }
});

export default definePlugin({
    name: "VGP",
    description: "Vencord Pgp",
    authors: [{ name: "The Cat", id: 502494485993881613n }, { name: "Nikicoraz", id: 209289029936611328n }],
    settings,

    renderChatBarButton: ChatBarIcon,

});
