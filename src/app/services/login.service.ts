import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserInterface } from "../interfaces/user.interface";
import { ResApiInterface } from "../interfaces/res-api.interface";
import { ResponseInterface } from "../interfaces/response.interface";
import { PreferencesService } from "./preferences.service";

@Injectable()

export class LoginService {

    //url base
    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar consumo privado para validar lascredenciales dl usuario y obtner un token de acceso
    private _postLogin(credenciales: UserInterface) {
        //configurar headers
        let paramsStr = JSON.stringify(credenciales); //JSON to String
        let headers = new HttpHeaders({ "Content-Type": "application/json" })
        //consumo de api
      return this._http.post(`${this._urlBase}login`, paramsStr, { headers: headers, observe: 'response' });

    }

    //funcion asyncrona con promise para validar lascredenciales dl usuario y obtner un token de acceso
    postLogin(credenciales: UserInterface): Promise<ResApiInterface> {
        //consumo primer servicio
        return new Promise((resolve, reject) => {
            this._postLogin(credenciales).subscribe(
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
        })
    }
}