import config from 'config'

import { fromHexString, toHexString } from './helpers'

const algorithm = 'AES-CTR'

export class Encryption {
  IV_LENGTH = 16

  crypto: Crypto

  encoder: TextEncoder

  decoder: TextDecoder

  constructor(crypto: Crypto, encoder: TextEncoder, decoder: TextDecoder) {
    this.crypto = crypto
    this.encoder = encoder
    this.decoder = decoder
  }

  encrypt = async (text: string) => {
    const iv = this.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH))

    const alg = { name: algorithm, counter: iv, length: this.IV_LENGTH * 4 }
    const encryptKey = await this.crypto.subtle.importKey(
      'raw',
      this.encoder.encode(config.STRING_ENCRYPTION_KEY),
      alg,
      false,
      ['encrypt']
    )

    const encrypted = await this.crypto.subtle.encrypt(
      alg,
      encryptKey,
      this.encoder.encode(text)
    )

    return {
      encryptedText: toHexString(new Uint8Array(encrypted)),
      iv: toHexString(iv),
    }
  }

  decrypt = async (encryptedText: string, iv: string) => {
    const bufferedIV = fromHexString(iv)
    const alg = {
      name: algorithm,
      counter: bufferedIV,
      length: this.IV_LENGTH * 4,
    }
    const decryptKey = await this.crypto.subtle.importKey(
      'raw',
      this.encoder.encode(config.STRING_ENCRYPTION_KEY),
      alg,
      false,
      ['decrypt']
    )

    const decrypted = await this.crypto.subtle.decrypt(
      alg,
      decryptKey,
      fromHexString(encryptedText)
    )

    return this.decoder.decode(decrypted)
  }
}
