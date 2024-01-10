import { Component } from '@angular/core';
import { FiltroInterface } from '../../interfaces/filtro.interface';
import { CompraInterface, ProductoInterface } from '../../interfaces/producto.interface';
import { MatDialog } from '@angular/material/dialog';
import { ProductosEncontradosComponent } from '../productos-encontrados/productos-encontrados.component';
import { ProductoComponent } from '../producto/producto.component';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class DetalleComponent {

  searchText!: string;
  selectedOption: number | null = 1;
  eliminarPagos: boolean = false;

  tipoDesCar: number | null = 1;
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

  tipos: FiltroInterface[] = [
    {
      id: 1,
      nombre: "Porcentaje",
    },
    {
      id: 2,
      nombre: "Monto",
    },
  ];

  productos: ProductoInterface[] = [
    {
      sku: 'AL1',
      nombre: 'Plato de Comida 1'
    },
    {
      sku: 'AL2',
      nombre: 'Plato de Comida 2'
    },
    {
      sku: 'AL3',
      nombre: 'Plato de Comida 3'
    },
    {
      sku: 'AL4',
      nombre: 'Bebida Fría 1'
    },
    {
      sku: 'AL5',
      nombre: 'Bebida Fría 2'
    },
    {
      sku: 'LM6',
      nombre: 'Bebida Fría 3'
    },
    {
      sku: 'LM7',
      nombre: 'Bebida Caliente 1'
    },
    {
      sku: 'LM8',
      nombre: 'Bebida Caliente 2'
    },
    {
      sku: 'LM9',
      nombre: 'Bebida Caliente 3'
    },
    {
      sku: 'LM0',
      nombre: 'Postre 1'
    },
    {
      sku: 'P11',
      nombre: 'Postre 2'
    },
    {
      sku: 'P12',
      nombre: 'Postre 3'
    },
  ];

  registros: ProductoInterface[] = [];
  producto!: ProductoInterface;
  // precio!: number;
  // cantidad!: number;
  // total!: number;

  compras: CompraInterface[] = [];

  constructor(
    private _dialog: MatDialog,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,

  ) { }


  buscarProducto(filtro: string) {
    // Limpiar la lista de registros antes de cada búsqueda
    this.registros.length = 0;

    this.productos.forEach((producto) => {
      if (this.selectedOption == 1 && producto.sku.toLowerCase().includes(filtro.toLowerCase())) {
        this.registros.push(producto);
      }

      if (this.selectedOption == 2 && producto.nombre.toLowerCase().includes(filtro.toLowerCase())) {
        this.registros.push(producto);
      }

      if (this.searchText.length == 0) {
        this.registros = [];
      }

    });

    if (this.registros.length > 1) {
      let productos = this._dialog.open(ProductosEncontradosComponent, { data: this.registros })
      productos.afterClosed().subscribe(result => {
        if (result) {

          let productoSeleccionado: ProductoInterface = result[0];
          console.log(productoSeleccionado);

          if (!productoSeleccionado) {
            console.log("no se selecciono ningun producto");
            return
          } else {
            let producto = this._dialog.open(ProductoComponent, { data: productoSeleccionado })
            producto.afterClosed().subscribe(result => {
              if (result) {
                console.log(result);

                let producto: CompraInterface = result;

                let compra: CompraInterface = {
                  producto: producto.producto,
                  cantidad: producto.cantidad,
                  precioUnitario: producto.precioUnitario,
                  total: producto.total,
                }

                this.compras.push(compra);

              }
            })
          }
          // let producto: ProductoInterface = result[0];
          // this.producto = producto;
        }
      })
    }


  }

  onOptionChange(optionId: number) {
    this.selectedOption = optionId;
  }

  onOptionCarDes(optionId: number) {
    this.tipoDesCar = optionId;
  }

  seleccionar() {
    for (let index = 0; index < this.compras.length; index++) {
      const element = this.compras[index];
      element.checked = this.eliminarPagos;
    }
  }

  // Función para manejar la eliminación de pagos seleccionados
  async eliminarProducto() {

    let comprasSeleccionadas: CompraInterface[] = this.compras.filter((compra) => compra.checked);

    if (comprasSeleccionadas.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionar'));
      return
    }

    let verificador: boolean = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.eliminar'),
        description: this._translate.instant('pos.alertas.perderDatos'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;
    // Realiza la lógica para eliminar los pagos seleccionados, por ejemplo:
    this.compras = this.compras.filter((compra) => !compra.checked);
    // También puedes realizar otras acciones necesarias aquí
  }

}
