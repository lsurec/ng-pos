import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ResponseInterface } from 'src/app/interfaces/response.interface';
import { PreferencesService } from 'src/app/services/preferences.service';

@Injectable()
export class TipoTransaccionService {

    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar el consumo privado
    private _getTipoTransaccion(
        user: string,
        token: string,
        documento: number,
        serie: string,
        empresa: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "empresa": empresa,
                "documento": documento,
                "serie": serie,
                "user": user,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}empresa/${user}`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa
    getTipoTransaccion(
        user: string,
        token: string,
        documento: number,
        serie: string,
        empresa: number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getTipoTransaccion(user,
                token,
                documento,
                serie,
                empresa,
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
                        let response: ResponseInterface = <ResponseInterface>err.body;

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