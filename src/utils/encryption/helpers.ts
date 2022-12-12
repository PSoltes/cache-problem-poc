export const fromHexString = (hexString: string): Uint8Array => {
  const start = hexString.match(/.{1,2}/g)

  if (!start) {
    return new Uint8Array()
  }

  return Uint8Array.from(start.map((byte) => parseInt(byte, 16)))
}

export const toHexString = (bytes: Uint8Array) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
