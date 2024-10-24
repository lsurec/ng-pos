import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';

@Injectable()
export class PrintFormatService {


    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }


    //funcion que va a realizar el consumo privado para obtener las empresas
    getReportCotizacion(
        user: string,
        token: string,
        consecutivo: number
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Printer/report/cotizacion/${user}/${consecutivo}`, { headers: headers, observe: 'response' });
    }

}