import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { urlApi } from "../providers/api.provider";
import { UserService } from "./user.service";
import { ResApiInterface } from "../interfaces/res-api.interface";
import { ResponseInterface } from "../interfaces/response.interface";

@Injectable()

export class MenuService {
    //urlBase
    private _urlBase: string = "";
    private _token: string = "";
    private _user: string = "";

    //inicializar http
    constructor(private _http: HttpClient) {
        //asignacion de urlBase
        this._urlBase = urlApi.apiServer.urlBase;
        this._token = UserService.getToken();
        this._user = UserService.getUser();
    }

    private _getAplicaciones() {
        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
            }
        )
        //consumo de api
        // return this._http.get(`${this._urlBase}aplicaciones/${this._user}`, { headers: headers });
        return this._http.get(`${this._urlBase}aplicaciones/${this._user}`, { headers: headers });
    }

    // funcion asyncrona con promise
    getAplicaciones(): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getAplicaciones().subscribe(
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
                    let response: ResponseInterface = <ResponseInterface>err;

                    let resApi: ResApiInterface = {
                        status: false,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                }
            )
        })
    }

    private _getDisplays(application: number) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "app": application.toString(),
                "user": this._user,
            }
        )
        //consumo de api
        // return this._http.get(`${this._urlBase}displays/${this._user}`, { headers: headers });
        return this._http.get(`${this._urlBase}displays`, { headers: headers });
    }

    // funcion asyncrona con promise
    getDisplays(application: number): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getDisplays(application).subscribe(
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
                    let response: ResponseInterface = <ResponseInterface>err;

                    let resApi: ResApiInterface = {
                        status: false,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                }
            )
        })
    }

}