import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';

@Injectable()
export class RestaurantService {

    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    // función que va a realizar el consumo privado para obtener las empresas
    getLocations(
        typeDoc: number,
        enterprise: number,
        station: number,
        series: string,
        user: string,
        token: string,

    ) {
        const headers = new HttpHeaders({
            "Authorization": "bearer " + token,
            "typeDoc": typeDoc,
            "enterprise": enterprise,
            "station": station,
            "series": series,
            "user": user,
        });

        // consumo de api
        return this._http.get(`${this._urlBase}Restaurant/locations`, { headers: headers, observe: 'response' });
    }

}