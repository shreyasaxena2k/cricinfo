let request=require("request");
let cheerio=require("cheerio");
let fs=require("fs");
let path=require("path");


let dirPath=path.join(__dirname,"ipl2020");
dirCreator(dirPath);
 let url="https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results";
request(url,cb);
function cb(err,response,html){
    if(err){
        console.log(err);
    }else{
        extractTeamData(html);
    }
}
function extractTeamData(html){
    let selTool=cheerio.load(html);
    let anchorArr=selTool(".col-md-8.col-16");
    for(let i=0;i<anchorArr.length;i++){
            //finding matchlinks
         let matchLink=selTool(anchorArr[i]).find("a.match-info-link-FIXTURES")
         let team1=selTool("a.match-info-link-FIXTURES")
         let matchLinks=selTool(matchLink).attr("href");
            let fullLink="https://www.espncricinfo.com"+matchLinks;
            getMatch(fullLink);
        }
}
function getMatch(fullLink){
    request(fullLink,cb);
    function cb(err,response,html){
        if(err){
            console.log(err);
        }else{
            PlayerStats(html);
        }
    }
}
function PlayerStats(html){
    let selTool=cheerio.load(html);
    let teamArr1=selTool(".match-info.match-info-MATCH p");
    let team1=selTool(teamArr1[0]).text();
    console.log("Team1 -> "+team1);
    let team1Path=path.join(dirPath,team1);
    dirCreator(team1Path);
    let team2=selTool(teamArr1[1]).text();
    console.log("Team2 -> "+team2);
    let team2Path=path.join(dirPath,team2);
    dirCreator(team2Path);
    console.log("`````````");
    let result=selTool(".match-info.match-info-MATCH .status-text").text();
    let date=selTool(".event .description").text();
    let teamArr=selTool(".table.batsman");
            let opposition="";
            let myTeam="";
            let teamPath="";
            for(let j=0;j<teamArr.length;j++){
                if(j==0){
                     opposition=team2;
                     myTeam=team1;
                    teamPath=team1Path;
                } else{
                     opposition=team1;
                     myTeam=team2;
                     teamPath=team2Path;
                }
                let playerRow=selTool(teamArr[j]).find("tr");
                for(let i=1;i<playerRow.length-4;i++){
                let statsArr=selTool(playerRow[i]).find("td");
                let playerName=selTool(statsArr[0]).text().trim();
                let runs=selTool(statsArr[2]).text();
               let balls=selTool(statsArr[3]).text();
               let fours=selTool(statsArr[5]).text();
               let sixes=selTool(statsArr[6]).text();
               let sr=selTool(statsArr[7]).text();
              let arr=[];
               arr.push({
                   Run:runs,
                   Ball:balls,
                   Four:fours,
                   Six:sixes,
                   StrikeRate:sr,
                   dateandVenue:date,
                   Results:result,
                   Opponent:opposition
               })
               let filePath=path.join(teamPath,playerName+".json");
               if(fs.existsSync(filePath)==false){
              fs.writeFileSync(filePath,JSON.stringify(arr));
               } else{
                   fs.appendFileSync(filePath,JSON.stringify(arr));
               } 
            }
        }   
}
 function dirCreator(dirpath) {
    if (fs.existsSync(dirpath) == false) {
        fs.mkdirSync(dirpath);
    }
}