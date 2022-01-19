import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Subject} from 'rxjs';
import {GameResultService} from './game-result.service';
import {PlayGameService} from './play-game.service';
import {NextDrawId} from '../models/NextDrawId.model';
import {User} from '../models/user.model';
import {CommonService} from './common.service';
import {ServerResponse} from '../models/ServerResponse.model';
import {DrawTime} from '../models/DrawTime.model';
import {timeout} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
// @ts-ignore
export class WatchDrawService {

  private BASE_API_URL = environment.BASE_API_URL;
  private nextDrawId: NextDrawId = {};
  nextDrawSubject = new Subject<NextDrawId>();

  activeDrawTime: DrawTime;
  activeTimeMillisecond: number;
  serverTimeMillisecond: number;

  differenceTime: number;

  public serverTime: {hour: number, minute: number, second: number, 'meridiem': string};

  constructor(private http: HttpClient, private gameResultService: GameResultService, private playGameService: PlayGameService
              // tslint:disable-next-line:align
              , private commonService: CommonService) {

    const userData: User = JSON.parse(localStorage.getItem('user'));

    this.http.get(this.BASE_API_URL + '/serverTime')
      .subscribe((response: {hour: number, minute: number, second: number, 'meridiem': string}) => {
        this.serverTime = response;
        this.serverTimeMillisecond = ((this.serverTime.hour * 3600) + (this.serverTime.minute * 60) + this.serverTime.second) * 1000;

        this.http.get(this.BASE_API_URL + '/dev/drawTimes/active').subscribe((response: ServerResponse) => {
          this.activeDrawTime = response.data;
          const x = this.activeDrawTime.endTime.split(':');
          // tslint:disable-next-line:radix
          this.activeTimeMillisecond = (((parseInt(String(x[0])) * 3600)  + (parseInt(String(x[1])) * 60) + parseInt(String(x[2]))) * 1000) + 500;
          this.differenceTime = this.activeTimeMillisecond - this.serverTimeMillisecond ;


          setTimeout(() => {
            this.http.get(this.BASE_API_URL + '/dev/nextDrawId').subscribe((response: NextDrawId) => {

              if (Object.entries(this.nextDrawId).length === 0){
                this.nextDrawId = response;
                this.nextDrawSubject.next({...this.nextDrawId});
                if (userData == null){
                  this.gameResultService.getUpdatedResult();
                }else{
                  this.gameResultService.getUpdatedResult();
                  this.playGameService.getTodayLastResult();
                  this.playGameService.getTodayResult();
                }

              }else if (this.nextDrawId.data.id !== response.data.id) {
                this.nextDrawId = response;
                this.nextDrawSubject.next({...this.nextDrawId});
                if (userData == null){
                  this.gameResultService.getUpdatedResult();
                }else{
                  this.gameResultService.getUpdatedResult();
                  this.playGameService.getTodayLastResult();
                  this.playGameService.getTodayResult();
                  this.commonService.getActiveServerDrawTime();
                  this.commonService.updateTerminalCancellation();
                  this.getNewActiveDraw();
                }
              }

              // console.log('working');

            });
          }, this.differenceTime);



        });

      });

    // this.http.get(this.BASE_API_URL + '/dev/drawTimes/active').subscribe((response: ServerResponse) => {
    //   this.activeDrawTime = response.data;
    //   const x = this.activeDrawTime.endTime.split(':');
    //   // tslint:disable-next-line:radix
    //   this.activeTimeMillisecond = (((parseInt(String(x[0])) * 3600)  + (parseInt(String(x[1])) * 60) + parseInt(String(x[2]))) * 1000) + 500;
    //   console.log(this.activeDrawTime, ' ' , this.activeTimeMillisecond);
    //   this.differenceTime = this.activeTimeMillisecond - this.serverTimeMillisecond ;
    //   console.log(this.differenceTime);
    // });
    //
    // this.differenceTime = this.activeTimeMillisecond - this.serverTimeMillisecond ;


    // setInterval(() => {
    //   this.http.get(this.BASE_API_URL + '/dev/nextDrawId').subscribe((response: NextDrawId) => {
    //
    //     if (Object.entries(this.nextDrawId).length === 0){
    //       this.nextDrawId = response;
    //       this.nextDrawSubject.next({...this.nextDrawId});
    //       if (userData == null){
    //         this.gameResultService.getUpdatedResult();
    //       }else{
    //         this.gameResultService.getUpdatedResult();
    //         this.playGameService.getTodayLastResult();
    //         this.playGameService.getTodayResult();
    //       }
    //
    //     }else if (this.nextDrawId.data.id !== response.data.id) {
    //       this.nextDrawId = response;
    //       this.nextDrawSubject.next({...this.nextDrawId});
    //       if (userData == null){
    //         this.gameResultService.getUpdatedResult();
    //       }else{
    //         this.gameResultService.getUpdatedResult();
    //         this.playGameService.getTodayLastResult();
    //         this.playGameService.getTodayResult();
    //         this.commonService.getActiveServerDrawTime();
    //         this.commonService.updateTerminalCancellation();
    //       }
    //     }
    //
    //   });
    // }, 1000);


    // setTimeout(() => {
    //   this.http.get(this.BASE_API_URL + '/dev/nextDrawId').subscribe((response: NextDrawId) => {
    //
    //     if (Object.entries(this.nextDrawId).length === 0){
    //       this.nextDrawId = response;
    //       this.nextDrawSubject.next({...this.nextDrawId});
    //       if (userData == null){
    //         this.gameResultService.getUpdatedResult();
    //       }else{
    //         this.gameResultService.getUpdatedResult();
    //         this.playGameService.getTodayLastResult();
    //         this.playGameService.getTodayResult();
    //       }
    //
    //     }else if (this.nextDrawId.data.id !== response.data.id) {
    //       this.nextDrawId = response;
    //       this.nextDrawSubject.next({...this.nextDrawId});
    //       if (userData == null){
    //         this.gameResultService.getUpdatedResult();
    //       }else{
    //         this.gameResultService.getUpdatedResult();
    //         this.playGameService.getTodayLastResult();
    //         this.playGameService.getTodayResult();
    //         this.commonService.getActiveServerDrawTime();
    //         this.commonService.updateTerminalCancellation();
    //         this.getNewActiveDraw();
    //       }
    //     }
    //
    //     console.log('working');
    //
    //   });
    // }, 10000);

  }


  getNewActiveDraw(){
    this.http.get(this.BASE_API_URL + '/serverTime')
      .subscribe((response: {hour: number, minute: number, second: number, 'meridiem': string}) => {
        this.serverTime = response;
        this.serverTimeMillisecond = ((this.serverTime.hour * 3600) + (this.serverTime.minute * 60) + this.serverTime.second) * 1000;

        this.http.get(this.BASE_API_URL + '/dev/drawTimes/active').subscribe((response: ServerResponse) => {
          this.activeDrawTime = response.data;
          const x = this.activeDrawTime.endTime.split(':');
          // tslint:disable-next-line:radix
          this.activeTimeMillisecond = (((parseInt(String(x[0])) * 3600)  + (parseInt(String(x[1])) * 60) + parseInt(String(x[2]))) * 1000) + 500;
          this.differenceTime = this.activeTimeMillisecond - this.serverTimeMillisecond ;
        });

      });
  }


  getNextDraw(){
    return {...this.nextDrawId};
  }
  getNextDrawListener(){
    return this.nextDrawSubject.asObservable();
  }
}
