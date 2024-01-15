import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { urlApi } from "../providers/api.provider";
import { ResApiInterface } from "../interfaces/res-api.interface";
import { ResponseInterface } from "../interfaces/response.interface";
import { PreferencesService } from "./preferences.service";

@Injectable()

export class MenuService {
    //urlBase
    private _urlBase: string = PreferencesService.baseUrl;


    //inicializar http
    constructor(private _http: HttpClient) {

    }

    private _getAplicaciones(user: string, token: string) {
        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + token,
            }
        )
        //consumo de api
        // return this._http.get(`${this._urlBase}aplicaciones/${user}`, { headers: headers });
        return this._http.get(`${this._urlBase}Application/${user}`, { headers: headers });
    }

    // funcion asyncrona con promise
    getAplicaciones(user: string, token: string): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getAplicaciones(user, token,).subscribe(
                //si esta correcto
                res => {
                    let response: ResponseInterface = <ResponseInterface>res;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {
                    let response: ResponseInterface = <ResponseInterface>err.error;

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err.error,
                        storeProcedure: response.storeProcedure,
                        url: err.url,
                    }
                    resolve(resApi);
                }
            )
        })
    }

    private _getDisplays(user: string, token: string, application: number,) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + token,
                "application": application.toString(),
                "user": user,
            }
        )
        //consumo de api
        // return this._http.get(`${this._urlBase}displays/${user}`, { headers: headers });
        return this._http.get(`${this._urlBase}display`, { headers: headers });
    }

    // funcion asyncrona con promise
    getDisplays(user: string, token: string, application: number,): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getDisplays(user, token, application,).subscribe(
                //si esta correcto
                res => {
                    let response: ResponseInterface = <ResponseInterface>res;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {

                    let response: ResponseInterface = <ResponseInterface>err.error;

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err.error,
                        storeProcedure: response.storeProcedure,
                        url: err.url,
                    }
                    resolve(resApi);



                }
            )
        })
    }

}