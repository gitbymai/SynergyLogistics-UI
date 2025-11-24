import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const token = this.authService.getToken();

    // First check if token exists and is valid
    if (!token || this.authService.isTokenExpired()) {
      console.log('AuthGuard: Access denied, redirecting to login');
      this.authService.logout();
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Get required roles from current route or parent routes
    const requiredRoles = this.getRequiredRoles(route);

    if (!requiredRoles || requiredRoles.length === 0) {
      // No specific roles required, just authenticated
      console.log('AuthGuard: Access granted (no role restriction)');
      return true;
    }

    // Check user role from Observable
    return this.authService.currentUser.pipe(
      take(1),
      map(user => {
        if (user && requiredRoles.includes(user.role.toLowerCase())) {
          console.log('AuthGuard: Access granted for role:', user.role);
          return true;
        }

        console.log('AuthGuard: Access denied - insufficient permissions. Required:', requiredRoles, 'User role:', user?.role);
        // Redirect to dashboard with error
        return this.router.createUrlTree(['/unauthorized'], {
          queryParams: { error: 'unauthorized' }
        });
      })
    );
  }

  private getRequiredRoles(route: ActivatedRouteSnapshot): string[] | null {
    let roles: string[] | null = null;

    // Start from root and go down, so child routes override parent routes
    let currentRoute: ActivatedRouteSnapshot | null = route;
    const routeHierarchy: ActivatedRouteSnapshot[] = [];

    // Build hierarchy from current to root
    while (currentRoute) {
      routeHierarchy.unshift(currentRoute);
      currentRoute = currentRoute.parent;
    }

    // Check from root to current (child overrides parent)
    for (const r of routeHierarchy) {
      if (r.data['roles']) {
        roles = r.data['roles'] as string[];
      }
    }

    console.log('Required roles:', roles);
    return roles;
  }
}