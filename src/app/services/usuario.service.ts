
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ResApiInterface } from "src/app/interfaces/res-api.interface";
import { ResponseInterface } from "src/app/interfaces/response.interface";
import { PreferencesService } from "src/app/services/preferences.service";
import { EnviarResponsableInterface } from "../displays/prcTarea_1/interfaces/responsable.interface";
import { EliminarUsuarioInterface } from "../displays/prcTarea_1/interfaces/eliminar-usuario.interface";
import { EnviarInvitadoInterface } from "../displays/prcTarea_1/interfaces/invitado.interface";


@Injectable()

export class UsuariosService {

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
    private _getUsuariosFiltro(filtro: string) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "filtro": filtro,
            })

        //consumo de api
        return this._http.get(`${this._urlBase}Usuarios`, { headers: headers });
    }

    getUsuariosFiltro(filtro: string): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getUsuariosFiltro(filtro).subscribe(
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


    private _postUsuarioResponsable(usuario: EnviarResponsableInterface) {
        let paramsStr = JSON.stringify(usuario); //JSON to String

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}Tareas/usuario/responsable`, paramsStr, { headers: headers });
    }

    postUsuarioResponsable(usuario: EnviarResponsableInterface): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postUsuarioResponsable(usuario).subscribe(
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
    private _getUsuariosResponsables(tarea: number) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "tarea": tarea.toString(),
            })

        //consumo de api
        return this._http.get(`${this._urlBase}tareas/responsables`, { headers: headers });
    }

    getUsuariosResponsables(tarea: number): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getUsuariosResponsables(tarea).subscribe(
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
    private _postEliminarResponsable(usuario: EliminarUsuarioInterface, consecutivoInterno: number) {
        let paramsStr = JSON.stringify(usuario); //JSON to String

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "consecutivoInterno": consecutivoInterno.toString(),
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}Tareas/eliminar/usuario/responsable`, paramsStr, { headers: headers });
    }

    postEliminarResponsable(usuario: EliminarUsuarioInterface, consecutivoInterno: number): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postEliminarResponsable(usuario, consecutivoInterno).subscribe(
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

    private _postUsuarioInvitado(usuario: EnviarInvitadoInterface) {
        let paramsStr = JSON.stringify(usuario); //JSON to String

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}Tareas/usuario/invitado`, paramsStr, { headers: headers });
    }

    postUsuarioInvitado(usuario: EnviarInvitadoInterface): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postUsuarioInvitado(usuario).subscribe(
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
    private _getUsuariosInvitados(tarea: number) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "tarea": tarea.toString(),
            })

        //consumo de api
        return this._http.get(`${this._urlBase}tareas/invitados`, { headers: headers });
    }

    getUsuariosInvitados(tarea: number): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getUsuariosInvitados(tarea).subscribe(
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
    private _postEliminarInvitado(usuario: EliminarUsuarioInterface, tareaUser: number) {
        let paramsStr = JSON.stringify(usuario); //JSON to String

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "tareaUser": tareaUser.toString(),
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}Tareas/eliminar/usuario/invitado`, paramsStr, { headers: headers });
    }

    postEliminarInvitado(usuario: EliminarUsuarioInterface, tareaUser: number): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postEliminarInvitado(usuario, tareaUser).subscribe(
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