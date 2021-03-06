import { AfterViewInit, Component, Injector, ViewChild } from '@angular/core';
import { ReportComponent, ReportData } from './report/report.component';
import { Title } from '@angular/platform-browser';
import { ToastComponent } from './shared/components/toast/toast.component';
import { HttpService } from './shared/services/http.service';
import { CompareComponent } from './compare/compare.component';
import { Report } from './shared/interfaces/report';
declare var require: any;
const { version: appVersion } = require('../../package.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  injector!: Injector;
  appVersion: string;
  diffReports = { originalReport: {} as Report, runResultReport: {} as Report };
  LAST_TAB_INDEX = 3;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(CompareComponent) compareComponent!: CompareComponent;

  constructor(private inj: Injector, private titleService: Title, private httpService: HttpService) {
    this.appVersion = appVersion;
    this.titleService.setTitle('Ladybug - v' + this.appVersion);
  }

  ngAfterViewInit() {
    this.httpService.initializeToastComponent(this.toastComponent);
  }

  title = 'ladybug';
  active = 1;
  previousActive = 1;
  tabs: { key: string; value: any; id: string }[] = [];

  /**
   * Open an extra tab for the test report
   * @param data - the data in the report
   */
  openTestReport(data: any): void {
    const tabIndex: number = this.tabs.findIndex((tab) => tab.id === data.data.storageId);
    if (tabIndex != -1) {
      this.active = this.LAST_TAB_INDEX + tabIndex + 1;
    } else {
      this.injector = Injector.create({
        providers: [{ provide: ReportData, useValue: data.data }],
        parent: this.inj,
      });

      this.tabs.push({ key: data.name, value: ReportComponent, id: data.data.storageId });
      this.previousActive = this.active;
      this.active = this.LAST_TAB_INDEX + this.tabs.length; // Active the tab immediately
    }
  }

  openCompareReport(data: any): void {
    this.previousActive = this.active;
    this.active = this.LAST_TAB_INDEX;
    this.diffReports = data;
    setTimeout(() => {
      this.compareComponent.selectReportBasedOnIds();
    });
  }

  /**
   * Close the extra ta for the test report
   * @param event - mouse event
   * @param toRemove - the index of the report
   */
  closeTestReport(event: MouseEvent, toRemove: number): void {
    this.tabs.splice(toRemove, 1);
    this.active = this.previousActive;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
