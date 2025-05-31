import { isoBase64URL } from "@simplewebauthn/server/helpers";

// Convert ArrayBuffer to base64url
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Convert base64url to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Prepare options for navigator.credentials.create() or get()
export function preparePublicKeyOptions(options: any): any {
  const challenge = base64ToArrayBuffer(options.challenge);

  if (options.user) {
    return {
      ...options,
      challenge,
      user: {
        ...options.user,
        id: base64ToArrayBuffer(options.user.id),
      },
      excludeCredentials: options.excludeCredentials?.map((cred: any) => ({
        ...cred,
        id: base64ToArrayBuffer(cred.id),
      })),
    };
  }

  return {
    ...options,
    challenge,
    allowCredentials: options.allowCredentials?.map((cred: any) => ({
      ...cred,
      id: base64ToArrayBuffer(cred.id),
    })),
  };
}

// Prepare credential to send to server
export function prepareCredentialForServer(credential: any): any {
  if (!credential) throw new Error("No credential provided");

  const { id, rawId, response, type } = credential;

  if (!id || !rawId) throw new Error("Missing credential id/rawId");

  const base64urlEncode = (ab: ArrayBuffer) =>
    isoBase64URL.fromBuffer(Buffer.from(new Uint8Array(ab)));

  // Registration
  if ("attestationObject" in response) {
    return {
      id,
      rawId: base64urlEncode(rawId),
      type,
      response: {
        attestationObject: base64urlEncode(response.attestationObject),
        clientDataJSON: base64urlEncode(response.clientDataJSON),
      },
    };
  }

  // Authentication
  return {
    id,
    rawId: base64urlEncode(rawId),
    type,
    response: {
      authenticatorData: base64urlEncode(response.authenticatorData),
      clientDataJSON: base64urlEncode(response.clientDataJSON),
      signature: base64urlEncode(response.signature),
      userHandle: response.userHandle
        ? base64urlEncode(response.userHandle)
        : null,
    },
  };
}

// Check for browser WebAuthn support
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential === "function"
  );
}
