import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptService {

  private secretKey: string = 'demo874894874857.ds4746s'; // Cambia esto por tu clave secreta

  constructor() { }

  encrypt(data: any): string {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
    return encryptedData;
  }

  decrypt(encryptedData: string): any {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  }

}
