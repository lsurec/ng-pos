import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouteNamesService } from 'src/app/services/route.names.service';

@Component({
  selector: 'app-no-connected',
  templateUrl: './no-connected.component.html',
  styleUrls: ['./no-connected.component.scss']
})
export class NoConnectedComponent {

  constructor(
    private _router: Router,
  ) {
  }

  verInforme() {
    this._router.navigate([RouteNamesService.ERROR]);
  }

}
