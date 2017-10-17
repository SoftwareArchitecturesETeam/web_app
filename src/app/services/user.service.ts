import { Injectable, Component }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable, Subject } from 'rxjs/Rx';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { AppGlobals } from "../app.settings";
import { User } from "../models/user.model";

@Injectable()
export class UserService
{
	private userSubject: Subject<User>;
	public userState: Observable<User>;
	private logInURL: string;
	private usersURL: string;
	private logOutURL: string;

	constructor( private http: Http )
	{
		this.userSubject = new Subject<User>();
		this.userState = this.userSubject.asObservable();
		this.logInURL = `${AppGlobals.APIURI}/sign-in`;
		this.logOutURL = `${AppGlobals.APIURI}/logout`;
		this.usersURL = `${AppGlobals.APIURI}/users`;
	}
/*
	public getSessionStorageUser(): void
	{
		let userString: string = sessionStorage.getItem( "user" );
		let user: User;
		if( userString )
		{
			let data: any = { data: JSON.parse( userString ) };
			data.token = data.data.token;
			delete data.data.token;
			user = new User( data );
			if( !AppGlobals.URIHEADERS.has( "Authorization" ) )
				AppGlobals.URIHEADERS.set( "Authorization", user.token );
		}
		else
			user = new User( {} );
		this.setUser( user );
	}

	public setUser( user: User, save: boolean = false ): void
	{
		if( user.token && save )
			sessionStorage.setItem( "user", JSON.stringify( user ) );
		this.userSubject.next( <User>user );
	}
*/

	public setToken( token: any ): void
	{
		sessionStorage.setItem( "token", JSON.stringify( token ) );
		AppGlobals.URIHEADERS.append("Authorization", token);
		console.log("SetToken: \n", AppGlobals.URIHEADERS);
	}
	
	public deleteToken(): void {
		sessionStorage.removeItem( "token" );
		AppGlobals.URIHEADERS.delete("Authorization");
	}
	
	public refreshToken( token: any ): void
	{
		this.deleteToken();
		this.setToken(token);
	}

	// Handle errors
	private handleError( error: Response | any )
	{
		let errMsg: string;
		if( error instanceof Response )
		{
			const body = error.json() || "";
			const err = body.error || JSON.stringify( body );
			errMsg = `${error.status} - ${error.statusText || ""} ${err}`;
		}
		else
			errMsg = error.message ? error.message : error.toString();
		console.error( errMsg );

		return Observable.throw( errMsg );
	}

	public logIn( email: any, password: any ): Observable<any>
	{
		return this.http.post( this.logInURL, {email, password}, { headers: AppGlobals.URIHEADERS } )
			.map( response => response.json().token )
			.catch( this.handleError );
	}
	
	public logOut(): Observable<any>
	{
		console.log("AppGlobals.URIHEADERS -> BEFORE this.deleteToken()\n", AppGlobals.URIHEADERS);
		let logoutHeader = JSON.parse(JSON.stringify(AppGlobals.URIHEADERS));
		console.log("logoutHeader -> BEFORE this.deleteToken()\n", logoutHeader);
		this.deleteToken();
		console.log("logoutHeader -> AFTER this.deleteToken()\n", logoutHeader);
		console.log("AppGlobals.URIHEADERS -> AFTER this.deleteToken()\n", AppGlobals.URIHEADERS);
		return this.http.get( this.logOutURL, { headers: logoutHeader } )
			.map( response => response.json() )
			.catch( this.handleError );
	}

	public create( user: User, password: string, password_confirmation: string ): Observable<any>
	{		
		return this.http.post( `${this.usersURL}`, { first_name: user.first_name, last_name: user.last_name,password, email: user.email, age: user.age, password_confirmation }, { headers: AppGlobals.URIHEADERS } )
			.map( response => response.json().user )
			.catch( this.handleError );
	}

	public update( user: User ): Observable<any>
	{
		return this.http.put( `${this.usersURL}`, { data: user }, { headers: AppGlobals.URIHEADERS } )
			.map( response => response.json().data )
			.catch( this.handleError );
	}
}
