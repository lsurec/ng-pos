import { Component } from '@angular/core';
import { LocationInterface, TableInterface } from '../../interfaces/location.interface';
import { components } from 'src/app/providers/componentes.provider';
import { EventService } from 'src/app/services/event.service';
import { GlobalRestaurantService } from '../../services/global-restaurat.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-location-table',
  templateUrl: './location-table.component.html',
  styleUrls: ['./location-table.component.scss']
})
export class LocationTableComponent {

  constructor(
    private _eventService: EventService,
    public restaurantService: GlobalRestaurantService,
    private notificationService: NotificationsService,
    private _translate: TranslateService,
  ) {

  }

  goBack() {
    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false);
  }

  selectLocation(location: LocationInterface) {
    this.restaurantService.locationSelect = location;
    this.restaurantService.viewTables = true;
  }

  selectTable(table: TableInterface) {
    this.restaurantService.tableSelect = table;

    this.notificationService.pinMesero();

  }

  viewRestaurant() {

    if (this.restaurantService.locationSelect == null) {
      //TODO: traducir
      this.notificationService.openSnackbar(this._translate.instant('Seleccione una ubicacion'));
      return;
    }

    if (this.restaurantService.tableSelect == null) {
      //TODO: traducir
      this.notificationService.openSnackbar(this._translate.instant('Seleccione una mesa'));
      return;
    }

    this.restaurantService.viewRestaurant = true;
    this.restaurantService.viewLocations = false;
  }
}
