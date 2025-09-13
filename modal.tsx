/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { insertTextIntoChatInputBox } from "@utils/discord";
import {
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalProps,
    ModalRoot,
    openModal,
} from "@utils/modal";
import { Button, Forms, React, TextArea, TextInput } from "@webpack/common";

import { encrypt } from "./index";

function Modal(props: ModalProps) {
    // TODO: Nell'initial state della chiave mettiamo il valore che leggiamo da file di testo
    const [pKey, setPKey] = React.useState("");
    const [message, setMessage] = React.useState("");

    return (
        <ModalRoot {...props}>
            <ModalHeader>
                <Forms.FormTitle tag="h4">PGP/GPG Message</Forms.FormTitle>
            </ModalHeader>

            <ModalContent>
                <Forms.FormTitle tag="h5">Message</Forms.FormTitle>
                <TextInput
                    onChange={(e: string) => {
                        setMessage(e);
                    }}
                />

                <Forms.FormTitle tag="h5">Recipient public key</Forms.FormTitle>
                <TextArea
                    defaultValue={pKey}
                    onChange={(e: string) => {
                        setPKey(e);
                    }}
                />
            </ModalContent>
            <ModalFooter>
                <Button
                    color={Button.Colors.GREEN}
                    onClick={() => {
                        encrypt(message, pKey).then(encryptedMessage => {
                            insertTextIntoChatInputBox(encryptedMessage);
                            props.onClose();
                        });
                    }}
                >
                    Send
                </Button>
            </ModalFooter>
        </ModalRoot>
    );
}

export function buildModal(): any {
    openModal(props => <Modal {...props} />);
}
