import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ResponseInterface } from 'src/app/interfaces/response.interface';
import { PreferencesService } from 'src/app/services/preferences.service';

@Injectable()
export class TipoTransaccionService {

    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar el consumo privado para obtner los tipos de transaccion disponibles
    getTipoTransaccion(
        user: string,
        token: string,
        documento: number,
        serie: string,
        empresa: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "empresa": empresa,
                "documento": documento,
                "serie": serie,
                "user": user,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}transaccion/tipo`, { headers: headers, observe: 'response' });
    }


}