import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ResponseInterface } from 'src/app/interfaces/response.interface';
import { PreferencesService } from 'src/app/services/preferences.service';

@Injectable()
export class PagoService {
    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar el consumo privado para obtener las formas de pago
    getFormas(
        token: string,
        empresa: number,
        serie: string,
        documento: number,

    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "empresa": empresa,
                "doc": documento,
                "serie": serie,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Pago/formas`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado para obtener los bancos disponibles en una empresa
    getBancos(
        user: string,
        token: string,
        empresa: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "empresa": empresa,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Pago/bancos`, { headers: headers, observe: 'response' });
    }

   


    //funcion que va a realizar el consumo privado para obtner las cuentas bancarias disponibles para un banco 
    private _getCuentasBanco(
        user: string,
        token: string,
        empresa: number,
        banco: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "empresa": empresa,
                "banco": banco,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Pago/banco/cuentas`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa para obtner las cuentas bancarias disponibles para un banco 
    getCuentasBanco(
        user: string,
        token: string,
        empresa: number,
        banco: number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getCuentasBanco(
                user,
                token,
                empresa,
                banco,
            ).subscribe(
                //si esta correcto
                res => {
                    let response: ResponseInterface = <ResponseInterface>res.body;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {
                    try {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: err.error,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                    } catch (e) {


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
                }
            )
        }
        )
    }


}