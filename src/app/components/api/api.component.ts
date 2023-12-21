import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouteNamesService } from 'src/app/services/route.names.service';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss']
})
export class ApiComponent {

  constructor(
    private _router: Router,
  ) {

  }

  guardar(): void {
    this._router.navigate([RouteNamesService.API]);
  }
}
