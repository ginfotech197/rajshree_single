import { Component, OnInit } from '@angular/core';
import { CurrentGameResult } from 'src/app/models/CurrentGameResult.model';
import { ResultService } from 'src/app/services/result.service';
import {AuthService} from '../../../services/auth.service';
import {User} from '../../../models/user.model';


@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  currentDateResult: CurrentGameResult;

  currentDate: string;
  columnNumber = 5;
  columnNumber2 = 7;
  columnNumber3 = 1;
  public activeTripleContainerValue = 0;
  isAuthenticated = true;
  user: User;

  constructor(private resultService: ResultService, private authService: AuthService) {
      this.authService.userBehaviorSubject.asObservable().subscribe((response) => {
        this.user = response;
        if (this.user === null){
          this.isAuthenticated = false;
        }
        console.log(this.user);
      });
   }

  ngOnInit(): void {
    this.currentDateResult = this.resultService.getCurrentDateResult();
    this.resultService.getCurrentDateResultListener().subscribe((response: CurrentGameResult) => {
      this.currentDateResult = response;
    });
  }
  isActiveTripleContainter(idxSingle: number) {
    // tslint:disable-next-line:triple-equals
    return this.activeTripleContainerValue == idxSingle;
  }



}
