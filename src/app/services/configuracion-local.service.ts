import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { urlApi } from "../providers/api.provider";
import { UserService } from "./user.service";
import { ResApiInterface } from "../interfaces/res-api.interface";
import { ResponseInterface } from "../interfaces/response.interface";

@Injectable()

export class ConfiguracionLocalService {

    private _urlBase: string = "";
    private _token: string = "";
    private _user: string = "";

    //inicializar http
    constructor(private _http: HttpClient) {
        //asignacion de urlBase
        this._urlBase = urlApi.apiServer.urlBase;
        // this._token = UserService.getToken();
    }

    //funcion que va a realizar el consumo privado
    private _getEmpresas() {
        //confgurar headers
        this._token = UserService.getToken();
        this._user = UserService.getUser();

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + this._token,
            }
        )
        //consumo de api
        return this._http.get(`${this._urlBase}empresa/${this._user}`, { headers: headers });
    }

    //funcion asyncrona con promesa
    getEmpresas(): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getEmpresas().subscribe(
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
        }
        )
    }

    //funcion que va a realizar el consumo privado
    private _getEstaciones() {
        //confgurar headers
        this._token = UserService.getToken();
        this._user = UserService.getUser();

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + this._token,
            }
        )
        //consumo de api
        return this._http.get(`${this._urlBase}estacion/${this._user}`, { headers: headers });
    }

    //funcion asyncrona con promesa
    getEstaciones(): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getEstaciones().subscribe(
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