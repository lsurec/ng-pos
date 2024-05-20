import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ResApiInterface } from "../../../interfaces/res-api.interface";
import { ResponseInterface } from "src/app/interfaces/response.interface";
import { PreferencesService } from "src/app/services/preferences.service";

@Injectable()

export class TareaCalendarioService {

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
    private _getTareasCalendario(fechaIni: string, fechaFin: string) {
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
    getTareasCalendario(fechaIni: string, fechaFin: string): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getTareasCalendario(fechaIni, fechaFin).subscribe(
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