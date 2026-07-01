import CryptoJS from 'crypto-js'

const KEY = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_AES_KEY)
const IV = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_AES_IV)

const OPTS = {
  iv: IV,
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7,
}

export function encryptAES(plain: string | number): string {
  return CryptoJS.AES.encrypt(String(plain), KEY, OPTS).toString()
}

export function decryptAES(cipher: string): string {
  return CryptoJS.AES.decrypt(cipher, KEY, OPTS).toString(CryptoJS.enc.Utf8)
}

export function useCrypto() {
  return { encryptAES, decryptAES }
}
