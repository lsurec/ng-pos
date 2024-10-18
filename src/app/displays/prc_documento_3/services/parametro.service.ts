import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';

@Injectable()
export class ParametroService {
    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar el consumo privado para obtner los parametros disponobles para el usuario
    getParametro(
        user: string,
        token: string,
        documento: number,
        serie: string,
        empresa: number,
        estacion: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "empresa": empresa,
                "user": user,
                "tipoDoc": documento,
                "serie": serie,
                "estacion": estacion,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}parametro`, { headers: headers, observe: 'response' });
    }

}