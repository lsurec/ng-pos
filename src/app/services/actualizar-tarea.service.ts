import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ResponseInterface } from "../interfaces/response.interface";
import { ResApiInterface } from "../interfaces/res-api.interface";
import { PreferencesService } from "./preferences.service";
import { ActualizarEstadoInterface, ActualizarNivelPrioridadInterface } from "../displays/shrTarea_3/interfaces/actualizar-tarea.interface";

@Injectable()

export class ActualizarTareaService {

    private _token: string = "";

    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
        //asignacion de urlBase
        this._token = PreferencesService.token;   //token de la sesion
    }

    //nuevo estado
    private _postNuevoEstado(estado: ActualizarEstadoInterface) {

        let paramsStr = JSON.stringify(estado); //JSON to String

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}tareas/estado/tarea`, paramsStr, { headers: headers });
    }

    //funcion asyncrona con promesa
    postNuevoEstado(estado: ActualizarEstadoInterface): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postNuevoEstado(estado).subscribe(
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

    private _postNuevoNivelPrioridad(prioridad: ActualizarNivelPrioridadInterface) {

        let paramsStr = JSON.stringify(prioridad); //JSON to String

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}tareas/prioridad/tarea`, paramsStr, { headers: headers });
    }

    //funcion asyncrona con promesa
    postNuevoNivelPrioridad(prioridad: ActualizarNivelPrioridadInterface): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postNuevoNivelPrioridad(prioridad).subscribe(
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