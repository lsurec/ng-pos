import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { PreferencesService } from 'src/app/services/preferences.service';
import { RouteNamesService } from 'src/app/services/route.names.service';

@Injectable({
  providedIn: 'root'
})
export class ApiGuard implements CanActivate {
  constructor( private _router: Router) {}

  canActivate(): boolean {
    if (PreferencesService.baseUrl) {
      return true;
    } else {
      this._router.navigate([RouteNamesService.API]); // Redirige a la página principal si ya está autenticado
      return false;
    }
  }
  
}
