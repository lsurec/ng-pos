import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';

@Injectable()
export class PagoService {
    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar el consumo privado para obtener las formas de pago
    getFormas(
        token: string,
        empresa: number,
        serie: string,
        documento: number,

    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "empresa": empresa,
                "doc": documento,
                "serie": serie,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Pago/formas`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado para obtener los bancos disponibles en una empresa
    getBancos(
        user: string,
        token: string,
        empresa: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "empresa": empresa,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Pago/bancos`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado para obtner las cuentas bancarias disponibles para un banco 
    getCuentasBanco(
        user: string,
        token: string,
        empresa: number,
        banco: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "empresa": empresa,
                "banco": banco,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Pago/banco/cuentas`, { headers: headers, observe: 'response' });
    }
}