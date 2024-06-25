import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResApiInterface } from '../interfaces/res-api.interface';
import { Injectable } from '@angular/core';
import { ResponseInterface } from '../interfaces/response.interface';
import { PreferencesService } from './preferences.service';

@Injectable()

export class CargarArchivosService {

    private _token: string = "";
    private _user: string = "";

    //urlBase
    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
        //asignacion de urlBase
        this._user = PreferencesService.user; //usuario de la sesion
        this._token = PreferencesService.token;   //token de la sesion
    }

    private _postFiles(files: File[]) {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }
        //configurar headers
        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + this._token,
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}Files`, formData, { headers: headers });
    }

    postFiles(files: File[]): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postFiles(files).subscribe(
                //si esta correcto
                res => {
                    let response: ResponseInterface = <ResponseInterface>res;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {
                    let response: ResponseInterface = <ResponseInterface>err;

                    let resApi: ResApiInterface = {
                        status: false,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                }
            )
        })
    }

    private _postFilesComment(files: File[], tarea: number, tareaComentario: number) {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }
        //configurar headers
        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "tarea": tarea.toString(),
                "tareaComentario": tareaComentario.toString(),
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}Tareas/objetos/comentario`, formData, { headers: headers });
    }

    postFilesComment(files: File[], tarea: number, tareaComentario: number): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postFilesComment(files, tarea, tareaComentario).subscribe(
                //si esta correcto
                res => {
                    let response: ResponseInterface = <ResponseInterface>res;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {
                    let response: ResponseInterface = <ResponseInterface>err;

                    let resApi: ResApiInterface = {
                        status: false,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                }
            )
        })
    }


    //Nuevo servicio
    //TODO: utilizar cuando las Apis estén actualizadas
    private _postFilesCommentN(files: File[], tarea: number, tareaComentario: number, urlCarpeta: string) {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }
        //configurar headers
        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "tarea": tarea.toString(),
                "tareaComentario": tareaComentario.toString(),
                "urlCarpeta": urlCarpeta
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}Tareas/objetos/comentario`, formData, { headers: headers });
    }

    postFilesCommentN(files: File[], tarea: number, tareaComentario: number, urlCarpeta: string): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postFilesCommentN(files, tarea, tareaComentario, urlCarpeta).subscribe(
                //si esta correcto
                res => {
                    let response: ResponseInterface = <ResponseInterface>res;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {
                    let response: ResponseInterface = <ResponseInterface>err;

                    let resApi: ResApiInterface = {
                        status: false,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                }
            )
        })
    }
}
