import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

class Element {

  dynamicDownload: HTMLElement

  constructor() {
  }
}

@Component({
  selector: 'app-data-display',
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.css']
})
export class DataDisplayComponent implements OnInit {

  public spreadsheet_data: any
  public table_data: any[] = []
  public displayedColumns: any

  private setting = {
    element: new Element()
  }

  constructor(private router: Router) { }

  get_questions(): string[] {
    let questions = JSON.parse(localStorage.getItem('questions') as string)
    questions.splice(0, 0, 'URL')
    return questions
  }

  spreadsheet_to_table_data() {
    let tabledata: any[] = []
    let questions = this.get_questions()
    for (let row in this.spreadsheet_data) {
      let entry: any = {}
      for (let col in this.spreadsheet_data[row]) {
        let cell_entry: string = this.spreadsheet_data[row][col]
        //cell_entry = cell_entry.substring(1, cell_entry.length - 1)
        entry[questions[Number.parseInt(col)]] = cell_entry
      } 
      tabledata.push(entry)
    }
    this.table_data = tabledata
  }

  ngOnInit(): void {
    let spreadsheet = JSON.parse(localStorage.getItem('spreadsheet') as string)
    spreadsheet.splice(0, 1)
    this.spreadsheet_data = spreadsheet
    this.spreadsheet_to_table_data()
    let questions = this.get_questions()
    this.displayedColumns = questions
  }

  go_back() {
    this.router.navigateByUrl('')
  }

  download() {
    let spreadsheet_download_data = localStorage.getItem('download_data') as string
    this.dyanmicDownloadByHtmlTag({fileName: 'research_data.csv', text: spreadsheet_download_data})
  }

  private dyanmicDownloadByHtmlTag(arg: {
    fileName: string,
    text: string
  }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement('a');
    }
    const element = this.setting.element.dynamicDownload;
    const fileType = arg.fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
    element.setAttribute('download', arg.fileName);
    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }

}
