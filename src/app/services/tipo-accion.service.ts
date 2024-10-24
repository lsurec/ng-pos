import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PreferencesService } from './preferences.service';

@Injectable()
export class TipoAccionService{
  
    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }
    
    getTipoAccion(
         tipoAccion:number,
     user: string,
     token: string,
    ) {
        //confgurar headers

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )
        //consumo de api
        return this._http.get(`${this._urlBase}Usuarios/accion/${user}/${tipoAccion}`, { headers: headers, observe: 'response' });
    }
}