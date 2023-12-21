// route-names.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RouteNamesService {
  static readonly HOME = 'home';
  static readonly LOCAL_CONFIG = 'local-config';
  static readonly LANGUAGE = 'lang';
  static readonly SPLASH = 'splash';
  // Agrega más nombres de rutas según sea necesario

  constructor() {}
}
