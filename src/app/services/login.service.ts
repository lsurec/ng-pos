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
     postLogin(credenciales: UserInterface) {
        //configurar headers
        let paramsStr = JSON.stringify(credenciales); //JSON to String
        let headers = new HttpHeaders({ "Content-Type": "application/json" })
        
        //consumo de api
        return this._http.post(`${this._urlBase}login`, paramsStr, { headers: headers, observe: 'response' });

    }

    
}