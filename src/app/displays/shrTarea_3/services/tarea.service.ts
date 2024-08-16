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
        return new Promise((resolve, reject) => {
            this._getTareasCalendario().subscribe(
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
        return new Promise((resolve, reject) => {
            this._getTareasUserCalendario(fechaIni, fechaFin).subscribe(
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


    //funcion que va a realizar el consumo en privado.
    private _getTareasFiltro(filtro: string, rangoIni: number, rangoFin: number) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "filtro": filtro,
                "rangoIni": rangoIni,
                "rangoFin": rangoFin,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}tareas/buscar`, { headers: headers });
    }

    // funcion asyncrona con promise

    getTareasFiltro(filtro: string, rangoIni: number, rangoFin: number): Promise<ResApiInterface> {

        // console.log("ini", rangoIni, "fin", rangoFin);

        return new Promise((resolve, reject) => {
            this._getTareasFiltro(filtro, rangoIni, rangoFin).subscribe(
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


    //TODAS LAS TAREAS
    private _getTareasTodas(rangoIni: number, rangoFin: number) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "rangoIni": rangoIni,
                "rangoFin": rangoFin,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}tareas/todas`, { headers: headers });
    }

    // funcion asyncrona con promise

    getTareasTodas(rangoIni: number, rangoFin: number): Promise<ResApiInterface> {

        // console.log("ini", rangoIni, "fin", rangoFin);

        return new Promise((resolve, reject) => {
            this._getTareasTodas(rangoIni, rangoFin).subscribe(
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

    //funcion que va a realizar el consumo en privado.
    //servicio para obtener el top de tareas por rango
    private _getTareasCreadas(rangoIni: number, rangoFin: number) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "rangoIni": rangoIni,
                "rangoFin": rangoFin,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}tareas/creadas`, { headers: headers });
    }

    // funcion asyncrona con promise

    getTareasCreadas(rangoIni: number, rangoFin: number): Promise<ResApiInterface> {

        // console.log("ini", rangoIni, "fin", rangoFin);

        return new Promise((resolve, reject) => {
            this._getTareasCreadas(rangoIni, rangoFin).subscribe(
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

    //asignadas
    private _getTareasAsignadas(rangoIni: number, rangoFin: number) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "rangoIni": rangoIni,
                "rangoFin": rangoFin,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}tareas/asignadas`, { headers: headers });
    }

    // funcion asyncrona con promise

    getTareasAsignadas(rangoIni: number, rangoFin: number): Promise<ResApiInterface> {

        // console.log("ini", rangoIni, "fin", rangoFin);

        return new Promise((resolve, reject) => {
            this._getTareasAsignadas(rangoIni, rangoFin).subscribe(
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

    //invitaciones
    private _getTareasInvitaciones(rangoIni: number, rangoFin: number) {

        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "user": this._user,
                "rangoIni": rangoIni,
                "rangoFin": rangoFin,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}tareas/invitaciones`, { headers: headers });
    }

    // funcion asyncrona con promise

    getTareasInvitaciones(rangoIni: number, rangoFin: number): Promise<ResApiInterface> {

        // console.log("ini", rangoIni, "fin", rangoFin);

        return new Promise((resolve, reject) => {
            this._getTareasInvitaciones(rangoIni, rangoFin).subscribe(
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
        return new Promise((resolve, reject) => {
            this._getComentarios(tarea).subscribe(
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
        return new Promise((resolve, reject) => {
            this._getComentariosObjeto(tareaComentario, tarea).subscribe(
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
        return new Promise((resolve, reject) => {
            this._getTopTareas(topTareas).subscribe(
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

}