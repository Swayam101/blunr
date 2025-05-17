import { HttpInterceptorFn } from '@angular/common/http';
import envs from '../../../../envs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  const baseReq = req.clone({
    url: `${envs.API_BASE_URL}${req.url}`,
  });

  const clonedReq = token
    ? baseReq.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : baseReq;

  return next(clonedReq);
};
