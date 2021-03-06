import { AfterViewInit, Component, Injectable, ViewChild } from '@angular/core';
import { TreeComponent } from '../shared/components/tree/tree.component';
import { DisplayComponent } from '../shared/components/display/display.component';
import { TreeNode } from '../shared/interfaces/tree-node';
import { Report } from '../shared/interfaces/report';

@Injectable()
export class ReportData {
  data: {} = {};
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements AfterViewInit {
  @ViewChild(TreeComponent) treeComponent!: TreeComponent;
  @ViewChild(DisplayComponent) displayComponent!: DisplayComponent;
  id: string = Math.random().toString(36).slice(7);

  constructor(public reportData: ReportData) {}

  /**
   Add a new report and notify the tree of the change
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.treeComponent?.handleChange(<Report>(<unknown>this.reportData));
    });
  }

  /**
   * Select a report to be viewed in the display
   * @param currentReport - the report to be viewed
   */
  selectReport(currentReport: TreeNode): void {
    this.displayComponent.closeReport(false, -1);
    setTimeout(() => {
      this.displayComponent.showReport(currentReport);
    }, 100);
  }

  savingReport(something: any) {
    let selectedNode = this.treeComponent?.treeSettings.selectedNode;
    this.treeComponent?.closeAll();
    this.treeComponent?.handleChange(something);
    this.treeComponent?.selectSpecificNode(selectedNode);
  }
}
