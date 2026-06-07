import { Routes } from '@angular/router';
import { PublicHome } from './public-home/public-home';
import { PostDetail } from './post-detail/post-detail';
import { AdminPanel } from './admin-panel/admin-panel';
import { AdminAuthors } from './admin-authors/admin-authors';
import { AdminLogin } from './admin-login/admin-login';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: PublicHome },
  { path: 'noticia/:id', component: PostDetail },
  { path: 'login', component: AdminLogin },
  { path: 'admin', component: AdminPanel, canActivate: [authGuard] },
  { path: 'admin-authors', component: AdminAuthors, canActivate: [authGuard] }
];
