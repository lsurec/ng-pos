import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ResApiInterface } from "../interfaces/res-api.interface";
import { CrearTareaInterface } from "../interfaces/crear-tarea.interface";
import { ResponseInterface } from "../interfaces/response.interface";
import { PreferencesService } from "./preferences.service";
import { ComentarInterface } from "../interfaces/comentario.interface";

@Injectable()

export class CrearTareasComentariosService {

    private _token: string = "";
    //urlBase
    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
        //asignacion de urlBase
        this._token = PreferencesService.token;   //token de la sesion
    }

    //nueva tarea
    private _postNuevaTarea(tarea: CrearTareaInterface) {

        let paramsStr = JSON.stringify(tarea); //JSON to String

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}tareas/tarea`, paramsStr, { headers: headers });
    }

    postNuevaTarea(tarea: CrearTareaInterface): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postNuevaTarea(tarea).subscribe(
                // Si la respuesta es correcta
                res => {
                    let response: ResponseInterface = <ResponseInterface>res;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    };
                    resolve(resApi);
                },
                // Si algo sale mal
                err => {
                    console.log(err);

                    try {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: err.error,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        };
                        resolve(resApi);
                    } catch (e) {
                        try {
                            let message = err.message;

                            let resApi: ResApiInterface = {
                                status: false,
                                response: message,
                                url: err.url,
                            };
                            resolve(resApi);
                        } catch (ex) {
                            let resApi: ResApiInterface = {
                                status: false,
                                response: err,
                                url: err.url,
                            };
                            resolve(resApi);
                        }
                    }
                }
            );
        });
    }

    //nuevo comentario
    private _postNuevoComentario(comentario: ComentarInterface) {

        let paramsStr = JSON.stringify(comentario); //JSON to String

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}tareas/comentario`, paramsStr, { headers: headers });
    }

    //funcion asyncrona con promesa
    postNuevoComentario(comentario: ComentarInterface): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postNuevoComentario(comentario).subscribe(
                // Si la respuesta es correcta
                res => {
                    let response: ResponseInterface = <ResponseInterface>res;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    };
                    resolve(resApi);
                },
                // Si algo sale mal
                err => {
                    console.log(err);

                    try {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: response.data,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        };
                        resolve(resApi);
                    } catch (e) {
                        try {
                            let message = err.message;

                            let resApi: ResApiInterface = {
                                status: false,
                                response: message,
                                url: err.url,
                            };
                            resolve(resApi);
                        } catch (ex) {
                            let resApi: ResApiInterface = {
                                status: false,
                                response: err,
                                url: err.url,
                            };
                            resolve(resApi);
                        }
                    }
                }
            );
        });
    }

}