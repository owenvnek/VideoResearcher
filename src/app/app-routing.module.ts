import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataDisplayComponent } from './data-display/data-display.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ResearchToolComponent } from './research-tool/research-tool.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'research-tool', component: ResearchToolComponent },
  { path: 'data-display', component: DataDisplayComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
