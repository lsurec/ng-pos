import { Injectable } from '@angular/core';
import { urlApi } from '../providers/api.provider';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResApiInterface } from '../interfaces/res-api.interface';

@Injectable()
export class PrinterService {

    private _urlBase: string = urlApi.apiServer.urlPrint;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    private _postPrint(
        file: File,
        printer: string,
        copies: number,
    ) {
        const formData = new FormData();
        formData.append('files', file);
        //configurar headers
        let headers = new HttpHeaders(
            {
                "printerName": printer,
                "copies": copies,
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}Printer`, formData, { headers: headers, observe: 'response' });
    }

    postPrint(
        file: File,
        printer: string,
        copies: number,): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postPrint(
                file,
                printer,
                copies,
            ).subscribe(
                //si esta correcto
                res => {

                    let resApi: ResApiInterface = {
                        status: true,
                        response: res.body,
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {
                    try {
                        let message = err.message;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: message,
                            url: err.url,
                        }
                        resolve(resApi);

                    } catch (ex) {
                        let resApi: ResApiInterface = {
                            status: false,
                            response: err,
                            url: err.url,
                        }
                        resolve(resApi);
                    }
                }
            )
        })
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    private _getPrinters() {

        //consumo de api
        return this._http.get(`${this._urlBase}printer`, { observe: 'response' });
    }

    //funcion asyncrona con promesa  para obtener las empresas
    getPrinters(): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getPrinters().subscribe(
                //si esta correcto
                res => {

                    let resApi: ResApiInterface = {
                        status: true,
                        response: res.body,
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {
                    try {
                        let message = err.message;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: message,
                            url: err.url,
                        }
                        resolve(resApi);

                    } catch (ex) {
                        let resApi: ResApiInterface = {
                            status: false,
                            response: err,
                            url: err.url,
                        }
                        resolve(resApi);
                    }
                }
            )
        }
        )
    }

}