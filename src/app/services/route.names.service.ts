// route-names.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RouteNamesService {
  static readonly SPLASH = 'splash';
  static readonly LANGUAGE = 'lang';
  static readonly THEME = 'theme';
  static readonly LOGIN = 'login';
  static readonly HOME = 'home';
  static readonly LOCAL_CONFIG = 'local-config';
  static readonly API = 'api';
  static readonly NOT_FOUND = 'not-found';
  static readonly ERROR = 'error';
  static readonly NO_CONNECTED = 'no-conexion';
  static readonly DOC = 'doc';
  static readonly NEW_ACCOUNT = 'new-account';

  // Agrega más nombres de rutas según sea necesario

  constructor() { }
}
