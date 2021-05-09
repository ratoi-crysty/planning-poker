import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { SessionStoreService } from '../stores/session-store.service';
import { connect } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  protected connection = new BehaviorSubject<SocketIOClient.Socket | undefined>(undefined);

  constructor(protected http: HttpClient, protected sessionStore: SessionStoreService) {
    this.sessionStore.getToken()
      .pipe(
        filter((token: string | undefined): token is string => !!token),
        switchMap((token: string): Observable<SocketIOClient.Socket | undefined> => {
          return this.createWsConnection(token);
        }),
      )
      .subscribe(this.connection);
  }

  get<T>(path: string, params?: Record<string, string | string[]>): Observable<T> {
    return this.http.get<T>(this.getUrl(path), {
      params,
      headers: this.getHeaders(),
    });
  }

  post<T>(path: string, body: unknown, params?: Record<string, string | string[]>): Observable<T> {
    return this.http.post<T>(this.getUrl(path), body, {
      params,
      headers: this.getHeaders(),
    });
  }

  put<T>(path: string, body: unknown, params?: Record<string, string | string[]>): Observable<T> {
    return this.http.put<T>(this.getUrl(path), body, {
      params,
      headers: this.getHeaders(),
    });
  }

  delete<T>(path: string, params?: Record<string, string | string[]>): Observable<T> {
    return this.http.delete<T>(this.getUrl(path), {
      params,
      headers: this.getHeaders(),
    });
  }

  listenToEvent<T>(event: string): Observable<T> {
    return this.connection
      .pipe(
        filter((socket: SocketIOClient.Socket | undefined): socket is SocketIOClient.Socket => !!socket),
        switchMap((socket: SocketIOClient.Socket): Observable<T> => {
          return new Observable<T>((subscriber: Subscriber<T>) => {
            const listener = (data: T) => {
              subscriber.next(data);
            };

            socket.on(event, listener);
            socket.on('close', () => {
              subscriber.complete();
            });

            return () => {
              socket.off(event, listener);
            };
          });
        }),
      );
  }

  sendEvent<T, D = undefined>(event: string, data?: D): Observable<T> {
    return this.connection
      .pipe(
        filter((socket: SocketIOClient.Socket | undefined): socket is SocketIOClient.Socket => {
          return !!socket;
        }),
        switchMap((socket): Observable<T> => {
          return this.call<T, D>(socket, event, data);
        }),
      );

  }

  protected call<T, D = undefined>(socket: SocketIOClient.Socket, event: string, data?: D): Observable<T> {
    return new Observable<T>((subscriber: Subscriber<T>) => {
      socket.emit(event, data, (resp: T) => {
        subscriber.next(resp);
        subscriber.complete();
      });
    });
  }

  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    const token: string | undefined = this.sessionStore.getTokenValue();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  protected getUrl(path: string) {
    return `/api/${path}`;
  }

  protected createWsConnection(token: string): Observable<SocketIOClient.Socket> {
    return new Observable<SocketIOClient.Socket>((subscriber: Subscriber<SocketIOClient.Socket>) => {
      const socket: SocketIOClient.Socket = connect(`ws://localhost:3333/api/room?jwt_bearer=${token}`, {
        transports: ['websocket'],
      });

      subscriber.next(socket);

      return () => {
        socket.close();
      };
    });
  }
}
