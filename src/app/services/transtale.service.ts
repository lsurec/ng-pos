import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { ResponseInterface } from '../interfaces/response.interface';
import { ResApiInterface } from '../interfaces/res-api.interface';

@Injectable({
    providedIn: 'root'
})
export class TraducirService {
    // private _urlBase: string = '';
    private _urlBase: string = 'https://translation.googleapis.com/language/translate/v2';

    private _apiKey = 'TU_CLAVE_DE_API'; // Reemplaza esto con tu clave de API real

    constructor(private _http: HttpClient,
    ) {
    }


    translate(text: string): Observable<any> {
        const headers: HttpHeaders = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const body = {
            q: text,
            target: "en",
            key: this._apiKey
        };

        return this._http.post(this._urlBase, body, { headers: headers });
    }


    // private _translate(text: string, lang: string): Observable<any> {
    //     const headers: HttpHeaders = new HttpHeaders({
    //         "Content-Type": "application/json",
    //     });

    //     const body = {
    //         q: text,
    //         source: "auto",
    //         target: lang,
    //         format: "text",
    //         api_key: "" // Recuerda agregar tu API key aquí si es necesario
    //     };

    //     return this._http.post(this._urlBase, body, { headers: headers });
    // }


    // translate(text: string, lang: string): Promise<ResApiInterface> {
    //     //consumo del primer servicio
    //     return new Promise((resolve, reject) => {
    //         this._translate(text, lang,).subscribe(
    //             //si esta correcto
    //             res => {
    //                 let response: ResponseInterface = <ResponseInterface>res;

    //                 let resApi: ResApiInterface = {
    //                     status: true,
    //                     response: response.data,
    //                     storeProcedure: response.storeProcedure
    //                 }
    //                 resolve(resApi);
    //             },
    //             //si algo sale mal
    //             err => {
    //                 let response: ResponseInterface = <ResponseInterface>err;

    //                 let resApi: ResApiInterface = {
    //                     status: false,
    //                     response: response.data,
    //                     storeProcedure: response.storeProcedure
    //                 }
    //                 resolve(resApi);
    //             }
    //         )
    //     })
    // }
}
