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

    //funcion que va a realizar el consumo privado para obtener las empresas
    getEmpresas(
        user: string,
        token: string
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}empresa/${user}`, { headers: headers, observe: 'response' });
    }

   

    //funcion que va a realizar el consumo privado para obtner las estaciones de trabajo
    getEstaciones(user: string, token: string) {
        //confgurar headers

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )
        //consumo de api
        return this._http.get(`${this._urlBase}estacion/${user}`, { headers: headers, observe: 'response' });
    }

}