import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

export class Researcher {

    http: HttpClient

    options = {
        host: 'www.googleapis.com',
        path: '/youtube/v3/channels?id=UCVHFbqXqoYvEWM1Ddxl0QDg&key=AIzaSyANsbooU6KWanTNs5rwSORMVmggL0VeIPw&part=contentDetails'
    }

    index = 0
    videos: any
    q_num = 0
    skipped_videos = 0
    video_limit = 10
    questions: string[] = []
    channel_id: string = ''
    spreadsheet: any[][]
    question_asker: (question: string, callback: (response: string) => void) => void
    video_displayer: (video_url: string) => void
    research_done = false

    constructor(https: HttpClient, question_asker: (question: string, callback: (response: string) => void) => void, video_displayer: (video_url: string) => void) {
        this.http = https
        this.question_asker = question_asker
        this.video_displayer = video_displayer
        this.spreadsheet = new Array(10).fill(0).map(() => new Array(this.questions.length + 1).fill(0));
    }

    downloadFile(data: any) {
        /**
        const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
        const header = Object.keys(data[0]);
        let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
        csv.unshift(header.join(','));
        let csvArray = csv.join('\r\n');
    
        var blob = new Blob([csvArray], {type: 'text/csv' })
        saveAs(blob, "myFile.csv");
         */
    }

    get_limitor() {
        let limitor = this.videos.items.length
        if (this.video_limit < this.videos.items.length) {
            limitor = this.video_limit
        }
        return limitor + 1
    }

    public array_to_spreadsheet(): any {
        var csvRows = [];
        for (var i = 0; i < (this.get_limitor() - this.skipped_videos); ++i) {
            for (var j = 0; j < this.spreadsheet[i].length; ++j) {
                this.spreadsheet[i][j] = '\"' + this.spreadsheet[i][j] + '\"';
            }
            csvRows.push(this.spreadsheet[i].join(','));
        }
        return csvRows.join('\r\n');
    }

    process_answer() {
        this.index += 1
        if (this.index < this.get_limitor() - 1) {
            this.ask_about_video()
        } else {
            for (let i = 0; i < this.skipped_videos; i++) {
                this.spreadsheet.pop()
            }
            this.research_done = true
        }
    }

    submit_answer(answer: string) {
        if (!(this.index + 1 >= this.spreadsheet.length)) {
            this.spreadsheet[this.index + 1 - this.skipped_videos][this.q_num + 1] = answer
            this.q_num += 1
            if (this.q_num < this.questions.length) {
                this.question_asker(this.questions[this.q_num], (answer) => {
                    this.submit_answer(answer)
                })
            } else {
                this.process_answer()
            }
        }
    }

    ask_about_video() {
        let url = this.videos.items[this.index].snippet.resourceId.videoId
        this.video_displayer(url)
        this.spreadsheet[this.index + 1 - this.skipped_videos][0] = 'https://www.youtube.com/watch?v=' + url
        this.q_num = 0
        this.question_asker(this.questions[this.q_num], (answer) => {
            this.submit_answer(answer)
        })
    }

    receive_video(obj: Object) {
        this.videos = obj
        let limitor = this.get_limitor()
        this.spreadsheet = new Array(limitor).fill(0).map(() => new Array(this.questions.length + 1).fill(0));
        this.spreadsheet[0][0] = ''
        for (let i = 1; i < this.questions.length + 1; i++) {
            this.spreadsheet[0][i] = this.questions[i - 1]
        }
        this.index = 0
        this.ask_about_video()
    }

    callback2(response2: any) {
        this.receive_video(response2)
    }

    receive_videos(obj: any) {
        if (obj.items == undefined) {
            console.log('invalid channel')
        } else {
            let uploads_playlist = obj.items[0].contentDetails.relatedPlaylists.uploads;
            let params = new HttpParams({
                fromString: 'orderBy="$key"&limitToFirst=1'
            });
            let res = this.http.get(
                'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=' + uploads_playlist + '&key=AIzaSyANsbooU6KWanTNs5rwSORMVmggL0VeIPw',
                {
                    responseType:"json",
                    params
                }).subscribe(val => this.callback2(val))
        }
    }

    callback(response: Object) {
        this.receive_videos(response)
    }

    set_video_limit(limit: number) {
        this.video_limit = limit
        let params = new HttpParams({
            fromString: 'orderBy="$key"&limitToFirst=1'
        });
        this.http.get(
            'https://www.googleapis.com/youtube/v3/channels?id=' + this.channel_id + '&key=AIzaSyANsbooU6KWanTNs5rwSORMVmggL0VeIPw&part=contentDetails', 
            {
                responseType:"json",
                params
            }).subscribe(val => this.callback(val))
    }

    research(channel_id: string, number_to_research: number, question_list: string[]) {
        this.channel_id = channel_id
        this.research_done = false
        this.questions = question_list
        this.set_video_limit(number_to_research)
    }

    get_spreadsheet(): any[][] {
        return this.spreadsheet
    }

    is_research_done() {
        return this.research_done
    }

    skip_video() {
        this.skipped_videos += 1
        for (let i = 0; i < this.questions.length + 1; i++) {
            this.spreadsheet[this.index + 1][i] = ''
        }
        this.process_answer()
    }

}