import { Injectable, Input } from "@angular/core";

@Injectable()
export class PreferencesService {

    @Input()
    static set lang(value: string) {
        localStorage.setItem("language", value);
    }

    static get lang(): string {
        let language = localStorage.getItem("language");
        if (!language) return "";
        return language;
    }

    @Input()
    static set token(value: string) {
        localStorage.setItem("token", value);
    }

    static get token(): string {
        let language = localStorage.getItem("token");
        if (!language) return "";
        return language;
    }
    @Input()
    static set user(value: string) {
        localStorage.setItem("user", value);
    }

    static get user(): string {
        let language = localStorage.getItem("user");
        if (!language) return "";
        return language;
    }


    @Input()
    static set empresa(value: string) {
        sessionStorage.setItem("empresa", value);
    }

    static get empresa(): string {
        let empresaSeleccionada = sessionStorage.getItem("empresa");
        if (!empresaSeleccionada) return "";
        return empresaSeleccionada;
    }

    @Input()
    static set estacion(value: string) {
        sessionStorage.setItem("estacion", value);
    }

    static get estacion(): string {
        let estacionSeleccionada = sessionStorage.getItem("estacion");
        if (!estacionSeleccionada) return "";
        return estacionSeleccionada;
    }

    @Input()
    static set theme(value: string) {
        localStorage.setItem("tema", value);
    }

    static get theme(): string {
        let tema = localStorage.getItem("tema");
        if (!tema) return "";
        return tema;
    }

    @Input()
    static set baseUrl(value: string) {
        localStorage.setItem("baseUrl", value);
    }

    static get baseUrl(): string {
        let baseUrl = localStorage.getItem("baseUrl");
        if (!baseUrl) return "";
        return baseUrl;
    }

}