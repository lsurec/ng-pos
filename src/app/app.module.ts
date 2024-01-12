import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ApiComponent } from './components/api/api.component';
import { LoginComponent } from './components/login/login.component';
import { SplashComponent } from './components/splash/splash.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HomeComponent } from './components/home/home.component';
import { HelpComponent } from './components/help/help.component';
import { ErrorComponent } from './components/error/error.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DialogActionsComponent } from './components/dialog-actions/dialog-actions.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { LogosComponent } from './components/logos/logos.component';
import { ProgressComponent } from './components/progress/progress.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BarraLogosComponent } from './components/barra-logos/barra-logos.component';
import { BarraLogoDemosoftComponent } from './components/barra-logo-demosoft/barra-logo-demosoft.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { LocalConfigComponent } from './components/local-config/local-config.component';

import { routing } from './app.routing';
import { HttpClientModule } from '@angular/common/http';

import { LangComponent } from './components/lang/lang.component';
import { ThemeComponent } from './components/theme/theme.component';
import { DataUserService } from './displays/prc_documento_3/services/data-user.service';
import { FacturaComponent } from './displays/prc_documento_3/components/factura/factura.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DocumentoComponent } from './displays/prc_documento_3/components/documento/documento.component';
import { NuevoClienteComponent } from './displays/prc_documento_3/components/nuevo-cliente/nuevo-cliente.component';
import { ClientesEncontradosComponent } from './displays/prc_documento_3/components/clientes-encontrados/clientes-encontrados.component';
import { NoConnectedComponent } from './components/no-connected/no-connected.component';
import { InConstructionComponent } from './components/in-construction/in-construction.component';
import { DetalleComponent } from './displays/prc_documento_3/components/detalle/detalle.component';
import { ProductosEncontradosComponent } from './displays/prc_documento_3/components/productos-encontrados/productos-encontrados.component';
import { ProductoComponent } from './displays/prc_documento_3/components/producto/producto.component';
import { PagoComponent } from './displays/prc_documento_3/components/pago/pago.component';
import { EditarClienteComponent } from './displays/prc_documento_3/components/editar-cliente/editar-cliente.component';
import { ResumenDocumentoComponent } from './displays/prc_documento_3/components/resumen-documento/resumen-documento.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { HistorialComponent } from './displays/prc_documento_3/components/historial/historial.component';
import { DetalleDocumentoComponent } from './displays/prc_documento_3/components/detalle-documento/detalle-documento.component';
import { CargoDescuentoComponent } from './displays/prc_documento_3/components/cargo-descuento/cargo-descuento.component';


@NgModule({
  declarations: [
    AppComponent,
    ApiComponent,
    LoginComponent,
    SplashComponent,
    NotFoundComponent,
    HomeComponent,
    HelpComponent,
    ErrorComponent,
    DialogActionsComponent,
    LogosComponent,
    ProgressComponent,
    BarraLogosComponent,
    BarraLogoDemosoftComponent,
    LocalConfigComponent,
    LangComponent,
    ThemeComponent,
    FacturaComponent,
    DocumentoComponent,
    NuevoClienteComponent,
    ClientesEncontradosComponent,
    NoConnectedComponent,
    InConstructionComponent,
    DetalleComponent,
    ProductosEncontradosComponent,
    ProductoComponent,
    PagoComponent,
    EditarClienteComponent,
    ResumenDocumentoComponent,
    HistorialComponent,
    DetalleDocumentoComponent,
    CargoDescuentoComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http);
        },
        deps: [HttpClient]
      }
    }),
    MatDialogModule,
    MatSnackBarModule,
    FormsModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    MatRadioModule,
    routing,
    MatToolbarModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatExpansionModule
  ],
  providers: [
    // DataUserService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
