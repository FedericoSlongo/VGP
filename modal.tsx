/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
import { insertTextIntoChatInputBox } from "@utils/discord";
import {
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalProps,
    ModalRoot,
    openModal,
} from "@utils/modal";
import { Button, ChannelStore, Forms, React, SelectedChannelStore, TextArea, useEffect } from "@webpack/common";

import { encrypt } from "./index";

const localStorageKeysString = "gpgPublicKeys";

function Modal(props: ModalProps) {
    // If the user already entered the public key for the recipient he doesn't have to insert it again...
    const recipientId = ChannelStore.getChannel(SelectedChannelStore.getChannelId()).recipients[0];
    const [pKey, setPKey] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [publicKeyDictChange, setPublicKeyDictChange] = React.useState(false);
    const [publicKeys, setPublicKeys] = React.useState({});

    // Execute this code only one time
    useEffect(() => {
        DataStore.get(localStorageKeysString).then(dataStorageKeys => {
            if (dataStorageKeys != null) {
                const parsedKeys = JSON.parse(dataStorageKeys);
                const updatedKeys = { ...publicKeys, ...parsedKeys };
                setPublicKeys(updatedKeys);

                const recipientKey = updatedKeys[recipientId];
                setPKey(recipientKey);
            }
        });
    }, []);

    return (
        <ModalRoot {...props}>
            <ModalHeader>
                <Forms.FormTitle tag="h4">PGP/GPG Message</Forms.FormTitle>
            </ModalHeader>

            <ModalContent>
                <Forms.FormTitle tag="h5">Message</Forms.FormTitle>
                <TextArea
                    onChange={(e: string) => {
                        setMessage(e);
                    }}
                />

                <Forms.FormTitle tag="h5">Recipient public key</Forms.FormTitle>
                <TextArea
                    value={pKey}
                    onChange={(e: string) => {
                        setPublicKeys({ ...publicKeys, [recipientId]: e });
                        setPublicKeyDictChange(true);
                        setPKey(e);
                    }}
                />
            </ModalContent>
            <ModalFooter>
                <Button
                    color={Button.Colors.GREEN}
                    onClick={() => {
                        if (publicKeyDictChange) {
                            DataStore.set(localStorageKeysString, JSON.stringify(publicKeys));
                        }

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
