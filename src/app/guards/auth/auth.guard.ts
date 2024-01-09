import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { PreferencesService } from 'src/app/services/preferences.service';
import { RouteNamesService } from 'src/app/services/route.names.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
   constructor( private _router: Router) {}

  canActivate(): boolean {
    if (PreferencesService.token) {
      return true;
    } else {
      this._router.navigate([RouteNamesService.LOGIN]); // Redirige a la página de inicio de sesión si no está autenticado
      return false;
    }
  }
  
}
