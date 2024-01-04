import { RouterModule } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import { HomeComponent } from "./components/home/home.component";
import { LocalConfigComponent } from "./components/local-config/local-config.component";
import { LoginGuard } from "./guards/login.guard";
import { HomeGuard } from "./guards/home.guard";
import { SplashComponent } from "./components/splash/splash.component";
import { RouteNamesService } from "./services/route.names.service";
import { LangComponent } from "./components/lang/lang.component";
import { ThemeComponent } from "./components/theme/theme.component";
import { ApiComponent } from "./components/api/api.component";
import { ErrorComponent } from "./components/error/error.component";
import { NoConnectedComponent } from "./components/no-connected/no-connected.component";
import { DocumentoComponent } from "./displays/prc_documento_3/components/documento/documento.component";
import { NuevoClienteComponent } from "./displays/prc_documento_3/components/nuevo-cliente/nuevo-cliente.component";
import { FacturaComponent } from "./displays/prc_documento_3/components/factura/factura.component";

type PathMatch = "full" | "prefix" | undefined;

const appRoutes = [

    { path: RouteNamesService.SPLASH, component: SplashComponent },
    { path: RouteNamesService.LANGUAGE, component: LangComponent },
    { path: RouteNamesService.THEME, component: ThemeComponent },
    { path: RouteNamesService.API, component: ApiComponent },
    { path: RouteNamesService.LOCAL_CONFIG, component: LocalConfigComponent },
    { path: RouteNamesService.NOT_FOUND, component: NotFoundComponent },
    { path: RouteNamesService.HOME, component: HomeComponent },
    { path: RouteNamesService.ERROR, component: ErrorComponent },
    { path: RouteNamesService.NO_CONNECTED, component: NoConnectedComponent },
    { path: RouteNamesService.DOC, component: DocumentoComponent },
    { path: RouteNamesService.NEW_ACCOUNT, component: NuevoClienteComponent },

    { path: RouteNamesService.LOGIN, component: LoginComponent},

    // { path: RouteNamesService.LOGIN, component: LoginComponent, canActivate: [LoginGuard] },
    { path: '', redirectTo: RouteNamesService.SPLASH, pathMatch: 'full' as PathMatch },

]

export const routing = RouterModule.forRoot(appRoutes)
