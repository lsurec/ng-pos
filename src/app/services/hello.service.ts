import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResApiInterface } from '../interfaces/res-api.interface';
import { ResponseInterface } from '../interfaces/response.interface';

@Injectable()
export class HelloService {

  constructor(private http: HttpClient) { }

  private _getHello(apiUrl: string): Observable<HttpResponse<any>> {
    // Realiza una solicitud GET y devuelve la respuesta completa (incluido el código de estado)
    return this.http.get<any>(`${apiUrl}hello`, { observe: 'response' });
  }


  getHello(apiUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._getHello(apiUrl).subscribe(
        (response) => {

          let res: ResApiInterface = {
            response: response.body,
            status: true,
            storeProcedure: "",
          }

          resolve(res);
        },
        (err) => {

          try {
            let response: ResponseInterface = <ResponseInterface>err.error;

            let resApi: ResApiInterface = {
                status: false,
                response: err.error,
                storeProcedure: response.storeProcedure,
                url: err.url,
            }
            resolve(resApi);
        } catch (e) {


            let resApi: ResApiInterface = {
                status: false,
                response: err,
                url: err.url,
            }
            resolve(resApi);
        }

        }
      );

    });

  }

}