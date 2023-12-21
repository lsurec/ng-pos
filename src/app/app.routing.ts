import { RouterModule } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { LoginComponent } from "./components/login/login.component";
import { NotFoundComponent } from "./components/not-found/not-found.component";

type PathMatch = "full" | "prefix" | undefined;

const appRoutes = [
    // { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
    // { path: 'home', component: HomeComponent, canActivate: [HomeGuard] },
    // { path: 'view', component: DetalleTareaComponent },
    { path: 'notFound', component: NotFoundComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' as PathMatch },
    { path: '**', redirectTo: '/login', pathMatch: 'full' as PathMatch },

]
export const routing = RouterModule.forRoot(appRoutes)
