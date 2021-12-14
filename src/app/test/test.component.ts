import {Component, OnInit, EventEmitter, Output, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ToastComponent} from "../shared/components/toast/toast.component";
import {HttpService} from "../shared/services/http.service";
import {LoaderService} from "../shared/services/loader.service";
import {CloneModalComponent} from "../shared/components/modals/clone-modal/clone-modal.component";
import {TestSettingsModalComponent} from "../shared/components/modals/test-settings-modal/test-settings-modal.component";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit{
  reports: any[] = [];
  reranReports: any[] = [];
  reranReportsIndex: string[] = [];
  STORAGE_ID_INDEX = 5;
  NAME_INDEX = 2;
  TIMEOUT = 100;
  @Output() openTestReportEvent = new EventEmitter<any>();
  @Output() openCompareReportsEvent = new EventEmitter<any>();
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(CloneModalComponent) cloneModal!: CloneModalComponent;
  @ViewChild(TestSettingsModalComponent) testSettingsModal!: TestSettingsModalComponent;

  constructor(private httpService: HttpService, private loaderService: LoaderService) {}

  openCloneModal() {
    this.cloneModal.open();
  }

  openSettingsModal() {
    this.testSettingsModal.open()
  }

  ngOnInit(): void {
    if (!this.loaderService.isTestLoaded()) {
      this.loadData();
    } else {
      this.reports = this.loaderService.getTestReports();
      this.reranReports = this.loaderService.getReranReports();
      this.reranReportsIndex = this.loaderService.getReranReportsIndex();
      this.addCopiedReports();
    }
  }

  addCopiedReports() {
    this.httpService.getTestReports().subscribe({
      next: response => {
        const amountAdded = response.values.length - this.reports.length
        if (amountAdded > 0) {
          for (let i = this.reports.length; i <= response.values.length - 1; i++) {
            this.reports.push(response.values[i])
          }
        }
      }, error: () => {
        this.httpService.handleError('Could not retrieve data for test!')
      }
    })
  }

  ngOnDestroy() {
    console.log(this.reports)
    this.loaderService.saveTestSettings(this.reports, this.reranReports, this.reranReportsIndex)
  }

  /**
   * Load in the report data from testStorage
   */
  loadData(): void {
    this.httpService.getTestReports().subscribe({
      next: value => {
        this.reports = value.values
      }, error: () => {
        this.httpService.handleError('Could not retrieve data for test!')
      }
    })
  }

  /**
   * Reset the runner
   */
  resetRunner(): void {
    // @ts-ignore
    this.httpService.reset().subscribe()
  }

  /**
   * Run a test
   */
  run(reportId: string): void {
    const data: any = {}
    data['testStorage'] = [reportId]

    this.httpService.runReport(data).subscribe(() => {
      setTimeout(() => {
        this.queryResults()
      }, this.TIMEOUT)
    })
  }

  /**
   * Runs all tests
   */
  runAll(): void {
    const selectedReports = this.reports.filter(report => report.checked);
    let data: any = {}
    data['testStorage'] = []
    for (let i = 0; i < selectedReports.length; i++) {
      data['testStorage'].push(selectedReports[i][this.STORAGE_ID_INDEX])
    }

    this.httpService.runReport(data).subscribe(() => {
      setTimeout(() => {
        this.queryResults();
      }, this.TIMEOUT)
    })
  }

  /**
   * Query the results of the test run
   */
  queryResults(): void {
    this.httpService.queryResults().subscribe(response => {

      // Retrieve each report in the result runner
      for (let reportIndex in response.results) {
        if (response.results.hasOwnProperty(reportIndex)) {
          this.httpService.getReport(reportIndex).subscribe(report => {
            // See if the report element exist, where we will attach the results to
            const element = document.getElementById('testReport#' + reportIndex)
            if (element) {
              if (element.childElementCount > 5 && element.lastChild != null) {
                // element.removeChild(element.lastChild)
              }
              this.createResultElement(response.results, reportIndex, report)
              // element.appendChild(this.reranReports[this.reranReportsIndex.indexOf(reportIndex)].element)
            }
          })
        }
      }
    })
  }

  createResultElement(results: any, reportIndex: string, originalReport: any): void {
    const tdElement = document.createElement('td')
    const resultReport = results[reportIndex];
    tdElement.appendChild(document.createTextNode("("
      + resultReport['previous-time'] + "ms >> "
      + resultReport['current-time'] + "ms) ("
      + resultReport['stubbed'] + "/"
      + resultReport['total'] + " stubbed)"
    ))

    // If the reports are not equal, then a reportIndex color should be shown
    const color = originalReport == results[reportIndex].report ? 'green' : 'red'
    tdElement.setAttribute('style', 'color:' + color)

    // Make sure only 1 result is shown and they don't append
    const rerunIndex = this.reranReports.findIndex(x => x.original == reportIndex);
    if (rerunIndex !== -1) {
      this.reranReports.splice(rerunIndex, 1);
      this.reranReportsIndex.splice(rerunIndex, 1)
    }

    // Keep track of the reports that have been ran
     this.reranReports.push({original: reportIndex, reran: results[reportIndex].report.storageId, element: tdElement.innerHTML, color: color});
    this.reranReportsIndex.push(reportIndex)
  }

  /**
   * Selects the report to be displayed
   * @param storageId - the storageId of the report
   * @param name - the name of the report
   */
  selectReport(storageId: number, name: string): void {
    this.httpService.getReport(storageId.toString()).subscribe(data => {
      this.openTestReportEvent.emit({data: data, name: name})
    })
  }

  /**
   * Removes the selected reports
   */
  deleteSelected(): void {
    this.reports.map(report => {
      if (report.checked) {
        this.httpService.deleteReport(report[this.STORAGE_ID_INDEX]).subscribe()
      }
    })

    setTimeout(() => {
      this.loadData()
    }, this.TIMEOUT)
  }

  /**
   * Download selected reports
   * @param exportMessages - boolean whether to download messages
   * @param exportReports = boolean whether to download reports
   */
  downloadSelected(exportMessages: boolean, exportReports: boolean): void {
    const selectedReports = this.reports.filter(report => report.checked);
    let queryString = "?";
    for (let i = 0; i < selectedReports.length; i++) {
        queryString += "id=" + selectedReports[i][this.STORAGE_ID_INDEX] + "&"
    }
    window.open('api/report/download/testStorage/' + exportMessages + "/" + exportReports + queryString.slice(0, -1));

  }

  /**
   * Upload a report
   * @param event - the target file to upload
   */
  uploadReport(event: any): void {
    const file: File = event.target.files[0]
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      this.httpService.uploadReport(formData).subscribe(() => {
        this.loadData()
      })
    }
  }

  /**
   * Compare two reports with each other in compare tab
   * @param originalReport - the original report that will be compared to the new one
   */
  compareReports(originalReport: string): void {
    let index = this.reranReportsIndex.indexOf(originalReport);
    let newReport = this.reranReports[index].reran;
    this.openCompareReportsEvent.emit({oldReport: originalReport, newReport: newReport})
  }

  /**
   * Replace the original report
   * @param reportId - report that will be replaced
   */
  replaceReport(reportId: string): void {
    this.httpService.replaceReport(reportId).subscribe(() => {
      let index = this.reranReportsIndex.indexOf(reportId);
      this.reranReportsIndex.splice(index, 1);
      this.reranReports.splice(index, 1);
    })
  }

  /**
   * Toggle the checkbox
   * @param report - the report that is toggled
   */
  toggleCheck(report: any): void {
    report.checked = !report.checked
  }

  /**
   * Checks all checkboxes
   */
  checkAll(): void {
    this.reports.map(report => report.checked = true)
  }

  /**
   * Unchecks all checkboxes
   */
  uncheckAll(): void {
    this.reports.map(report => report.checked = false)
  }
}
