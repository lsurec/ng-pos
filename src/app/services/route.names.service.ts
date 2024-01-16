// route-names.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RouteNamesService {
  static readonly SPLASH: string = 'splash';
  static readonly LANGUAGE: string = 'lang';
  static readonly THEME: string = 'theme';
  static readonly LOGIN: string = 'login';
  static readonly HOME: string = 'home';
  static readonly LOCAL_CONFIG: string = 'local-config';
  static readonly API: string = 'api';
  static readonly NOT_FOUND: string = 'not-found';
  static readonly ERROR: string = 'error';
  static readonly NO_CONNECTED: string = 'no-conexion';
  static readonly DOC: string = 'doc';
  static readonly NEW_ACCOUNT: string = 'new-account';

  // Agrega más nombres de rutas según sea necesario

  constructor() { }
}
