import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class LoginGuard implements CanActivate {

  constructor(private _router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    //condicion que se cumple para aaceso a la ruta
    let token = this.getToken();
    //si existe token
    if (token) {
      this._router.navigate(['/station']); //devolver a home
      return false; // no va a tener acceso a la ruta
    } else {
      //si el token existe va a tener acceso a la ruta
      return true;
    }
  }

  //obtener Token guardado en storage
  getToken() {
    let token;
    let _token = sessionStorage.getItem("token"); //guardar en la sesionn
    let __token = localStorage.getItem("token"); //guardar permanente

    if (_token) {
      token = _token;
    } else if (__token) {
      token = __token;
    } else {
      token = false;
    }
    return token;
  }
}