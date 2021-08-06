import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button'

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  @ViewChild('channel_id') channel_id_box: ElementRef
  @ViewChild('num_videos') num_videos_box: ElementRef
  @ViewChild('question_series') question_series: ElementRef
  public questions: string[] = []

  constructor(private router: Router, private renderer: Renderer2) { }

  ngOnInit(): void {

  }

  begin_research() {
    if (this.get_questions().length > 0) {
      if (isNaN(Number.parseInt(this.num_videos_box.nativeElement.value))) {
        alert('Number of videos must be in ant integer')
      } else {
        let channel_id = this.channel_id_box.nativeElement.value
        let num_videos = Number.parseInt(this.num_videos_box.nativeElement.value)
        localStorage.setItem('questions', JSON.stringify(this.get_questions()))
        this.router.navigate(['/research-tool', {channel_id: channel_id, num_videos: num_videos, si: true}])
      }
    } else {
      alert('You must add at least 1 question')
    }
  }

  add_question() {
    let child = this.renderer.createElement('input')
    let child2 = this.renderer.createElement('br')
    child.setAttribute( "type", "text");
    child.setAttribute('class', 'example-full-width')
    child.setAttribute('placeholder', 'Ex: Animation?')
    this.renderer.appendChild(this.question_series.nativeElement, child)
    this.renderer.appendChild(this.question_series.nativeElement, child2)
  }

  get_questions(): string[] {
    let children = this.question_series.nativeElement.children
    let questions: string[] = []
    for (let child of children) {
      if (child.tagName == 'INPUT') {
        questions.push(child.value)
      }
    }
    return questions
  }

}
