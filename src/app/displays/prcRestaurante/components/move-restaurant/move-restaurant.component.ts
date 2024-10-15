import { Component } from '@angular/core';

@Component({
  selector: 'app-move-restaurant',
  templateUrl: './move-restaurant.component.html',
  styleUrls: ['./move-restaurant.component.scss']
})
export class MoveRestaurantComponent {

  //1: Cuenta
  //2: Transaccion
  tipoTraslado: number = 0;

}
