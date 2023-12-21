import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class HelloService{

    constructor(private http: HttpClient) {}
  
    private _getHello(apiUrl:string): Observable<HttpResponse<any>> {
      // Realiza una solicitud GET y devuelve la respuesta completa (incluido el código de estado)
      return this.http.get<any>(apiUrl, { observe: 'response' });
    }


    getHello(apiUrl:string){
        this._getHello(apiUrl).subscribe(
            (response) => {
              console.log('Datos:', response.body);
              console.log('Código de estado:', response.status);
            },
            (error) => {
              console.error('Error al obtener datos:', error.status);
            }
          );
    }

}