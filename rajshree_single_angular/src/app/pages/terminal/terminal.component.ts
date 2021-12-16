import {Component, OnInit, Renderer2, ViewChild} from '@angular/core';
import {PlayGameService} from '../../services/play-game.service';
import {SingleNumber} from '../../models/SingleNumber.model';
import {CommonService} from '../../services/common.service';
import {ProjectData} from '../../models/project-data.model';
import {UserGameInput} from '../../models/userGameInput.model';
import * as cloneDeep from 'lodash/cloneDeep';
import {environment} from '../../../environments/environment';
import {AuthService} from '../../services/auth.service';
import {User} from '../../models/user.model';
import Swal from 'sweetalert2';
import {formatDate} from '@angular/common';
import {DrawTime} from '../../models/DrawTime.model';
import {NgxPrinterService, PrintItem} from 'ngx-printer';
import {GameInputSaveResponse} from '../../models/GameInputSaveResponse.model';
import {NgxPrintModule} from 'ngx-print';
import { GameResult } from 'src/app/models/GameResult.model';
import {CurrentGameResult} from '../../models/CurrentGameResult.model';
import {WatchDrawService} from '../../services/watch-draw.service';
import { NgxWheelComponent, TextAlignment, TextOrientation } from 'ngx-wheel';
import {NextDrawId} from '../../models/NextDrawId.model';
import {TodayLastResult} from '../../models/TodayLastResult.model';
import {ProgressSpinnerMode} from '@angular/material/progress-spinner';
import {ThemePalette} from '@angular/material/core';
import {GameType} from '../../models/GameType.model';
import {MatTableDataSource} from '@angular/material/table';
import {GameTypeService} from '../../services/game-type.service';


