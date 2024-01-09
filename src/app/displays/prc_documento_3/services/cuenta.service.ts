// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { PreferencesService } from 'src/app/services/preferences.service';

// @Injectable()
// export class CuentaService{
  

//     private _urlBase: string = PreferencesService.baseUrl;

//     //inicializar http
//     constructor(private _http: HttpClient) {
//     }
    
//     //funcion que va a realizar el consumo privado
//     private _postCuenta(
//         user: string, 
//         token: string, 
//         empresa:number,
//         ) {
//         //confgurar headers

//         let headers = new HttpHeaders(
//             {
//                 "Authorization": "bearer " + token,
//             }
//         )
//         //consumo de api
//         return this._http.get(`${this._urlBase}estacion/${user}`, { headers: headers, observe: 'response' });
//     }

//     //funcion asyncrona con promesa
//     postCeuenta(user: string, token: string): Promise<ResApiInterface> {
//         return new Promise((resolve, reject) => {
//             this._postCuenta(user, token,).subscribe(
//                 //si esta correcto
//                 res => {
//                     let response: ResponseInterface = <ResponseInterface>res.body;

//                     let resApi: ResApiInterface = {
//                         status: true,
//                         response: response.data,
//                         storeProcedure: response.storeProcedure
//                     }
//                     resolve(resApi);
//                 },
//                 //si algo sale mal
//                 err => {
//                     if(err.status == 400){
//                         let response: ResponseInterface = <ResponseInterface>err.body;

//                         let resApi: ResApiInterface = {
//                             status: false,
//                             response: response.data,
//                             storeProcedure: response.storeProcedure,
//                             url:err.url,
//                         }
//                         resolve(resApi);
//                         return;
//                     }

//                     let resApi: ResApiInterface = {
//                         status: false,
//                         response:err,
//                         storeProcedure: ""
//                     }

//                     resolve(resApi);
//                 }
//             )
//         })
//     }
// }