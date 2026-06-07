import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.html',
})
export class AdminLogin {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, introduce tu email y contraseña.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
        console.error('Login error:', error);
      }
    });
  }
}
