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
    //permite ver una ruta solo si existe un token en la sesion
    if (PreferencesService.token) {
      return true;
    } else {
      //Si no hay in token dirige al login
      this._router.navigate([RouteNamesService.LOGIN]); 
      return false;
    }
  }
  
}
