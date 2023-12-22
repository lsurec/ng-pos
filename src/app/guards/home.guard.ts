import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HomeGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // condicion que debe cumplir
    let token = this.getToken();
    //si exite el token
    if (token) {
      return true; // si va a tener acceso a la ruta
    } else {
      this.router.navigate(["/login"]) //devolver al login
      return false;
    }

  }
  getToken() {
    let token;
    let _token = sessionStorage.getItem("token"); //guardar en la sesionn
    let __token = localStorage.getItem("token"); //guardar permanente

    if (_token) {
      token = _token;
    } else if (__token) {
      token = __token;
    } else {
      token = false; //sino existe el token en sessionStorage o en el localStorage retornar false
    }
    return token;
  }

}