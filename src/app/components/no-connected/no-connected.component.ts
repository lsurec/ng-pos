import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { RetryService } from 'src/app/services/retry.service';
import { RouteNamesService } from 'src/app/services/route.names.service';

@Component({
  selector: 'app-no-connected',
  templateUrl: './no-connected.component.html',
  styleUrls: ['./no-connected.component.scss']
})
export class NoConnectedComponent {


  @Input() error: ErrorInterface | undefined;
  @Input() component: string | undefined;

  constructor(
    private _router: Router,
    private _retryService: RetryService,

  ) {
  }


  reload() {

    switch (this.component) {
      case RouteNamesService.SPLASH:
        this._retryService.splashRetry();
        break;

      case RouteNamesService.LOCAL_CONFIG:
        this._retryService.configRetry();
        break;

      case RouteNamesService.HOME:
        this._retryService.homeRetry();
        break;

      default:
        break;
    }
  }

  verInforme() {
    PreferencesService.error = this.error!;
    this._router.navigate([RouteNamesService.ERROR]);
  }

}
