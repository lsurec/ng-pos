import { Component } from '@angular/core';
import { CertificadorInterface } from '../../interfaces/certificador.interface';

@Component({
  selector: 'app-certificadores',
  templateUrl: './certificadores.component.html',
  styleUrls: ['./certificadores.component.scss']
})
export class CertificadoresComponent {


  isLoading: boolean = false;

  cetificadores: CertificadorInterface[] = [
    {
      nombre: "Infile",
      direccion: "Zona1",
      nit: "1234567-8",
      tel: "87654321"
    },
    {
      nombre: "Certificador 2",
      direccion: "Zona 3, Colonia 2.",
      nit: "2345678-9",
      tel: "76543210"
    },
    {
      nombre: "Certificador 3",
      direccion: "Zona 16",
      nit: "1234567-8",
      tel: "87654321"
    },
    {
      nombre: "Certificador 4",
      direccion: "Zona 2, Colonia 1.",
      nit: "2345678-9",
      tel: "76543210"
    }
  ];
  backPage() { }
  loadData() { }
  detalleCert() { }

}
