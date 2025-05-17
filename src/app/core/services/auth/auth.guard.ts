import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ROUTES } from '../../constants/routes.constant';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (this.auth.isAuthenticated()) {
      return true; // User is already authenticated
    }

    // Fetch user profile before allowing navigation
    return this.auth.getProfile().pipe(
      tap((user) => {
        if (!user) {
          this.router.navigate([ROUTES.LOGIN]); // Redirect if profile is invalid
        }
      }),
      map((user) => !!user) // Convert response to boolean
    );
  }
}
