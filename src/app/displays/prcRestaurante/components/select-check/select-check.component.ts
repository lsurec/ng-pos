import { Component } from '@angular/core';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationsService } from 'src/app/services/notifications.service';
import { RenameCheckComponent } from '../rename-check/rename-check.component';

@Component({
  selector: 'app-select-check',
  templateUrl: './select-check.component.html',
  styleUrls: ['./select-check.component.scss']
})
export class SelectCheckComponent {


  isLoading: boolean = false;

  constructor(
    public restaurantService: GlobalRestaurantService,
    public dialogRef: MatDialogRef<SelectCheckComponent>,
    private _dialog: MatDialog,
    private _notificationService: NotificationsService,
  ) { }


  loadData() { }


  closeDialog() {

    this.dialogRef.close();
  }

  renombrar(index: number): Promise<any> {
    return new Promise((resolve, reject) => {

      let dialogRef = this._dialog.open(RenameCheckComponent, { data: index })

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  async newCheck() {
    let nombre: string = await this._notificationService.newCheck();

    if (nombre) {

      this.restaurantService.orders.push(
        {
          consecutivo: 0,
          consecutivoRef: 0,
          mesa: this.restaurantService.table!,
          mesero: this.restaurantService.waiter!,
          nombre: nombre,
          selected: false,
          transacciones: [],
          ubicacion: this.restaurantService.location!,
        }

      );

      this.restaurantService.updateOrdersTable();
    }
  }

  selectCheck(index: number) {
    this.dialogRef.close(index);
  }
}
