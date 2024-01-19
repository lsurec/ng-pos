import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {

  //abirir y cerrar el mat expander
  desplegarDetalles: boolean = false;

  //Abrir/Cerrar SideNav
  // @ViewChild('sidenav')
  // sidenav!: MatSidenav;
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  //Abrir cerrar Sidenav
  close(reason: string) {
    // this.sidenav.close();
    this.sidenavend.close();
  }
}
