import { Component } from '@angular/core';
import { LocationInterface, TableInterface } from '../../interfaces/location.interface';

@Component({
  selector: 'app-location-table',
  templateUrl: './location-table.component.html',
  styleUrls: ['./location-table.component.scss']
})
export class LocationTableComponent {

  locations: LocationInterface[] = [
    {
      id: 1,
      nombre: "SALON PRINCIPAL",
      disponibles: 2,
    },
    {
      id: 2,
      nombre: "SALON LAS FLORES",
      disponibles: 2,
    },
    {
      id: 3,
      nombre: "TERRAZA",
      disponibles: 6,
    },
  ]

  tables: TableInterface[] = [
    {
      id: 1,
      espacios: 2,
    },
    {
      id: 2,
      espacios: 4,
    },
    {
      id: 3,
      espacios: 6,
    },
    {
      id: 4,
      espacios: 8,
    },
  ]

}
