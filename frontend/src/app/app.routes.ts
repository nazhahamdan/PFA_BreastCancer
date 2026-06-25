import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Mammography } from './pages/mammography/mammography';
import { DiagnosticPriliminaire } from './pages/diagnostic-priliminaire/diagnostic-priliminaire';

export const routes: Routes = [
  {path:'',component:Home},
  { path: 'login', component: Login},
  { path: 'register', component: Register},
  { path: 'dashboard', component: Dashboard },
  { path: 'analyse', component: Mammography },
  { path: 'diagnostic',component:DiagnosticPriliminaire}
];

