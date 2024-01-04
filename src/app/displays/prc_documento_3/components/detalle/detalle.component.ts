import { Component } from '@angular/core';
import { FiltroInterface } from '../../interfaces/filtro.interface';
import { ProductoInterface } from '../../interfaces/producto.interface';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class DetalleComponent {

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

  }

  onOptionChange(optionId: number) {
    this.selectedOption = optionId;
  }

}
