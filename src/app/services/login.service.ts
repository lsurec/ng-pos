import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserInterface } from "../interfaces/user.interface";
import { ResApiInterface } from "../interfaces/res-api.interface";
import { ResponseInterface } from "../interfaces/response.interface";
import { urlApi } from "../providers/api.provider";
import { PreferencesService } from "./preferences.service";

@Injectable()

export class LoginService {

    //url base
    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar consumo privado
    private _postLogin(credenciales: UserInterface) {
        //configurar headers
        let paramsStr = JSON.stringify(credenciales); //JSON to String
        let headers = new HttpHeaders({ "Content-Type": "application/json" })
        //consumo de api
      return this._http.post(`${this._urlBase}/login`, paramsStr, { headers: headers, observe: 'response' });

    }

    //funcion asyncrona con promise
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