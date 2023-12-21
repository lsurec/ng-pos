import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss']
})
export class ApiComponent {

  url!: string;

  constructor(
    private _router: Router,
  ) {

  }

  guardar(): void {
    StorageService.baseUrl = this.url;
    this._router.navigate([RouteNamesService.LOGIN]);
  }
}
