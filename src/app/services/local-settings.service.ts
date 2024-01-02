import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ResApiInterface } from "../interfaces/res-api.interface";
import { ResponseInterface } from "../interfaces/response.interface";
import { PreferencesService } from "./preferences.service";

@Injectable()

export class LocalSettingsService {

    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar el consumo privado
    private _getEmpresas(user: string, token: string) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}empresa/${user}`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa
    getEmpresas(user: string, token: string): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getEmpresas(user, token,).subscribe(
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

                    if(err.status == 400){
                        let response: ResponseInterface = <ResponseInterface>err.body;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: response.data,
                            storeProcedure: response.storeProcedure,
                            url:err.url,
                        }
                        resolve(resApi);
                        return;
                    }

                    let resApi: ResApiInterface = {
                        status: false,
                        response:err,
                        storeProcedure: ""
                    }

                    resolve(resApi);
                }
            )
        }
        )
    }

    //funcion que va a realizar el consumo privado
    private _getEstaciones(user: string, token: string) {
        //confgurar headers

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )
        //consumo de api
        return this._http.get(`${this._urlBase}estacion/${user}`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa
    getEstaciones(user: string, token: string): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getEstaciones(user, token,).subscribe(
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
                    if(err.status == 400){
                        let response: ResponseInterface = <ResponseInterface>err.body;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: response.data,
                            storeProcedure: response.storeProcedure,
                            url:err.url,
                        }
                        resolve(resApi);
                        return;
                    }

                    let resApi: ResApiInterface = {
                        status: false,
                        response:err,
                        storeProcedure: ""
                    }

                    resolve(resApi);
                }
            )
        })
    }

}