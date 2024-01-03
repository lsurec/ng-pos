import { Injectable, Input } from "@angular/core";

@Injectable()
export class PreferencesService {


    private static userKey = 'user';
    private static userStorageKey = 'userStorage';
    private static tokenKey = 'token';
    private static tokenStorageKey = 'tokenStorage';
    private static languageKey = 'language';
    private static empresaKey = 'empresa';
    private static estacionKey = 'estacion';
    private static temaKey = 'tema';
    private static urlKey = 'url';
    private static conKey = 'conStr';
    private static conStoragekey = 'conStorageStr';

    @Input()
    static set lang(value: string) {
        localStorage.setItem(this.languageKey, value);
    }

    static get lang(): string {
        let value = localStorage.getItem(this.languageKey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set tokenStorage(value: string) {
        localStorage.setItem(this.tokenStorageKey, value);
    }

    static get tokenStorage(): string {
        let value = localStorage.getItem(this.tokenStorageKey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set token(value: string) {
        localStorage.setItem(this.tokenKey, value);
    }

    static get token(): string {
        let value = localStorage.getItem(this.tokenKey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set userStorage(value: string) {
        localStorage.setItem(this.userStorageKey, value);
    }

    static get userStorage(): string {
        let value = localStorage.getItem(this.userStorageKey);
        if (!value) return "";
        return value;
    }


    @Input()
    static set user(value: string) {
        localStorage.setItem(this.userKey, value);
    }

    static get user(): string {
        let value = localStorage.getItem(this.userKey);
        if (!value) return "";
        return value;
    }


    @Input()
    static set empresa(value: string) {
        sessionStorage.setItem(this.empresaKey, value);
    }

    static get empresa(): string {
        let value = sessionStorage.getItem(this.empresaKey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set estacion(value: string) {
        sessionStorage.setItem(this.estacionKey, value);
    }

    static get estacion(): string {
        let value = sessionStorage.getItem(this.estacionKey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set theme(value: string) {
        localStorage.setItem(this.temaKey, value);
    }

    static get theme(): string {
        let value = localStorage.getItem(this.temaKey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set baseUrl(value: string) {
        localStorage.setItem(this.urlKey, value);
    }

    static get baseUrl(): string {
        let value = localStorage.getItem(this.urlKey);
        if (!value) return "";
        return value;
    }


    @Input()
    static set conStorageStr(value: string) {
        localStorage.setItem(this.conStoragekey, value);
    }

    static get conStorageStr(): string {
        let value = localStorage.getItem(this.conStoragekey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set conStr(value: string) {
        localStorage.setItem(this.conKey, value);
    }

    static get conStr(): string {
        let value = localStorage.getItem(this.conKey);
        if (!value) return "";
        return value;
    }

}