@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit {
  @ViewChild(NgxWheelComponent, { static: false }) wheel;
  seed = [...Array(10).keys()];
  idToLandOn: any;
  items: any[];
  textOrientation: TextOrientation = TextOrientation.HORIZONTAL;
  textAlignment: TextAlignment = TextAlignment.OUTER;

  // for progressbar
  value = 0;
  // color: ThemePalette = 'warn';
  color: ThemePalette = 'accent';

  projectData: ProjectData;
  remainingTime: number;
  alwaysTime: number;
  showDeveloperDiv = true;
  user: User;
  singleNumbers: SingleNumber[] = [];
  numberCombinationMatrix: SingleNumber[] = [];
  activeDrawTime: DrawTime;
  chips: number[] = [];
  gameTypes: GameType[] = [];
  userGameInput: any[] = [];
  public totalTicketPurchased: number;
  currentDateResult: CurrentGameResult;
  todayLastResult: TodayLastResult;
  nextDrawId: NextDrawId;

  customInput: number;

  columnNumber = 5;
  columnNumber2 = 8;
  columnNumber3 = 1;

  public activeTripleContainerValue = 0;
  public selectedChip = 10;
  public previousChip = 10;
  public selectedChipValue = 10;
  public counter = 0;
  copyNumberMatrix: SingleNumber[];
  copySingleNumber: SingleNumber[];
  isProduction = environment.production;
  showDevArea = false;
  currentDate: string;
  deviceXs: boolean;
  public lastPurchasedTicketDetails: GameInputSaveResponse;
  public lastPurchasedTicketSingle: {singleNumber: number, quantity: number}[];
  public lastPurchasedTicketTriple: {visibleTripleNumber: number, quantity: number, singleNumber: number}[];

  constructor(private playGameService: PlayGameService, private commonService: CommonService, private authService: AuthService,
              private ngxPrinterService: NgxPrinterService, private renderer: Renderer2, private watchDrawService: WatchDrawService,
              private gameTypeService: GameTypeService
  ) {

    // this.renderer.setStyle(document.body, 'background-image', ' url("assets/images/curtain.jpg")');
    // this.renderer.setStyle(document.body.firstChild., 'background-image', ' url("assets/images/curtain.jpg")');
    const layer = document.querySelector('.layer');
    this.renderer.setStyle(layer, 'background-color', ' rgba(255, 255, 255, 0)');
    // this.renderer.listen(hello, 'click', console.log);
    this.currentDate = this.commonService.getCurrentDate();
    this.deviceXs = this.commonService.deviceXs;

    this.playGameService.getTodayLastResultListener().subscribe(response => {
      this.todayLastResult = response;
    });

    this.watchDrawService.getNextDrawListener().subscribe((response: NextDrawId) => {
      this.nextDrawId = response;
      // if (this.todayLastResult !== undefined){
      //   console.log(this.todayLastResult.data);
      //   this.spin(this.todayLastResult.data.single_number).then(r => {});
      // }
      setTimeout(() => {
        if (this.todayLastResult !== undefined){
          this.wheel.reset();
          this.spin(this.todayLastResult.data.single_number).then(r => {});
        }
        }, 1000);
    });
    // this.spin(5).then(r => {console});
    this.gameTypes = this.gameTypeService.getGameType();
    this.gameTypeService.getGameTypeListener().subscribe((response: GameType[]) => {
      this.gameTypes = response;
      this.gameTypes = this.gameTypes.filter(x => x.gameTypeId === 1);
    });
    this.gameTypes = this.gameTypes.filter(x => x.gameTypeId === 1);
  }

  ngOnInit(): void {

    // let audio = new Audio();
    // audio.src = "sound/Wheel.wav";
    // audio.load();
    // audio.play();

    this.idToLandOn = this.seed[Math.floor(Math.random() * this.seed.length)];
    const colors = ['#FFA500', '#8B008B', '#FF1493', '#20B2AA', '#8B0000', '#00FF00', '#e0e000', '#0000FF', '#6A5ACD', '#cd5c5c'];
    this.items = this.seed.map((value) => ({
      fillStyle: colors[value % 10],
      text: `${value}`,
      id: value,
      textFillStyle: 'white',
      textFontSize: '40'
    }));



    this.renderer.setStyle(document.body, 'background-image', ' url("assets/images/background.jpg")');
    this.user = this.authService.userBehaviorSubject.value;
    this.numberCombinationMatrix = this.playGameService.getNumberCombinationMatrix();
    // this.numberCombinationMatrix  = JSON.parse(JSON.stringify(this.copyNumberMatrix));
    this.playGameService.getNumberCombinationMatrixListener().subscribe((response: SingleNumber[]) => {
      this.numberCombinationMatrix = response;
      this.copyNumberMatrix  = JSON.parse(JSON.stringify(this.numberCombinationMatrix));
    });

    // this.singleNumbers = this.playGameService.getSingleNumbers();
    this.singleNumbers = this.playGameService.getSingleNumbersFromDatabase();
    this.playGameService.getSingleNumberListener().subscribe((response: SingleNumber[]) => {
      this.singleNumbers = response;
      this.copySingleNumber = JSON.parse(JSON.stringify(this.singleNumbers));
    });

    this.commonService.currentTimeBehaviorSubject.asObservable().subscribe(response => {
      this.alwaysTime = response;
    });

    // variableSettings enabling
    this.projectData = this.commonService.getProjectData();
    this.chips = this.projectData.chips;
    this.commonService.getVariableSettingsListener().subscribe((response: ProjectData) => {
      this.projectData = response;
      this.chips = this.projectData.chips;
    });

    this.activeDrawTime = this.commonService.getActiveDrawTime();
    this.commonService.getActiveDrawTimeListener().subscribe((response: DrawTime) => {
        this.activeDrawTime = response;
    });
    this.currentDateResult = this.playGameService.getCurrentDateResult();
    this.playGameService.getCurrentDateResultListener().subscribe((response: CurrentGameResult) => {
      this.currentDateResult = response;
    });

    this.nextDrawId = this.watchDrawService.getNextDraw();

    this.commonService.remainingTimeBehaviorSubject.asObservable().subscribe(response => {
      this.remainingTime = response;
      // console.log(this.remainingTime);
      const x = String(this.remainingTime).split(':');
      // tslint:disable-next-line:radix
      const minToSec = parseInt(x[1]) * 60;
      // tslint:disable-next-line:radix
      const hourToSec = parseInt(x[0]) * 3600;
      // tslint:disable-next-line:radix
      const sec = parseInt(x[2]);
      const timeDiffMinToSec = this.activeDrawTime.time_diff * 60;
      // tslint:disable-next-line:radix
      this.value = ((hourToSec + minToSec + sec) / timeDiffMinToSec) * 100;
      // console.log(this.value);
    });


  }// end of ngOnIInit

  initializeValue(value){
    // if (this.selectedChip === 0 ){
    //   return;
    // }
    // if (this.selectedChipValue === 0){
    //   return;
    // }
    // value.quantity = (this.selectedChipValue / this.gameTypes[0].mrp);
    // this.selectedChip = 0;
    // this.selectedChipValue = 0;
    // this.counter = 0;
    // this.previousChip = 0;



    if (this.previousChip === 0){
      this.previousChip = value;
    }
    if (this.previousChip !== this.selectedChip){
      this.counter = 0;
    }
    if (this.selectedChip === 10 ){
      this.counter  = this.counter + 1;
      this.selectedChipValue = this.selectedChip * this.counter;
    }
    if (this.selectedChip === 20 ){
      this.counter  = this.counter + 1;
      this.selectedChipValue = this.selectedChip * this.counter;
    }
    if (this.selectedChip === 50 ){
      this.counter  = this.counter + 1;
      this.selectedChipValue = this.selectedChip * this.counter;
    }
    if (this.selectedChip === 100 ){
      this.counter  = this.counter + 1;
      this.selectedChipValue = this.selectedChip * this.counter;
    }

    console.log(value.quantity);
    if (value.quantity){
      value.quantity = value.quantity + (this.selectedChip / this.gameTypes[0].mrp);
    }else{
      value.quantity = (this.selectedChip / this.gameTypes[0].mrp);
    }



    this.setValue(value.quantity, value );

  }

  test1(value){

  }


  reset() {
    this.wheel.reset();
  }
  before() {
    console.log('Your wheel is about to spin');
  }

  async spin(prize) {
    this.idToLandOn = prize;
    await new Promise(resolve => setTimeout(resolve, 0));
    this.wheel.spin();
  }

  after() {
    console.log('You have been bamboozled');
  }



  isActiveTripleContainter(idxSingle: number) {
    // tslint:disable-next-line:triple-equals
    return this.activeTripleContainerValue == idxSingle;
  }

  setActiveTripleContainerValue(i: number) {
    this.activeTripleContainerValue = i;
  }

  setValue(points, value){
    const gameId = 1;
    // tslint:disable-next-line:radix
    this.customInput = parseInt(points) ;
    // this.setGameInputSet(value,1,1);

    let index = -1;

    if (gameId == 1){
      index = this.userGameInput.findIndex(x => x.singleNumberId === value.singleNumberId);
      // tslint:disable-next-line:triple-equals
    }else if (gameId == 2){
      index = this.userGameInput.findIndex(x => x.numberCombinationId === value.numberCombinationId);
    }

    // index = this.userGameInput.findIndex(x => x.singleNumberId === value.singleNumberId);
    if (index > -1){
      this.userGameInput[index].quantity = this.customInput;
      value.quantity = this.userGameInput[index].quantity;
      this.customInput = null;
    }else{
      const tempPlayDetails = {
        gameTypeId: 1,
        numberCombinationId: value.numberCombinationId,
        singleNumberId: value.singleNumberId,
        quantity: this.customInput,
        mrp: this.gameTypes[0].mrp
      };
      this.userGameInput.push(tempPlayDetails);
      value.quantity = this.customInput;
      this.customInput = null;
    }

    // this.totalTicketPurchased = this.userGameInput.map(a => a.quantity).reduce(function(a, b)
    // {
    //   // const x = this.gameTypes[0].mrp * ( a + b );
    //   return (a + b);
    // });

    let x = 0;
    this.userGameInput.forEach(function(value) {
      const tempQuantity = (value.quantity) ? (value.quantity) : 0;
      x = x + tempQuantity;
    });
    this.totalTicketPurchased = x;

    if (this.totalTicketPurchased){
      this.totalTicketPurchased = this.totalTicketPurchased * this.gameTypes[0].mrp;
    }else{
      this.totalTicketPurchased = null;
    }

  }

  setGameInputSet(value, idxSingle: number, gameId: number){
    // console.log();

    const numberWiseTotalQuantity = this.selectedChip;
    // tslint:disable-next-line:triple-equals
    let index = -1;
    // tslint:disable-next-line:triple-equals
    if (gameId == 1){
      index = this.userGameInput.findIndex(x => x.singleNumberId === value.singleNumberId);
      // tslint:disable-next-line:triple-equals
    }else if (gameId == 2){
      index = this.userGameInput.findIndex(x => x.numberCombinationId === value.numberCombinationId);
    }


    if (index > -1){
      this.userGameInput[index].quantity += this.selectedChip;
      value.quantity = this.userGameInput[index].quantity;
    }else{
        const tempPlayDetails = {
          gameTypeId: gameId,
          numberCombinationId: value.numberCombinationId,
          singleNumberId: value.singleNumberId,
          quantity: this.selectedChip,
          mrp: this.gameTypes[0].mrp
        };
        this.userGameInput.push(tempPlayDetails);
        value.quantity = this.selectedChip;
    }

    this.totalTicketPurchased = this.userGameInput.map(a => a.quantity).reduce(function(a, b)
    {
      return a + b;
    });
    if (this.totalTicketPurchased){
      this.totalTicketPurchased = this.totalTicketPurchased * this.gameTypes[0].mrp;
    }
  }

  changeChip(value){
    this.selectedChip = value;
    // if (this.previousChip === 0){
    //   this.previousChip = value;
    // }
    // if (this.previousChip !== this.selectedChip){
    //   this.counter = 0;
    // }
    // if (this.selectedChip === 10 ){
    //   this.counter  = this.counter + 1;
    //   this.selectedChipValue = this.selectedChip * this.counter;
    // }
    // if (this.selectedChip === 20 ){
    //   this.counter  = this.counter + 1;
    //   this.selectedChipValue = this.selectedChip * this.counter;
    // }
    // if (this.selectedChip === 50 ){
    //   this.counter  = this.counter + 1;
    //   this.selectedChipValue = this.selectedChip * this.counter;
    // }
    // if (this.selectedChip === 100 ){
    //   this.counter  = this.counter + 1;
    //   this.selectedChipValue = this.selectedChip * this.counter;
    // }
    // console.log(this.counter + ' ' + this.selectedChipValue);
  }

  resetMatrixValue(){
    this.userGameInput = [];
    this.singleNumbers = JSON.parse(JSON.stringify(this.copySingleNumber));
    this.totalTicketPurchased = 0;
  }

  printDiv() {
    this.ngxPrinterService.printOpenWindow = false;
    this.ngxPrinterService.printDiv('print-section');
    this.ngxPrinterService.printOpenWindow = false;
  }


  saveUserPlayInputDetails(){

    const user = JSON.parse(localStorage.getItem('user'));

    if (user.balance < 1){
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Low Balance',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    if (user.balance < this.totalTicketPurchased){
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Low Balance',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    // Swal.fire({
    //   title: 'Confirmation',
    //   text: 'Do you sure to buy ticket?',
    //   icon: 'info',
    //   showCancelButton: true,
    //   confirmButtonColor: '#3085d6',
    //   cancelButtonColor: '#d33',
    //   confirmButtonText: 'Yes, save It!'
    // }).then((result) => {
    //   if (result.isConfirmed){
    const masterData = {
          playMaster: {drawMasterId: this.activeDrawTime.drawId, terminalId: this.user.userId},
          playDetails: this.userGameInput
        };
    this.playGameService.saveUserPlayInputDetails(masterData).subscribe(response => {
          if (response.success === 1){
            this.lastPurchasedTicketDetails = response;
            this.lastPurchasedTicketSingle = this.lastPurchasedTicketDetails.data.game_input.single_game_data;
            this.lastPurchasedTicketTriple = this.lastPurchasedTicketDetails.data.game_input.triple_game_data;
            const responseData = response.data;
            // @ts-ignore
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Ticket purchased',
              showConfirmButton: false,
              timer: 1000
            });
            // updating terminal balance from here
            this.authService.setUserBalanceBy(responseData.play_master.terminal.balance);
            // console.log(responseData.play_master.terminal.balance);
            this.resetMatrixValue();

            // setTimeout(function() {
            //   document.getElementById('print-button').click();
            // }.bind(this), 3000);

          }else{
            Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: 'Validation error',
              showConfirmButton: false,
              timer: 3000
            });
          }
        }, (error) => {
          // when error occured
          console.log('data saving error', error);
        });
    //   }
    // });
  }
  // playAudio(){
  //   let audio = new Audio();
  //   audio.src = "../../../assets/audio/alarm.wav";
  //   audio.load();
  //   audio.play();
  // }
  // playAudio();


}
