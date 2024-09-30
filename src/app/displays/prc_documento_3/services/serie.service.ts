import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ResponseInterface } from 'src/app/interfaces/response.interface';
import { PreferencesService } from 'src/app/services/preferences.service';

@Injectable()
export class SerieService {
    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar el consumo privado par aobtener las series disponibles para un documento
    getSerie(
        user: string,
        token: string,
        documento: number,
        empresa: number,
        estacion: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "documento": documento,
                "empresa": empresa,
                "estacion": estacion,
                "user": user,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Serie`, { headers: headers, observe: 'response' });
    }

}