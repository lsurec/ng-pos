import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ResponseInterface } from 'src/app/interfaces/response.interface';
import { PreferencesService } from 'src/app/services/preferences.service';

@Injectable()
export class ReferenciaService{
  

    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

  //funcion que va a realizar el consumo privado para obtener las empresas
    getTipoReferencia(user: string, token: string) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Referencia/tipo/${user}`, { headers: headers, observe: 'response' });
    }
}