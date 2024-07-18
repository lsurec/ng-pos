import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ResApiInterface } from "../../../interfaces/res-api.interface";
import { ResponseInterface } from "src/app/interfaces/response.interface";
import { PreferencesService } from "src/app/services/preferences.service";

@Injectable()

export class TareaService {

    private _user: string = "";
    private _token: string = "";
    //urlBase
    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
        //asignacion de urlBase
        this._user = PreferencesService.user; //usuario de la sesion
        this._token = PreferencesService.token;   //token de la sesion
    }

    //funcion que va a realizar el consumo en privado.
    private _getTareasCalendario() {
        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
            }
        )
        //consumo de api
        return this._http.get(`${this._urlBase}tareas/calendario/${this._user}`, { headers: headers });
    }

    // funcion asyncrona con promise
    getTareasCalendario(): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getTareasCalendario().subscribe(
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

    //funcion que va a realizar el consumo en privado.
    private _getTareasUserCalendario(fechaIni: string, fechaFin: string) {
        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "fecha_Ini": fechaIni,
                "fecha_Fin": fechaFin,
            }
        )
        //consumo de api
        return this._http.get(`${this._urlBase}tareas/calendario/${this._user}`, { headers: headers });
    }

    // funcion asyncrona con promise
    getTareasUserCalendario(fechaIni: string, fechaFin: string): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getTareasUserCalendario(fechaIni, fechaFin).subscribe(
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

    //funcion que va a realizar el consumo en privado.
    private _getTareasFiltro(filtro: string, opcion: number) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "filtro": filtro,
                "opcion": opcion,

            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}tareas/buscar`, { headers: headers });
    }

    // funcion asyncrona con promise

    getTareasFiltro(filtro: string, opcion: number): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getTareasFiltro(filtro, opcion).subscribe(
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

    //funcion que va a realizar el consumo en privado.
    private _getTareasFiltroAnterior(filtro: string) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "filtro": filtro,
            })

        //consumo de api
        return this._http.get(`${this._urlBase}tareas/buscar`, { headers: headers });
    }

    // funcion asyncrona con promise

    getTareasFiltroAnterior(filtro: string): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getTareasFiltroAnterior(filtro).subscribe(
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

    //funcion que va a realizar el consumo en privado.
    private _getTareasIdReferencia(filtro: string) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "filtro": filtro,
            })

        //consumo de api
        return this._http.get(`${this._urlBase}tareas/buscar/Id/Referencia`, { headers: headers });
    }

    // funcion asyncrona con promise

    getTareasIdReferencia(filtro: string): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getTareasIdReferencia(filtro).subscribe(
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

    private _getComentarios(tarea: number) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "tarea": tarea.toString()
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}tareas/comentarios`, { headers: headers });
    }

    // funcion asyncrona con promise

    getComentarios(tarea: number): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getComentarios(tarea).subscribe(
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

    //funcion que va a realizar el consumo en privado.

    private _getComentariosObjeto(tareaComentario: number, tarea: number) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "tareaComentario": tareaComentario.toString(),
                "tarea": tarea.toString()
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}tareas/comentario/objetos`, { headers: headers });
    }

    // funcion asyncrona con promise

    getComentariosObjeto(tareaComentario: number, tarea: number): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getComentariosObjeto(tareaComentario, tarea).subscribe(
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

    //ultimas tareas relacionadas al usuario
    private _getTopTareas(topTareas: number) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
            }
        )
        //consumo de api
        return this._http.get(`${this._urlBase}Tareas/${this._user}/${topTareas}`, { headers: headers });
    }

    getTopTareas(topTareas: number): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getTopTareas(topTareas).subscribe(
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