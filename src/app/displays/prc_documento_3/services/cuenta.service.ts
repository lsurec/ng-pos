import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CuentaCorrentistaInterface } from '../interfaces/cuenta-correntista.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ResponseInterface } from 'src/app/interfaces/response.interface';

@Injectable()
export class CuentaService {

    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    getGrupoCuenta(user: string, token: string) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Cuenta/grupo/${user}`, { headers: headers, observe: 'response' });
    }


    //funcion que va a realizar el consumo privado pra crear y/o actulaizar una cuenta correntista
    postCuenta(
        user: string,
        token: string,
        empresa: number,
        cuenta: CuentaCorrentistaInterface,
    ) {
        let paramsStr = JSON.stringify(cuenta); //JSON to String

        //confgurar headers
        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "Content-Type": "application/json",
                "user": user,
                "empresa": empresa,
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}Cuenta`, paramsStr, { headers: headers, observe: 'response' });
    }

    //obtner nombre de una cuenta por idCuenta
    getNombreCuenta(token: string, cuenta: number,) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Cuenta/nombre/${cuenta}`, { headers: headers, observe: 'response' });
    }


    //funcion que va a realizar el consumo privado para buscar una cuenta (cuenta correntista)
    getClient(
        user: string,
        token: string,
        empresa: number,
        filter: string,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "filter": filter,
                "empresa": empresa,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Cuenta`, { headers: headers, observe: 'response' });
    }


    //funcion que va a realizar el consumo privado para obtener cuenta correntista ref
   getSeller(
        user: string,
        token: string,
        doc: number,
        serie: string,
        empresa: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "doc": doc,
                "serie": serie,
                "empresa": empresa,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Cuenta/ref`, { headers: headers, observe: 'response' });
    }


}