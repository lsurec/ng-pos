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
    //permite ver una pantalla solo si existe una url configurasa
    if (PreferencesService.baseUrl) {
      return true;
    } else {
      //si no hay una url dirige a la pantalla de configuracion
      this._router.navigate([RouteNamesService.API]); 
      return false;
    }
  }
  
}
