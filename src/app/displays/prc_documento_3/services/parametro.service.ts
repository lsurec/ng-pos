import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ResponseInterface } from 'src/app/interfaces/response.interface';
import { PreferencesService } from 'src/app/services/preferences.service';

@Injectable()
export class ParametroService {
    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar el consumo privado para obtner los parametros disponobles para el usuario
    private _getParametro(
        user: string,
        token: string,
        documento: number,
        serie: string,
        empresa: number,
        estacion: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "empresa": empresa,
                "user": user,
                "tipoDoc": documento,
                "serie": serie,
                "estacion": estacion,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}parametro`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa para obtner los parametros disponobles para el usuario
    getParametro(
        user: string,
        token: string,
        documento: number,
        serie: string,
        empresa: number,
        estacion: number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getParametro(
                user,
                token,
                documento,
                serie,
                empresa,
                estacion,
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