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

    //funcion que va a realizar el consumo privado para obtener las empresas
    private _getPrinters() {

        //consumo de api
        return this._http.get(`${this._urlBase}printer`, { observe: 'response' });
    }

    //funcion asyncrona con promesa  para obtener las empresas
    getPrinters(user: string, token: string): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getPrinters().subscribe(
                //si esta correcto
                res => {

                    let resApi: ResApiInterface = {
                        status: true,
                        response: res,
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