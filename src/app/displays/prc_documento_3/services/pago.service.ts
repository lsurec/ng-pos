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

    //funcion que va a realizar el consumo privado
    private _getFormas(
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

    //funcion asyncrona con promesa
    getFormas(
        token: string,
        empresa: number,
        serie: string,
        documento: number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getFormas(
                token,
                empresa,
                serie,
                documento,
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

                    if (err.status == 400) {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: response.data,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                        return;
                    }

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err,
                        storeProcedure: ""
                    }

                    resolve(resApi);
                }
            )
        }
        )
    }



    //funcion que va a realizar el consumo privado
    private _getBancos(
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

    //funcion asyncrona con promesa
    getBancos(
        user: string,
        token: string,
        empresa: number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getBancos(user, token, empresa).subscribe(
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

                    if (err.status == 400) {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: response.data,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                        return;
                    }

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err,
                        storeProcedure: ""
                    }

                    resolve(resApi);
                }
            )
        }
        )
    }


    //funcion que va a realizar el consumo privado
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

    //funcion asyncrona con promesa
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

                    if (err.status == 400) {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: response.data,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                        return;
                    }

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err,
                        storeProcedure: ""
                    }

                    resolve(resApi);
                }
            )
        }
        )
    }


}