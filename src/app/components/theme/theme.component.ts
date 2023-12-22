import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class ThemeComponent {
  temaOscuro: boolean = false;
  tema: number = 0;

  constructor(
    private themeService: ThemeService,
    private _router: Router,

  ) {

  }

  ngOnInit(): void {

    if (PreferencesService.theme == '1') {
      this.tema = 1;
    }
  };

  claro(idTema: number): void {
    this.tema = idTema;
    this.themeService.isDarkTheme = false;
    this.themeService.updateTheme();
    PreferencesService.theme = "0";
  }

  oscuro(idTema: number): void {
    this.tema = idTema;
    this.themeService.isDarkTheme = true;
    this.themeService.updateTheme();
    PreferencesService.theme = "1";
  }

  guardar(): void {
    this._router.navigate([RouteNamesService.API]);
  }
}
