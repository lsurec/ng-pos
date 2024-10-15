import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
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

    //obtner las aplicaciones asignadas a un uusaior
    getAplicaciones(user: string, token: string) {
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

    

    //Obtner los displays de una aplicacion asignadas a un usuairo
    getDisplays(user: string, token: string, application: number,) {

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

    
}