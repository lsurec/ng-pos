import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResApiInterface } from '../interfaces/res-api.interface';

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
        (error) => {

          let res: ResApiInterface = {
            response: error,
            status: false,
            storeProcedure: "",
          }
          resolve(res);

        }
      );

    });

  }

}