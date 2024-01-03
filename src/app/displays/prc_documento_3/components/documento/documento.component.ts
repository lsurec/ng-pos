import { Component } from '@angular/core';
import { FiltroInterface } from '../../interfaces/filtro.interface';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { MatDialog } from '@angular/material/dialog';
import { ClientesEncontradosComponent } from '../clientes-encontrados/clientes-encontrados.component';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RouteNamesService } from 'src/app/services/route.names.service';

@Component({
  selector: 'app-documento',
  templateUrl: './documento.component.html',
  styleUrls: ['./documento.component.scss']
})
export class DocumentoComponent {

  switchState: boolean = false;
  serie!: string;
  series: string[] = [
    "FAC M",
    "FAC MX",
    "FAC GT"
  ]

  vendedor!: string;
  vendedores: string[] = [
    "Proveedor",
    "Vendedor 01",
    "DEMOSOFT"
  ]

  constructor(
    private _dialog: MatDialog,
    private _location: Location,
    private translate: TranslateService,
    private _router: Router,
  ) {
  }

  // Función para manejar el cambio de estado del switch
  toggleSwitch(): void {
    this.switchState = !this.switchState;
    this.selectedCliente = false;
  }

  searchText!: string;
  selectedOption: number | null = 1;


  filtrosBusqueda: FiltroInterface[] = [
    {
      id: 1,
      nombre: "SKU",
    },
    {
      id: 2,
      nombre: "Descripción",
    },
  ];


  onOptionChange(optionId: number) {
    this.selectedOption = optionId;
  }

  listaClientes: ClienteInterface[] = [
    {
      nit: 12345678,
      nombre: "Cliente1"
    },
    {
      nit: 23456789,
      nombre: "Cliente2"
    },
    {
      nit: 34567890,
      nombre: "OtroCliente"
    },
    {
      nit: 45678901,
      nombre: "Cliente3"
    },
    {
      nit: 56789012,
      nombre: "Juan"
    },
    {
      nit: 67890123,
      nombre: "Maria"
    },
  ];
  registros: ClienteInterface[] = [];
  selectedCliente: boolean = false;
  cliente!: ClienteInterface;

  // Función de filtrado
  buscarCliente(terminoBusqueda: string): void {
    // Limpiar la lista de registros antes de cada búsqueda
    this.registros.length = 0;

    // Convertir el término de búsqueda a minúsculas para hacer la búsqueda sin distinción entre mayúsculas y minúsculas
    let terminoMinusculas = terminoBusqueda.toLowerCase();

    // Filtrar la lista de clientes
    this.listaClientes.forEach((cliente) => {
      const nombreMinusculas = cliente.nombre.toLowerCase();
      const nitStr = cliente.nit.toString(); // Convertir el NIT a cadena para facilitar la comparación

      if (nombreMinusculas.includes(terminoMinusculas) || nitStr.includes(terminoMinusculas)) {
        this.registros.push(cliente);
      }

      if (this.searchText.length == 0) {
        this.registros = [];
      }

    });

    if (this.registros.length == 1) {
      this.cliente = this.registros[0];
      this.selectedCliente = true;
    }

    // Puedes agregar lógica adicional aquí si es necesario

    if (this.registros.length > 1) {
      let estado = this._dialog.open(ClientesEncontradosComponent, { data: this.registros })
      estado.afterClosed().subscribe(result => {
        if (result) {
          console.log(result[0]);

          let cliente: ClienteInterface = result[0];
          this.cliente = cliente;
          this.selectedCliente = true;
        }
      })
    }
  }

  agregarCliente() {
    this._router.navigate([RouteNamesService.NEW_ACCOUNT]);

  }

  goBack() {
    this._location.back();
  }
}
